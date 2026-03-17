<script lang="ts">
  /**
   * AgentPanel — Chat UI for page-agent interaction.
   *
   * Events emitted:
   *   onsend(text)       — user submits a command
   *   onstop()           — user clicks stop button
   *   onapprove(msgId)   — user approves a pending action
   *   onskip(msgId)      — user skips a pending action
   *   onautoapprovechange(value) — user toggles auto-approve
   */

  import type { ChatMessage, AgentState, MessageRole } from '../lib/types';

  let {
    messages = [],
    agentState = 'idle',
    currentStep = 0,
    maxSteps = 40,
    autoApprove = false,
    onsend,
    onstop,
    onapprove,
    onskip,
    onautoapprovechange,
  }: {
    messages?: ChatMessage[];
    agentState?: AgentState;
    currentStep?: number;
    maxSteps?: number;
    autoApprove?: boolean;
    onsend?: (text: string) => void;
    onstop?: () => void;
    onapprove?: (messageId: string) => void;
    onskip?: (messageId: string) => void;
    onautoapprovechange?: (value: boolean) => void;
  } = $props();

  let inputText = $state('');
  let messagesContainer = $state<HTMLDivElement | undefined>();

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (messages.length && messagesContainer) {
      requestAnimationFrame(() => {
        messagesContainer!.scrollTop = messagesContainer!.scrollHeight;
      });
    }
  });

  function handleSend() {
    const text = inputText.trim();
    if (!text || agentState === 'thinking' || agentState === 'acting') return;
    inputText = '';
    onsend?.(text);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && (agentState === 'thinking' || agentState === 'acting')) {
      onstop?.();
    }
  }

  function handleStop() {
    onstop?.();
  }

  const isRunning = $derived(
    agentState === 'thinking' || agentState === 'acting' || agentState === 'awaiting_approval'
  );

  // Role icons and labels
  function roleIcon(role: MessageRole): string {
    switch (role) {
      case 'user': return '›';
      case 'thinking': return '…';
      case 'action': return '⚡';
      case 'result': return '✓';
      case 'error': return '✕';
      case 'approval': return '?';
    }
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
</script>

<div class="agent-panel">
  <!-- Status bar -->
  <div class="status-bar">
    <div class="status-indicator" class:idle={agentState === 'idle'} class:thinking={agentState === 'thinking'} class:acting={agentState === 'acting'} class:awaiting={agentState === 'awaiting_approval'} class:error={agentState === 'error'}>
      <span class="status-dot"></span>
      <span class="status-text">
        {#if agentState === 'idle'}
          Ready
        {:else if agentState === 'thinking'}
          Thinking...
        {:else if agentState === 'acting'}
          Acting...
        {:else if agentState === 'awaiting_approval'}
          Awaiting approval
        {:else}
          Error
        {/if}
      </span>
    </div>
    <div class="status-right">
      {#if currentStep > 0}
        <span class="step-counter">Step {currentStep}/{maxSteps}</span>
      {/if}
      <label class="auto-approve-toggle" title="Auto-approve all actions">
        <input
          type="checkbox"
          checked={autoApprove}
          onchange={(e) => onautoapprovechange?.((e.target as HTMLInputElement).checked)}
        />
        <span class="toggle-label">Auto</span>
      </label>
    </div>
  </div>

  <!-- Message list -->
  <div class="messages" bind:this={messagesContainer}>
    {#if messages.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" opacity="0.3"/>
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <p class="empty-text">Tell the agent what to do on this page</p>
        <p class="empty-hint">e.g. "Fill in the contact form" or "Click the sign up button"</p>
      </div>
    {:else}
      {#each messages as msg (msg.id)}
        {#if msg.role === 'approval'}
          <!-- Approval message with action buttons -->
          <div class="message msg-approval" class:pending={msg.approvalStatus === 'pending'} class:approved={msg.approvalStatus === 'approved'} class:skipped={msg.approvalStatus === 'skipped'}>
            <span class="msg-icon">
              {#if msg.approvalStatus === 'approved'}
                ✓
              {:else if msg.approvalStatus === 'skipped'}
                ⏭
              {:else}
                ?
              {/if}
            </span>
            <div class="msg-body">
              {#if msg.tool}
                <span class="msg-tool">{msg.tool}</span>
              {/if}
              <span class="msg-text">{msg.text}</span>
              {#if msg.approvalStatus === 'pending'}
                <div class="approval-buttons">
                  <button class="approve-btn" onclick={() => onapprove?.(msg.id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Approve
                  </button>
                  <button class="skip-btn" onclick={() => onskip?.(msg.id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    Skip
                  </button>
                </div>
              {:else}
                <span class="approval-badge" class:badge-approved={msg.approvalStatus === 'approved'} class:badge-skipped={msg.approvalStatus === 'skipped'}>
                  {msg.approvalStatus}
                </span>
              {/if}
            </div>
            {#if msg.step}
              <span class="msg-step">{msg.step}</span>
            {/if}
          </div>
        {:else}
          <!-- Standard message -->
          <div class="message msg-{msg.role}">
            <span class="msg-icon">{roleIcon(msg.role)}</span>
            <div class="msg-body">
              {#if msg.role === 'action' && msg.tool}
                <span class="msg-tool">{msg.tool}</span>
              {/if}
              <span class="msg-text">{msg.text}</span>
              {#if msg.duration != null}
                <span class="msg-duration">{formatDuration(msg.duration)}</span>
              {/if}
            </div>
            {#if msg.step}
              <span class="msg-step">{msg.step}</span>
            {/if}
          </div>
        {/if}
      {/each}

      <!-- Live thinking indicator -->
      {#if agentState === 'thinking'}
        <div class="message msg-thinking live">
          <span class="msg-icon">…</span>
          <div class="msg-body">
            <span class="thinking-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Input area -->
  <div class="input-area">
    {#if isRunning}
      <button class="stop-btn" onclick={handleStop} aria-label="Stop agent">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1"/>
        </svg>
        Stop
      </button>
    {/if}
    <div class="input-row">
      <input
        type="text"
        class="chat-input"
        bind:value={inputText}
        onkeydown={handleKeydown}
        placeholder={isRunning ? 'Agent is working...' : 'Type a command...'}
        disabled={isRunning}
      />
      <button
        class="send-btn"
        onclick={handleSend}
        disabled={isRunning || !inputText.trim()}
        aria-label="Send"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .agent-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    font-family: inherit;
    color: #e5e7eb;
  }

  /* Status bar */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #1f2937;
    flex-shrink: 0;
  }
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .status-indicator.idle .status-dot { background: #6b7280; }
  .status-indicator.idle .status-text { color: #9ca3af; }
  .status-indicator.thinking .status-dot {
    background: #f59e0b;
    animation: pulse-dot 1.2s ease-in-out infinite;
  }
  .status-indicator.thinking .status-text { color: #fcd34d; }
  .status-indicator.acting .status-dot {
    background: #3b82f6;
    animation: pulse-dot 1.2s ease-in-out infinite;
  }
  .status-indicator.acting .status-text { color: #93c5fd; }
  .status-indicator.awaiting .status-dot {
    background: #a855f7;
    animation: pulse-dot 1.2s ease-in-out infinite;
  }
  .status-indicator.awaiting .status-text { color: #c4b5fd; }
  .status-indicator.error .status-dot { background: #ef4444; }
  .status-indicator.error .status-text { color: #f87171; }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .step-counter {
    font-size: 11px;
    color: #6b7280;
    font-variant-numeric: tabular-nums;
  }

  /* Auto-approve toggle */
  .auto-approve-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 11px;
    color: #6b7280;
    user-select: none;
  }
  .auto-approve-toggle input {
    width: 14px;
    height: 14px;
    margin: 0;
    accent-color: #a855f7;
    cursor: pointer;
  }
  .toggle-label {
    white-space: nowrap;
  }

  /* Messages */
  .messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0;
  }
  .messages::-webkit-scrollbar {
    width: 4px;
  }
  .messages::-webkit-scrollbar-track {
    background: transparent;
  }
  .messages::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 2px;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 8px;
  }
  .empty-icon {
    color: #374151;
    margin-bottom: 4px;
  }
  .empty-text {
    font-size: 13px;
    color: #9ca3af;
    text-align: center;
    margin: 0;
  }
  .empty-hint {
    font-size: 11px;
    color: #6b7280;
    text-align: center;
    margin: 0;
  }

  /* Message bubbles */
  .message {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 12px;
    font-size: 13px;
    line-height: 1.4;
  }
  .msg-icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    margin-top: 1px;
  }
  .msg-body {
    flex: 1;
    min-width: 0;
  }
  .msg-text {
    word-break: break-word;
  }
  .msg-step {
    flex-shrink: 0;
    font-size: 10px;
    color: #4b5563;
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  }

  /* User messages */
  .msg-user {
    background: #1f2937;
    border-radius: 6px;
    margin: 2px 8px;
    padding: 8px 12px;
  }
  .msg-user .msg-icon {
    color: #3b82f6;
    font-size: 16px;
    font-weight: 700;
  }
  .msg-user .msg-text {
    color: #f9fafb;
  }

  /* Thinking messages */
  .msg-thinking .msg-icon {
    color: #f59e0b;
  }
  .msg-thinking .msg-text {
    color: #d1d5db;
    font-style: italic;
  }

  /* Action messages */
  .msg-action .msg-icon {
    color: #3b82f6;
  }
  .msg-action .msg-text {
    color: #d1d5db;
  }
  .msg-tool {
    display: inline-block;
    padding: 1px 6px;
    background: #1e3a5f;
    border-radius: 3px;
    font-size: 11px;
    font-family: monospace;
    color: #60a5fa;
    margin-right: 6px;
  }
  .msg-duration {
    font-size: 10px;
    color: #6b7280;
    margin-left: 6px;
  }

  /* Result messages */
  .msg-result .msg-icon {
    color: #10b981;
  }
  .msg-result .msg-text {
    color: #d1d5db;
  }

  /* Error messages */
  .msg-error {
    background: rgba(239, 68, 68, 0.08);
    border-radius: 6px;
    margin: 2px 8px;
    padding: 8px 12px;
  }
  .msg-error .msg-icon {
    color: #ef4444;
  }
  .msg-error .msg-text {
    color: #f87171;
  }

  /* Approval messages */
  .msg-approval {
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 6px;
    margin: 4px 8px;
    padding: 8px 12px;
  }
  .msg-approval.pending {
    border-color: rgba(168, 85, 247, 0.4);
    animation: approval-pulse 2s ease-in-out infinite;
  }
  .msg-approval.approved {
    background: rgba(16, 185, 129, 0.06);
    border-color: rgba(16, 185, 129, 0.2);
  }
  .msg-approval.skipped {
    background: rgba(107, 114, 128, 0.06);
    border-color: rgba(107, 114, 128, 0.2);
    opacity: 0.7;
  }
  .msg-approval .msg-icon {
    color: #a855f7;
  }
  .msg-approval.approved .msg-icon {
    color: #10b981;
  }
  .msg-approval.skipped .msg-icon {
    color: #6b7280;
  }
  .msg-approval .msg-text {
    color: #e5e7eb;
  }
  .msg-approval .msg-tool {
    background: #2e1065;
    color: #c4b5fd;
  }

  @keyframes approval-pulse {
    0%, 100% { border-color: rgba(168, 85, 247, 0.4); }
    50% { border-color: rgba(168, 85, 247, 0.15); }
  }

  .approval-buttons {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
  .approve-btn, .skip-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }
  .approve-btn {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
  }
  .approve-btn:hover {
    background: rgba(16, 185, 129, 0.25);
  }
  .skip-btn {
    background: rgba(107, 114, 128, 0.15);
    border: 1px solid rgba(107, 114, 128, 0.3);
    color: #9ca3af;
  }
  .skip-btn:hover {
    background: rgba(107, 114, 128, 0.25);
  }

  .approval-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }
  .badge-approved {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }
  .badge-skipped {
    background: rgba(107, 114, 128, 0.15);
    color: #9ca3af;
  }

  /* Live thinking indicator */
  .message.live {
    opacity: 0.7;
  }
  .thinking-dots {
    display: inline-flex;
    gap: 3px;
    padding: 4px 0;
  }
  .thinking-dots .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #f59e0b;
    animation: dot-bounce 1.4s ease-in-out infinite;
  }
  .thinking-dots .dot:nth-child(2) { animation-delay: 0.16s; }
  .thinking-dots .dot:nth-child(3) { animation-delay: 0.32s; }

  @keyframes dot-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* Input area */
  .input-area {
    flex-shrink: 0;
    padding: 8px 12px 12px;
    border-top: 1px solid #1f2937;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .input-row {
    display: flex;
    gap: 6px;
  }
  .chat-input {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid #374151;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: #e5e7eb;
    background: #1f2937;
    transition: border-color 0.15s;
  }
  .chat-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  .chat-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chat-input::placeholder {
    color: #6b7280;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .send-btn:hover:not(:disabled) { background: #2563eb; }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .stop-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid #ef4444;
    border-radius: 6px;
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }
  .stop-btn:hover {
    background: rgba(239, 68, 68, 0.2);
  }
</style>
