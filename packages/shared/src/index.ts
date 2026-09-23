/**
 * @axiom/shared - Foundational domain types, execution states, and IPC contracts.
 */

export type ExecutionState =
  | 'IDLE'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'THINKING'
  | 'PLANNING'
  | 'WAITING_FOR_PERMISSION'
  | 'EXECUTING'
  | 'OBSERVING'
  | 'VERIFYING'
  | 'RECOVERING'
  | 'SPEAKING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type RiskTier =
  | 'SAFE'
  | 'LOW_RISK'
  | 'CONFIRMATION_REQUIRED'
  | 'DANGEROUS';

export interface ActionContext {
  toolName: string;
  parameters: Record<string, unknown>;
  targetPath?: string;
  explanation: string;
  expectedChange?: string;
  tier: RiskTier;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface VerificationResult {
  verified: boolean;
  evidence: string;
  discrepancy?: string;
  suggestedAction?: 'retry' | 'abort' | 'escalate';
}

export interface PlanStep {
  id: string;
  index: number;
  title: string;
  toolName: string;
  parameters: Record<string, unknown>;
  tier: RiskTier;
  requiresConfirmation: boolean;
  status: StepStatus;
  explanation: string;
  result?: unknown;
  verification?: VerificationResult;
  error?: string;
  durationMs?: number;
}

export interface AgentPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  createdAt: number;
  completedAt?: number;
  status: 'planning' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface SystemMetrics {
  timestamp: number;
  cpuUsagePercent: number;
  totalMemoryMB: number;
  usedMemoryMB: number;
  freeMemoryMB: number;
  gpuName: string;
  totalVramMB: number;
  usedVramMB: number;
  storageTotalGB: number;
  storageUsedGB: number;
  ollamaRunning: boolean;
  activeModel?: string;
  voiceActive: boolean;
  browserActive: boolean;
  networkState: 'online' | 'offline' | 'degraded';
}

export interface MemoryEntry {
  id: string;
  category: 'conversation' | 'preference' | 'project' | 'fact' | 'task' | 'temporary_context';
  key: string;
  value: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TaskItem {
  id: string;
  name: string;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  progressPercent: number;
  currentAction?: string;
  logs: string[];
  error?: string;
  scheduledFor?: number;
}

export interface RegisteredApplication {
  id: string;
  name: string;
  executable: string;
  status: 'registered' | 'enabled' | 'disabled' | 'restricted';
  capabilities: string[];
  launchMethod: 'path' | 'uri' | 'command';
  allowedOperations: string[];
}

export const IPC_CHANNELS = {
  // Agent & Execution
  AGENT_START_GOAL: 'axiom:agent:start-goal',
  AGENT_CANCEL: 'axiom:agent:cancel',
  AGENT_STATE_CHANGE: 'axiom:agent:state-change',
  AGENT_PLAN_UPDATE: 'axiom:agent:plan-update',
  AGENT_STEP_UPDATE: 'axiom:agent:step-update',
  AGENT_MESSAGE: 'axiom:agent:message',

  // Permissions
  PERMISSION_REQUEST: 'axiom:permission:request',
  PERMISSION_RESPONSE: 'axiom:permission:response',

  // System & Hardware
  SYSTEM_GET_METRICS: 'axiom:system:get-metrics',
  SYSTEM_METRICS_STREAM: 'axiom:system:metrics-stream',
  SYSTEM_DIAGNOSTICS: 'axiom:system:diagnostics',

  // Models & Ollama
  MODELS_LIST: 'axiom:models:list',
  MODELS_SELECT: 'axiom:models:select',
  MODELS_HEALTH: 'axiom:models:health',

  // Memory
  MEMORY_QUERY: 'axiom:memory:query',
  MEMORY_STORE: 'axiom:memory:store',
  MEMORY_DELETE: 'axiom:memory:delete',

  // Tasks
  TASKS_LIST: 'axiom:tasks:list',
  TASKS_CREATE: 'axiom:tasks:create',
  TASKS_CANCEL: 'axiom:tasks:cancel',

  // Applications
  APPS_LIST: 'axiom:apps:list',
  APPS_LAUNCH: 'axiom:apps:launch',

  // Voice
  VOICE_STATE_CHANGE: 'axiom:voice:state-change',
  VOICE_TOGGLE: 'axiom:voice:toggle',
  VOICE_SPEAK: 'axiom:voice:speak',

  // Window Controls
  WINDOW_MINIMIZE: 'axiom:window:minimize',
  WINDOW_MAXIMIZE: 'axiom:window:maximize',
  WINDOW_CLOSE: 'axiom:window:close',
} as const;
