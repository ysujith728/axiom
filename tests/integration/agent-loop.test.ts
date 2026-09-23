import { describe, it, expect } from 'vitest';
import { AgentRuntime } from '../../packages/agent/src/index.js';
import { loadRuntimeConfig } from '../../packages/config/src/index.js';
import { PermissionEngine } from '../../packages/permissions/src/index.js';
import { ToolRegistry } from '../../packages/tools/src/index.js';
import { ModelManager } from '../../packages/models/src/index.js';
import { MemoryStore } from '../../packages/memory/src/index.js';

describe('Agent Autonomous Loop Integration', () => {
  const config = loadRuntimeConfig();
  const permissions = new PermissionEngine(config);
  const tools = new ToolRegistry();
  const models = new ModelManager(config);
  const memory = new MemoryStore(config);

  const agent = new AgentRuntime(config, permissions, tools, models, memory);

  it('executes a safe diagnostic goal end-to-end with verification', async () => {
    const statesVisited: string[] = [];
    agent.on('state', (data) => statesVisited.push(data.state));

    const result = await agent.executeGoal('Inspect current directory files');

    expect(result.success).toBe(true);
    expect(result.plan.steps.length).toBeGreaterThanOrEqual(1);
    expect(result.plan.status).toBe('completed');
    expect(result.plan.steps[0].verification?.verified).toBe(true);

    expect(statesVisited).toContain('UNDERSTANDING');
    expect(statesVisited).toContain('PLANNING');
    expect(statesVisited).toContain('EXECUTING');
    expect(statesVisited).toContain('VERIFYING');
    expect(statesVisited).toContain('COMPLETED');
  });
});
