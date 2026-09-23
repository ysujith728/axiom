/**
 * @axiom/tools - Software engineering assistant tools (project inspection, tests, builds).
 */

import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { RiskTier, VerificationResult } from '@axiom/shared';

const execAsync = promisify(exec);

export interface ProjectInspection {
  ecosystem: 'node' | 'python' | 'rust' | 'unknown';
  root: string;
  hasGit: boolean;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'pip' | 'poetry';
  scripts?: Record<string, string>;
  dependenciesCount: number;
}

export const DeveloperTools = {
  inspectProject: {
    name: 'inspect_project',
    description: 'Inspects a codebase to detect project type, scripts, and dependencies',
    tier: 'SAFE' as RiskTier,
    async execute(params: { projectDir: string }): Promise<ProjectInspection> {
      const root = path.resolve(params.projectDir);
      const pkgPath = path.join(root, 'package.json');
      const reqPath = path.join(root, 'requirements.txt');
      const hasGit = fs.existsSync(path.join(root, '.git'));

      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          const depCount = Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
          return {
            ecosystem: 'node',
            root,
            hasGit,
            packageManager: 'npm',
            scripts: pkg.scripts || {},
            dependenciesCount: depCount,
          };
        } catch {
          // fallback
        }
      }

      if (fs.existsSync(reqPath)) {
        return {
          ecosystem: 'python',
          root,
          hasGit,
          packageManager: 'pip',
          dependenciesCount: fs.readFileSync(reqPath, 'utf8').split('\n').filter(Boolean).length,
        };
      }

      return {
        ecosystem: 'unknown',
        root,
        hasGit,
        dependenciesCount: 0,
      };
    },
    async verify(_params: unknown, result: ProjectInspection): Promise<VerificationResult> {
      return {
        verified: !!result.ecosystem,
        evidence: `Detected ${result.ecosystem} ecosystem at ${result.root}`,
      };
    },
  },

  runTests: {
    name: 'run_tests',
    description: 'Runs test suite for the current project and captures pass/fail status',
    tier: 'SAFE' as RiskTier,
    async execute(params: { projectDir?: string; testCommand?: string }): Promise<{ success: boolean; output: string }> {
      const cwd = params.projectDir ? path.resolve(params.projectDir) : process.cwd();
      const cmd = params.testCommand || 'npm test';

      try {
        const { stdout, stderr } = await execAsync(cmd, { cwd, timeout: 120000 });
        return { success: true, output: (stdout + '\n' + stderr).trim() };
      } catch (err: any) {
        return {
          success: false,
          output: (err.stdout || '') + '\n' + (err.stderr || err.message),
        };
      }
    },
    async verify(_params: unknown, result: { success: boolean; output: string }): Promise<VerificationResult> {
      return {
        verified: true,
        evidence: result.success ? 'Tests passed successfully' : 'Tests completed with failures',
        discrepancy: result.success ? undefined : result.output.substring(0, 300),
      };
    },
  },
};
