/**
 * @axiom/tools - Controlled PowerShell and Command Execution with verification.
 */

import { exec } from 'node:child_process';
import type { RiskTier, VerificationResult } from '@axiom/shared';

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  command: string;
}

export const TerminalTools = {
  executePowerShell: {
    name: 'execute_powershell',
    description: 'Executes a PowerShell script or command with controlled boundaries',
    tier: 'CONFIRMATION_REQUIRED' as RiskTier,
    async execute(params: { command: string; cwd?: string; timeoutMs?: number }): Promise<CommandExecutionResult> {
      const startTime = Date.now();
      const timeout = params.timeoutMs || 60000;
      const cwd = params.cwd || process.cwd();

      // Guard against catastrophic commands
      const lower = params.command.toLowerCase();
      if (
        lower.includes('format-volume') ||
        lower.includes('diskpart') ||
        lower.includes('remove-item -recurse -force c:\\')
      ) {
        throw new Error('Command rejected: contains prohibited destructive system operation');
      }

      return new Promise((resolve, reject) => {
        exec(
          `powershell.exe -NoProfile -NonInteractive -Command "${params.command.replace(/"/g, '`"')}"`,
          { cwd, timeout, maxBuffer: 10 * 1024 * 1024 },
          (error, stdout, stderr) => {
            const durationMs = Date.now() - startTime;
            const exitCode = error && typeof error.code === 'number' ? error.code : error ? 1 : 0;
            resolve({
              stdout: stdout.trim(),
              stderr: stderr.trim(),
              exitCode,
              durationMs,
              command: params.command,
            });
          }
        );
      });
    },
    async verify(params: { command: string }, result: CommandExecutionResult): Promise<VerificationResult> {
      const success = result.exitCode === 0;
      return {
        verified: success,
        evidence: success
          ? `Command exited with code 0 in ${result.durationMs}ms`
          : `Command failed with code ${result.exitCode}: ${result.stderr.substring(0, 200)}`,
        discrepancy: success ? undefined : result.stderr,
      };
    },
  },
};
