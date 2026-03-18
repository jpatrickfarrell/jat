/**
 * Agent Bridge — connects page-agent core to the AgentPanel chat UI.
 *
 * Manages PageController + PageAgentCore lifecycle, converts agent events
 * to ChatMessage[], and provides execute/stop/dispose methods.
 *
 * Supports human-in-the-loop approval: DOM-modifying actions pause for
 * user approval before executing. Auto-approve mode skips the prompt.
 */

import { PageAgentCore, PageController, tool } from '../page-agent';
import type {
  AgentActivity,
  AgentStepEvent,
  ExecutionResult,
  PageAgentCoreConfig,
  PageAgentTool,
} from '../page-agent';
import type { ChatMessage, AgentState, AgentNote, ToolDefinition } from './types';
import { fetchNotes } from './api';
import { z } from 'zod/v4';

export interface AgentBridgeConfig {
  /** Proxy endpoint URL for LLM API calls (host app implements this) */
  proxyUrl: string;
  /** LLM model to use (default: 'claude-sonnet-4-6') */
  model?: string;
  /** Max steps per command (default: 20) */
  maxSteps?: number;
  /** App-specific context instructions (from agent-context attribute) */
  appContext?: string;
  /** Tools registered by the host page (via registerTools()) */
  registeredTools?: ToolDefinition[];
  /** Feedback endpoint URL (for fetching notes) */
  endpoint?: string;
  /** Project identifier (for fetching notes) */
  project?: string;
  /** Callback when messages change */
  onMessagesChange: (messages: ChatMessage[]) => void;
  /** Callback when agent state changes */
  onStateChange: (state: AgentState, step: number) => void;
}

/** Tools that require user approval before execution */
const APPROVAL_REQUIRED_TOOLS = new Set([
  'click_element_by_index',
  'input_text',
  'select_dropdown_option',
  'execute_javascript',
]);

let nextMsgId = 0;
function msgId(): string {
  return `msg-${++nextMsgId}`;
}

/** Human-readable descriptions for agent actions */
function describeAction(toolName: string, input: unknown): string {
  const inp = input as Record<string, unknown>;
  switch (toolName) {
    case 'click_element_by_index':
      return `Click element [${inp.index}]`;
    case 'input_text':
      return `Type "${truncate(String(inp.text || ''), 40)}" into element [${inp.index}]`;
    case 'select_dropdown_option':
      return `Select "${truncate(String(inp.text || ''), 40)}" in dropdown [${inp.index}]`;
    case 'execute_javascript':
      return `Run script: ${truncate(String(inp.script || ''), 60)}`;
    default:
      return `${toolName}(${summarizeInput(input)})`;
  }
}

/**
 * Creates and manages a page-agent instance that operates on the host page DOM.
 *
 * The widget lives in shadow DOM but the agent controls document.body.
 * The widget container should have data-page-agent-not-interactive to exclude
 * it from the agent's interactive element index.
 */
export class AgentBridge {
  private agent: PageAgentCore | null = null;
  private controller: PageController | null = null;
  private messages: ChatMessage[] = [];
  private currentStep = 0;
  private config: AgentBridgeConfig;
  private disposed = false;
  private stopped = false;
  private agentConfig: PageAgentCoreConfig | null = null;

  /** Cached notes from the backend */
  private notesCache: AgentNote[] | null = null;

  /** Whether to skip approval prompts */
  autoApprove = false;

  /** Pending approval resolvers keyed by message ID */
  private pendingApprovals = new Map<string, (approved: boolean) => void>();

  constructor(config: AgentBridgeConfig) {
    this.config = config;
  }

  /** Fetch notes from backend and cache them */
  private async loadNotes(): Promise<AgentNote[]> {
    if (this.notesCache !== null) return this.notesCache;
    if (!this.config.endpoint || !this.config.project) {
      this.notesCache = [];
      return this.notesCache;
    }
    const result = await fetchNotes(this.config.endpoint, this.config.project);
    this.notesCache = result.notes || [];
    return this.notesCache;
  }

  /** Build the combined system prompt from appContext + notes */
  private buildSystemPrompt(notes: AgentNote[]): string | undefined {
    const sections: string[] = [];

    if (this.config.appContext) {
      sections.push(`[Developer context]\n${this.config.appContext}`);
    }

    const siteWide = notes.filter((n) => n.route === null);
    if (siteWide.length > 0) {
      sections.push(`[Site-wide notes]\n${siteWide.map((n) => n.content).join('\n\n')}`);
    }

    return sections.length > 0 ? sections.join('\n\n') : undefined;
  }

  /** Get route-specific note content for a URL */
  private getRouteNotes(url: string): string | undefined {
    if (!this.notesCache || this.notesCache.length === 0) return undefined;
    try {
      const pathname = new URL(url).pathname;
      const routeNotes = this.notesCache.filter((n) => n.route !== null && n.route === pathname);
      if (routeNotes.length === 0) return undefined;
      return `[Page notes: ${pathname}]\n${routeNotes.map((n) => n.content).join('\n\n')}`;
    } catch {
      return undefined;
    }
  }

  /** Invalidate the notes cache so next execute() re-fetches */
  invalidateNotesCache(): void {
    this.notesCache = null;
  }

  /** Lazy-initialize controller and agent on first use */
  private init(): void {
    if (this.agent) return;

    // Target host page DOM (document.body), not the shadow DOM
    this.controller = new PageController({
      // Exclude the widget itself from interactive elements.
      // The widget root gets data-page-agent-not-interactive via JatFeedback.svelte,
      // and page-agent respects this attribute to skip elements during indexing.
    });

    const bridge = this;

    this.agentConfig = {
      pageController: this.controller,
      baseURL: this.config.proxyUrl,
      apiKey: 'proxy', // Proxy handles auth server-side
      model: this.config.model || 'claude-sonnet-4-6',
      maxSteps: this.config.maxSteps || 20,
      // Route LLM calls through the host app's proxy endpoint
      customFetch: this.createProxyFetch(),
      instructions: {
        // getPageInstructions is called before each step — returns route-specific notes
        getPageInstructions: (url: string) => bridge.getRouteNotes(url),
      },
      // Override DOM-modifying tools with approval-gated versions,
      // plus any host-page registered tools converted to PageAgentTool format
      customTools: {
        ...this.buildRegisteredCustomTools(),
        click_element_by_index: tool({
          description: 'Click element by index',
          inputSchema: z.object({ index: z.int().min(0) }),
          async execute(input) {
            const approved = await bridge.requestApproval('click_element_by_index', input);
            if (!approved) return '⏭️ Action skipped by user. Re-plan with a different approach.';
            const result = await this.pageController.clickElement(input.index);
            return result.message;
          },
        }),
        input_text: tool({
          description: 'Click and type text into an interactive input element',
          inputSchema: z.object({ index: z.int().min(0), text: z.string() }),
          async execute(input) {
            const approved = await bridge.requestApproval('input_text', input);
            if (!approved) return '⏭️ Action skipped by user. Re-plan with a different approach.';
            const result = await this.pageController.inputText(input.index, input.text);
            return result.message;
          },
        }),
        select_dropdown_option: tool({
          description: 'Select dropdown option for interactive element index by the text of the option you want to select',
          inputSchema: z.object({ index: z.int().min(0), text: z.string() }),
          async execute(input) {
            const approved = await bridge.requestApproval('select_dropdown_option', input);
            if (!approved) return '⏭️ Action skipped by user. Re-plan with a different approach.';
            const result = await this.pageController.selectOption(input.index, input.text);
            return result.message;
          },
        }),
        execute_javascript: tool({
          description: 'Execute JavaScript code on the current page. Supports async/await syntax. Use with caution!',
          inputSchema: z.object({ script: z.string() }),
          async execute(input) {
            const approved = await bridge.requestApproval('execute_javascript', input);
            if (!approved) return '⏭️ Action skipped by user. Re-plan with a different approach.';
            const result = await this.pageController.executeJavascript(input.script);
            return result.message;
          },
        }),
      },
    };

    this.agent = new PageAgentCore(this.agentConfig);

    // Listen to activity events for real-time UI feedback
    this.agent.addEventListener('activity', ((e: CustomEvent<AgentActivity>) => {
      this.handleActivity(e.detail);
    }) as EventListener);

    // Listen to status changes
    this.agent.addEventListener('statuschange', (() => {
      this.syncState();
    }) as EventListener);
  }

  /**
   * Request user approval for an action.
   * Returns true if approved, false if skipped.
   * Resolves immediately if autoApprove is enabled.
   */
  private async requestApproval(toolName: string, input: unknown): Promise<boolean> {
    if (this.autoApprove) return true;

    const id = msgId();
    const description = describeAction(toolName, input);

    this.addMessage({
      id,
      role: 'approval',
      text: description,
      tool: toolName,
      step: this.currentStep,
      timestamp: Date.now(),
      approvalStatus: 'pending',
    });

    this.config.onStateChange('awaiting_approval', this.currentStep);

    return new Promise<boolean>((resolve) => {
      this.pendingApprovals.set(id, resolve);
    });
  }

  /** Approve a pending action */
  approve(messageId: string): void {
    const resolve = this.pendingApprovals.get(messageId);
    if (!resolve) return;
    this.pendingApprovals.delete(messageId);
    this.updateMessageApproval(messageId, 'approved');
    this.config.onStateChange('acting', this.currentStep);
    resolve(true);
  }

  /** Skip a pending action */
  skip(messageId: string): void {
    const resolve = this.pendingApprovals.get(messageId);
    if (!resolve) return;
    this.pendingApprovals.delete(messageId);
    this.updateMessageApproval(messageId, 'skipped');
    this.config.onStateChange('thinking', this.currentStep);
    resolve(false);
  }

  /** Update approval status on an existing message */
  private updateMessageApproval(id: string, status: 'approved' | 'skipped'): void {
    this.messages = this.messages.map((msg) =>
      msg.id === id ? { ...msg, approvalStatus: status } : msg
    );
    this.config.onMessagesChange(this.messages);
  }

  /**
   * Convert registered ToolDefinitions to PageAgentTool format for customTools.
   *
   * PageAgentCore uses a MacroTool pattern: all tools are merged into a single
   * "AgentOutput" tool with a union action schema. The LLM picks an action per
   * step, the macro executor runs it, and the result feeds back on the next step.
   *
   * We register host page tools as customTools so they appear in the action union
   * and execute through the same loop — no separate tool_call interception needed.
   */
  private buildRegisteredCustomTools(): Record<string, PageAgentTool> {
    const tools = this.getRegisteredTools();
    const result: Record<string, PageAgentTool> = {};
    for (const t of tools) {
      // Include JSON Schema in description so the LLM knows the parameter shape.
      // The inputSchema uses z.record(z.any()) as a permissive pass-through —
      // the LLM is guided by the description, not the Zod schema.
      const paramDesc = JSON.stringify(t.parameters);
      result[t.name] = tool({
        description: `${t.description}\nParameters: ${paramDesc}`,
        inputSchema: z.record(z.string(), z.any()),
        async execute(input) {
          try {
            const value = await t.handler(input as Record<string, unknown>);
            return typeof value === 'string' ? value : JSON.stringify(value);
          } catch (err) {
            return `Error: ${err instanceof Error ? err.message : String(err)}`;
          }
        },
      });
    }
    return result;
  }

  private createProxyFetch(): typeof globalThis.fetch {
    const proxyUrl = this.config.proxyUrl;
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Rewrite the URL to use our proxy endpoint
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      // Extract the path after the base URL (e.g., /chat/completions)
      const pathMatch = url.match(/\/v1\/(.*)/);
      const path = pathMatch ? pathMatch[1] : 'chat/completions';

      const proxyTarget = proxyUrl.endsWith('/') ? proxyUrl + path : proxyUrl + '/' + path;

      // Add timeout (60s default — LLM calls can be slow)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);

      let response: Response;
      try {
        response = await globalThis.fetch(proxyTarget, {
          ...init,
          signal: controller.signal,
          headers: {
            ...Object.fromEntries(new Headers(init?.headers).entries()),
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        clearTimeout(timeout);
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw new Error('Agent proxy request timed out. The server may be overloaded — try again.');
        }
        throw new Error(`Cannot reach agent proxy at ${proxyUrl}. Check that your server is running.`);
      }
      clearTimeout(timeout);

      if (!response.ok) {
        const status = response.status;
        let detail = '';
        try { detail = await response.text(); } catch { /* ignore */ }

        if (status === 401 || status === 403) {
          throw new Error('Agent proxy returned 401 Unauthorized. Check that the server has a valid API key configured.');
        }
        if (status === 429) {
          throw new Error('Agent proxy rate limited (429). Too many requests — wait a moment and try again.');
        }
        if (status >= 500) {
          throw new Error(`Agent proxy server error (${status}). ${detail ? detail.slice(0, 200) : 'Check server logs for details.'}`);
        }
        throw new Error(`Agent proxy error (${status}): ${detail ? detail.slice(0, 200) : 'Unknown error'}`);
      }

      return response;
    };
  }

  /** Handle real-time activity events from the agent */
  private handleActivity(activity: AgentActivity): void {
    // Suppress all activity events after user-initiated stop
    if (this.stopped) return;

    switch (activity.type) {
      case 'thinking':
        this.config.onStateChange('thinking', this.currentStep);
        break;

      case 'executing':
        this.currentStep++;
        // For approval-gated tools, the approval message is already shown.
        // Only show action message for non-approval tools.
        if (!APPROVAL_REQUIRED_TOOLS.has(activity.tool)) {
          this.config.onStateChange('acting', this.currentStep);
          this.addMessage({
            id: msgId(),
            role: 'action',
            text: `${activity.tool}(${summarizeInput(activity.input)})`,
            tool: activity.tool,
            step: this.currentStep,
            timestamp: Date.now(),
          });
        }
        break;

      case 'executed':
        this.addMessage({
          id: msgId(),
          role: 'result',
          text: truncate(activity.output, 200),
          tool: activity.tool,
          duration: activity.duration,
          step: this.currentStep,
          timestamp: Date.now(),
        });
        break;

      case 'retrying':
        this.addMessage({
          id: msgId(),
          role: 'thinking',
          text: `Retrying (${activity.attempt}/${activity.maxAttempts})...`,
          timestamp: Date.now(),
        });
        break;

      case 'error':
        this.addMessage({
          id: msgId(),
          role: 'error',
          text: activity.message,
          timestamp: Date.now(),
        });
        this.config.onStateChange('error', this.currentStep);
        break;
    }
  }

  /** Sync state from agent status */
  private syncState(): void {
    if (!this.agent) return;
    const status = this.agent.status;
    switch (status) {
      case 'idle':
      case 'completed':
        this.config.onStateChange('idle', this.currentStep);
        break;
      case 'running':
        // Activity events handle thinking/acting transitions
        break;
      case 'error':
        this.config.onStateChange('error', this.currentStep);
        break;
    }
  }

  /** Add a message and notify listener */
  private addMessage(msg: ChatMessage): void {
    this.messages = [...this.messages, msg];
    this.config.onMessagesChange(this.messages);
  }

  /** Execute a user command */
  async execute(command: string): Promise<void> {
    if (this.disposed) return;

    this.init();
    if (!this.agent || !this.agentConfig) return;

    // Fetch notes (uses cache if available) and update system prompt
    const notes = await this.loadNotes();
    this.agentConfig.instructions!.system = this.buildSystemPrompt(notes);

    // Add user message
    this.addMessage({
      id: msgId(),
      role: 'user',
      text: command,
      timestamp: Date.now(),
    });

    this.currentStep = 0;
    this.stopped = false;
    this.config.onStateChange('thinking', 0);

    try {
      const result: ExecutionResult = await this.agent.execute(command);

      // If stopped by user during execution, don't show completion messages
      if (this.stopped) return;

      // Final result message
      if (result.success) {
        this.addMessage({
          id: msgId(),
          role: 'result',
          text: result.data || 'Task completed successfully.',
          timestamp: Date.now(),
        });
      } else {
        this.addMessage({
          id: msgId(),
          role: 'error',
          text: result.data || 'Task failed.',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      // If stopped by user, the stop() method already showed "Stopped by user" — don't add more errors
      if (this.stopped) return;

      // Check for AbortError (user clicked stop while fetch was in-flight)
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
        || (err instanceof Error && err.message === 'AbortError');
      if (isAbort) {
        this.addMessage({
          id: msgId(),
          role: 'info',
          text: 'Stopped by user.',
          timestamp: Date.now(),
        });
        this.config.onStateChange('idle', this.currentStep);
        return;
      }

      this.addMessage({
        id: msgId(),
        role: 'error',
        text: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now(),
      });
      this.config.onStateChange('error', this.currentStep);
      return;
    }

    this.config.onStateChange('idle', this.currentStep);
  }

  /** Stop the agent mid-execution */
  stop(): void {
    this.stopped = true;

    // Reject any pending approvals
    for (const [id, resolve] of this.pendingApprovals) {
      this.updateMessageApproval(id, 'skipped');
      resolve(false);
    }
    this.pendingApprovals.clear();

    if (this.agent && this.agent.status === 'running') {
      this.agent.stop();
    }

    this.addMessage({
      id: msgId(),
      role: 'info',
      text: 'Stopped by user.',
      timestamp: Date.now(),
    });
    this.config.onStateChange('idle', this.currentStep);
  }

  /** Get current messages */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  /** Get max steps config */
  getMaxSteps(): number {
    return this.config.maxSteps || 20;
  }

  /** Get tools registered by the host page (for forwarding to LLM proxy in task .2) */
  getRegisteredTools(): ToolDefinition[] {
    return this.config.registeredTools || [];
  }

  /** Dispose agent and controller */
  dispose(): void {
    this.disposed = true;
    // Reject pending approvals
    for (const [, resolve] of this.pendingApprovals) {
      resolve(false);
    }
    this.pendingApprovals.clear();

    if (this.agent) {
      this.agent.dispose();
      this.agent = null;
    }
    if (this.controller) {
      this.controller.dispose();
      this.controller = null;
    }
  }
}

/** Summarize tool input for display */
function summarizeInput(input: unknown): string {
  if (input == null) return '';
  if (typeof input === 'string') return truncate(input, 60);
  if (typeof input === 'number' || typeof input === 'boolean') return String(input);
  try {
    const s = JSON.stringify(input);
    return truncate(s, 80);
  } catch {
    return '...';
  }
}

/** Truncate string with ellipsis */
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}
