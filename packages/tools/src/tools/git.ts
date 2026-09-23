/**
 * @axiom/tools - Git and GitHub integration tools with confirmation and verification.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { RiskTier, VerificationResult } from '@axiom/shared';

const execAsync = promisify(exec);

export const GitTools = {
  gitStatus: {
    name: 'git_status',
    description: 'Inspects working tree status of a Git repository',
    tier: 'SAFE' as RiskTier,
    async execute(params: { cwd?: string }): Promise<string> {
      const cwd = params.cwd || process.cwd();
      const { stdout } = await execAsync('git status --short --branch', { cwd });
      return stdout.trim();
    },
    async verify(_params: unknown, result: string): Promise<VerificationResult> {
      return {
        verified: true,
        evidence: `Retrieved Git status: ${result ? result.split('\n').length + ' lines' : 'clean'}`,
      };
    },
  },

  gitDiff: {
    name: 'git_diff',
    description: 'Shows unstaged and staged changes in a repository',
    tier: 'SAFE' as RiskTier,
    async execute(params: { cwd?: string; staged?: boolean }): Promise<string> {
      const cwd = params.cwd || process.cwd();
      const flag = params.staged ? '--staged' : '';
      const { stdout } = await execAsync(`git diff ${flag}`, { cwd });
      return stdout.trim() || 'No differences detected.';
    },
  },

  gitCommit: {
    name: 'git_commit',
    description: 'Stages all files and creates a Git commit',
    tier: 'CONFIRMATION_REQUIRED' as RiskTier,
    async execute(params: { message: string; cwd?: string }): Promise<{ success: boolean; hash: string }> {
      const cwd = params.cwd || process.cwd();
      const safeMsg = params.message.replace(/"/g, '\\"');
      await execAsync('git add .', { cwd });
      const { stdout } = await execAsync(`git commit -m "${safeMsg}"`, { cwd });
      const hashMatch = stdout.match(/\[[\w\-]+ ([a-f0-9]+)\]/);
      const hash = hashMatch ? hashMatch[1] : 'committed';
      return { success: true, hash };
    },
    async verify(params: { cwd?: string }): Promise<VerificationResult> {
      const cwd = params.cwd || process.cwd();
      try {
        const { stdout } = await execAsync('git log -1 --oneline', { cwd });
        return {
          verified: true,
          evidence: `Verified commit created: ${stdout.trim()}`,
        };
      } catch (err: any) {
        return { verified: false, evidence: err.message };
      }
    },
  },

  gitPush: {
    name: 'git_push',
    description: 'Pushes local commits to the remote branch',
    tier: 'CONFIRMATION_REQUIRED' as RiskTier,
    async execute(params: { remote?: string; branch?: string; cwd?: string }): Promise<{ success: boolean }> {
      const cwd = params.cwd || process.cwd();
      const remote = params.remote || 'origin';
      const branch = params.branch || 'main';
      await execAsync(`git push ${remote} ${branch}`, { cwd });
      return { success: true };
    },
    async verify(params: { cwd?: string }): Promise<VerificationResult> {
      const cwd = params.cwd || process.cwd();
      const { stdout } = await execAsync('git status -uno', { cwd });
      const upToDate = stdout.includes('up to date') || stdout.includes('by 0 commits');
      return {
        verified: upToDate,
        evidence: upToDate ? 'Remote branch is fully up to date' : stdout.trim(),
      };
    },
  },
};
