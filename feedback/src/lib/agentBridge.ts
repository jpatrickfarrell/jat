/**
 * Agent Bridge — connects page-agent core to the AgentPanel chat UI.
 *
 * Manages PageController + PageAgentCore lifecycle, converts agent events
 * to ChatMessage[], and provides execute/stop/dispose methods.
 */

import { PageAgentCore, PageController } from '../page-agent';
import type {
  AgentActivity,
  AgentStepEvent,
  ExecutionResult,
  PageAgentCoreConfig,
} from '../page-agent';
import type { ChatMessage, AgentState } from '../components/AgentPanel.svelte';

export interface AgentBridgeConfig {
  /** Proxy endpoint URL for LLM API calls (host app implements this) */
  proxyUrl: string;
  /** LLM model to use (default: 'gpt-4o') */
  model?: string;
  /** Max steps per command (default: 20) */
  maxSteps?: number;
  /** App-specific context instructions (from agent-context attribute) */
  appContext?: string;
  /** Callback when messages change */
  onMessagesChange: (messages: ChatMessage[]) => void;
  /** Callback when agent state changes */
  onStateChange: (state: AgentState, step: number) => void;
}

let nextMsgId = 0;
function msgId(): string {
  return `msg-${++nextMsgId}`;
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

  constructor(config: AgentBridgeConfig) {
    this.config = config;
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

    const agentConfig: PageAgentCoreConfig = {
      pageController: this.controller,
      baseURL: this.config.proxyUrl,
      apiKey: 'proxy', // Proxy handles auth server-side
      model: this.config.model || 'gpt-4o',
      maxSteps: this.config.maxSteps || 20,
      // Route LLM calls through the host app's proxy endpoint
      customFetch: this.createProxyFetch(),
    };

    // Add app-specific context if provided
    if (this.config.appContext) {
      agentConfig.instructions = {
        system: this.config.appContext,
      };
    }

    this.agent = new PageAgentCore(agentConfig);

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
   * Create a custom fetch that routes through the proxy endpoint.
   * The proxy receives standard OpenAI-format requests and forwards to the LLM.
   */
  private createProxyFetch(): typeof globalThis.fetch {
    const proxyUrl = this.config.proxyUrl;
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Rewrite the URL to use our proxy endpoint
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      // Extract the path after the base URL (e.g., /chat/completions)
      const pathMatch = url.match(/\/v1\/(.*)/);
      const path = pathMatch ? pathMatch[1] : 'chat/completions';

      const proxyTarget = proxyUrl.endsWith('/') ? proxyUrl + path : proxyUrl + '/' + path;

      return globalThis.fetch(proxyTarget, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init?.headers).entries()),
          'Content-Type': 'application/json',
        },
      });
    };
  }

  /** Handle real-time activity events from the agent */
  private handleActivity(activity: AgentActivity): void {
    switch (activity.type) {
      case 'thinking':
        this.config.onStateChange('thinking', this.currentStep);
        break;

      case 'executing':
        this.currentStep++;
        this.config.onStateChange('acting', this.currentStep);
        this.addMessage({
          id: msgId(),
          role: 'action',
          text: `${activity.tool}(${summarizeInput(activity.input)})`,
          tool: activity.tool,
          step: this.currentStep,
          timestamp: Date.now(),
        });
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
    if (!this.agent) return;

    // Add user message
    this.addMessage({
      id: msgId(),
      role: 'user',
      text: command,
      timestamp: Date.now(),
    });

    this.currentStep = 0;
    this.config.onStateChange('thinking', 0);

    try {
      const result: ExecutionResult = await this.agent.execute(command);

      // Add step reflections as thinking messages (from history)
      for (const event of result.history) {
        if (event.type === 'step') {
          const step = event as AgentStepEvent;
          if (step.reflection.next_goal) {
            // Only add if not already represented by activity events
            // The reflection provides the "why" behind actions
          }
        }
      }

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
      this.addMessage({
        id: msgId(),
        role: 'error',
        text: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now(),
      });
      this.config.onStateChange('error', this.currentStep);
    }

    this.config.onStateChange('idle', this.currentStep);
  }

  /** Stop the agent mid-execution */
  stop(): void {
    if (this.agent && this.agent.status === 'running') {
      this.agent.stop();
      this.addMessage({
        id: msgId(),
        role: 'error',
        text: 'Stopped by user.',
        timestamp: Date.now(),
      });
      this.config.onStateChange('idle', this.currentStep);
    }
  }

  /** Get current messages */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  /** Get max steps config */
  getMaxSteps(): number {
    return this.config.maxSteps || 20;
  }

  /** Dispose agent and controller */
  dispose(): void {
    this.disposed = true;
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
