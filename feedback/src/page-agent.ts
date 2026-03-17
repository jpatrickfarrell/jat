// page-agent barrel export for AgentPanel integration
// Import from this file instead of @page-agent/* directly
// Tree-shaken: only bundled when actually imported by a component

export { PageAgentCore, tool } from '@page-agent/core';
export type {
  PageAgentCoreConfig,
  AgentStatus,
  AgentStepEvent,
  ExecutionResult,
  HistoricalEvent,
  PageAgentTool
} from '@page-agent/core';

export { PageController } from '@page-agent/page-controller';
export type { PageControllerConfig, BrowserState } from '@page-agent/page-controller';
