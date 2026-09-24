/**
 * @axiom/agent - Master autonomous task planner, execution engine, and verification runtime.
 */

import { EventEmitter } from 'node:events';
import type {
  ExecutionState,
  PlanStep,
  AgentPlan,
  ActionContext,
  VerificationResult,
} from '@axiom/shared';
import type { AxiomRuntimeConfig } from '@axiom/config';
import { PermissionEngine } from '@axiom/permissions';
import { ToolRegistry } from '@axiom/tools';
import { ModelManager } from '@axiom/models';
import { MemoryStore } from '@axiom/memory';

export class AgentRuntime extends EventEmitter {
  private state: ExecutionState = 'IDLE';
  private config: AxiomRuntimeConfig;
  private permissionEngine: PermissionEngine;
  private toolRegistry: ToolRegistry;
  private modelManager: ModelManager;
  private memoryStore: MemoryStore;
  private currentPlan: AgentPlan | null = null;
  private isCancelled = false;
  private pendingApprovalResolver: ((allowed: boolean) => void) | null = null;

  constructor(
    config: AxiomRuntimeConfig,
    permissionEngine: PermissionEngine,
    toolRegistry: ToolRegistry,
    modelManager: ModelManager,
    memoryStore: MemoryStore
  ) {
    super();
    this.config = config;
    this.permissionEngine = permissionEngine;
    this.toolRegistry = toolRegistry;
    this.modelManager = modelManager;
    this.memoryStore = memoryStore;
  }

  public getState(): ExecutionState {
    return this.state;
  }

  public getCurrentPlan(): AgentPlan | null {
    return this.currentPlan;
  }

  private transition(newState: ExecutionState, payload?: Record<string, unknown>): void {
    this.state = newState;
    this.emit('state', { state: this.state, ...payload });
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.pendingApprovalResolver) {
      this.pendingApprovalResolver(false);
      this.pendingApprovalResolver = null;
    }
    this.transition('CANCELLED', { reason: 'User requested task cancellation' });
  }

  public resolvePermission(allowed: boolean): void {
    if (this.pendingApprovalResolver) {
      this.pendingApprovalResolver(allowed);
      this.pendingApprovalResolver = null;
    }
  }

  /**
   * Main entry point: Executes a user goal through the complete autonomous loop.
   */
  public async executeGoal(goal: string): Promise<{
    success: boolean;
    summary: string;
    plan: AgentPlan;
  }> {
    this.isCancelled = false;
    const planId = `plan_${Date.now()}`;

    // 1. UNDERSTAND
    this.transition('UNDERSTANDING', { goal });
    await new Promise((r) => setTimeout(r, 200));

    // 2. PLAN
    this.transition('PLANNING', { goal });
    const steps = await this.generatePlanSteps(goal);
    this.currentPlan = {
      id: planId,
      goal,
      steps,
      createdAt: Date.now(),
      status: 'in_progress',
    };
    this.emit('plan', this.currentPlan);

    // 3. EXECUTE LOOP
    for (let i = 0; i < steps.length; i++) {
      if (this.isCancelled) {
        this.currentPlan.status = 'cancelled';
        return { success: false, summary: 'Task was cancelled by user.', plan: this.currentPlan };
      }

      const step = steps[i];
      step.status = 'running';
      this.emit('step', step);

      // Check Permissions
      const actionContext: ActionContext = {
        toolName: step.toolName,
        parameters: step.parameters,
        explanation: step.explanation,
        tier: step.tier,
      };

      const decision = this.permissionEngine.evaluate(actionContext);

      if (decision.requiresUserConfirmation) {
        this.transition('WAITING_FOR_PERMISSION', { step, action: actionContext, reason: decision.reason });
        const userApproved = await new Promise<boolean>((resolve) => {
          this.pendingApprovalResolver = resolve;
        });

        if (!userApproved) {
          step.status = 'skipped';
          step.error = 'Action denied by user';
          this.emit('step', step);
          this.permissionEngine.logAudit({
            auditId: decision.auditId,
            timestamp: Date.now(),
            toolName: step.toolName,
            tier: step.tier,
            allowed: false,
            approvedBy: 'denied',
            parameters: step.parameters,
          });
          continue;
        }

        this.permissionEngine.logAudit({
          auditId: decision.auditId,
          timestamp: Date.now(),
          toolName: step.toolName,
          tier: step.tier,
          allowed: true,
          approvedBy: 'user',
          parameters: step.parameters,
        });
      }

      // EXECUTE TOOL
      this.transition('EXECUTING', { step });
      try {
        const { result, verification, durationMs } = await this.toolRegistry.executeTool(
          step.toolName,
          step.parameters
        );

        step.result = result;
        step.durationMs = durationMs;

        // VERIFY RESULT
        this.transition('VERIFYING', { step, verification });
        step.verification = verification;

        if (!verification.verified) {
          // Failure Recovery attempt
          this.transition('RECOVERING', { step, reason: verification.evidence });
          step.status = 'failed';
          step.error = verification.evidence;
        } else {
          step.status = 'completed';
        }
      } catch (err: any) {
        step.status = 'failed';
        step.error = err.message;
        step.verification = {
          verified: false,
          evidence: `Execution error: ${err.message}`,
        };
      }

      this.emit('step', step);
    }

    const hasFailed = steps.some((s) => s.status === 'failed');
    this.currentPlan.status = hasFailed ? 'failed' : 'completed';
    this.currentPlan.completedAt = Date.now();

    const summary = hasFailed
      ? `Completed with issues: ${steps.filter((s) => s.status === 'failed').length} steps failed.`
      : `Successfully accomplished: ${goal} (${steps.length} steps verified).`;

    this.transition(hasFailed ? 'FAILED' : 'COMPLETED', { summary, plan: this.currentPlan });

    // Store in memory for context retention
    this.memoryStore.store('conversation', `goal_${Date.now()}`, `${goal} -> ${summary}`);

    return {
      success: !hasFailed,
      summary,
      plan: this.currentPlan,
    };
  }

  /**
   * Plans the sequence of steps needed to achieve the user's natural language goal.
   */
  private async generatePlanSteps(goal: string): Promise<PlanStep[]> {
    const lower = goal.toLowerCase();
    const steps: PlanStep[] = [];

    if (
      lower.includes('vs code') ||
      lower.includes('vscode') ||
      lower.includes('visual studio code') ||
      lower.includes('open code') ||
      lower.includes('launch code') ||
      lower.includes('start code')
    ) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Launch Visual Studio Code',
        toolName: 'launch_application',
        parameters: { appName: 'code' },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Launches VS Code process for development',
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Verify Application Window',
        toolName: 'list_windows',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Confirms that the application window is active',
      });
    } else if (lower.includes('cursor')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Launch Cursor Editor',
        toolName: 'launch_application',
        parameters: { appName: 'cursor' },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Launches Cursor editor process',
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Verify Application Window',
        toolName: 'list_windows',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Confirms that the application window is active',
      });
    } else if (lower.includes('chrome') || lower.includes('google chrome') || lower.includes('open browser')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Launch Google Chrome',
        toolName: 'launch_application',
        parameters: { appName: 'chrome' },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Launches Chrome browser process',
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Verify Application Window',
        toolName: 'list_windows',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Confirms that Chrome is running',
      });
    } else if (lower.includes('edge') || lower.includes('microsoft edge')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Launch Microsoft Edge',
        toolName: 'launch_application',
        parameters: { appName: 'edge' },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Launches Microsoft Edge browser process',
      });
    } else if (lower.includes('notepad')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Launch Notepad',
        toolName: 'launch_application',
        parameters: { appName: 'notepad' },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Launches Windows Notepad',
      });
    } else if (lower.includes('terminal') || lower.includes('powershell') || lower.includes('command prompt')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Launch Windows Terminal',
        toolName: 'launch_application',
        parameters: { appName: 'terminal' },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Launches terminal console',
      });
    } else if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('start ')) {
      const targetApp = goal.replace(/^(open|launch|start)\s+/i, '').trim();
      steps.push({
        id: 'step_1',
        index: 1,
        title: `Launch ${targetApp}`,
        toolName: 'launch_application',
        parameters: { appName: targetApp },
        tier: 'LOW_RISK',
        requiresConfirmation: false,
        status: 'pending',
        explanation: `Launches application "${targetApp}"`,
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Verify Application Window',
        toolName: 'list_windows',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Confirms application window is active',
      });
    } else if (lower.includes('test') || lower.includes('run tests')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Inspect Project Ecosystem',
        toolName: 'inspect_project',
        parameters: { projectDir: '.' },
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Discovers package scripts and test configurations',
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Execute Project Tests',
        toolName: 'run_tests',
        parameters: { projectDir: '.', testCommand: 'npm test' },
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Runs test suite and evaluates pass/fail status',
      });
    } else if (lower.includes('git') || lower.includes('status') || lower.includes('repo')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Inspect Git Working Tree',
        toolName: 'git_status',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Checks modified, staged, and untracked files',
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Inspect Working Diff',
        toolName: 'git_diff',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Analyzes exact code diffs in working copy',
      });
    } else if (lower.includes('delete') || lower.includes('remove file')) {
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Request Confirmation for Deletion',
        toolName: 'delete_file',
        parameters: { targetPath: './temp_artifact.tmp' },
        tier: 'DANGEROUS',
        requiresConfirmation: true,
        status: 'pending',
        explanation: 'Permanently removes file per explicit request',
      });
    } else {
      // Default diagnostic & file inspection flow
      steps.push({
        id: 'step_1',
        index: 1,
        title: 'Inspect Environment & Files',
        toolName: 'list_files',
        parameters: { dirPath: '.' },
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Reads current directory structure for context',
      });
      steps.push({
        id: 'step_2',
        index: 2,
        title: 'Inspect Active Desktop Windows',
        toolName: 'list_windows',
        parameters: {},
        tier: 'SAFE',
        requiresConfirmation: false,
        status: 'pending',
        explanation: 'Scans for relevant foreground processes',
      });
    }

    return steps;
  }
}
