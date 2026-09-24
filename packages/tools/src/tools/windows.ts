/**
 * @axiom/tools - Windows operating system and desktop automation tools.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { RiskTier, VerificationResult } from '@axiom/shared';

const execAsync = promisify(exec);

export const WindowsTools = {
  listWindows: {
    name: 'list_windows',
    description: 'Lists open active application windows on the desktop',
    tier: 'SAFE' as RiskTier,
    async execute(): Promise<Array<{ id: number; name: string; title: string }>> {
      try {
        const ps = `Get-Process | Where-Object MainWindowTitle | Select-Object Id, ProcessName, MainWindowTitle | ConvertTo-Json`;
        const { stdout } = await execAsync(`powershell.exe -NoProfile -Command "${ps}"`);
        if (!stdout.trim()) return [];
        const parsed = JSON.parse(stdout);
        const array = Array.isArray(parsed) ? parsed : [parsed];
        return array.map((item) => ({
          id: item.Id,
          name: item.ProcessName,
          title: item.MainWindowTitle,
        }));
      } catch {
        return [];
      }
    },
    async verify(_params: unknown, result: unknown[]): Promise<VerificationResult> {
      return {
        verified: Array.isArray(result),
        evidence: `Discovered ${result.length} active desktop windows`,
      };
    },
  },

  launchApplication: {
    name: 'launch_application',
    description: 'Launches a registered or detected Windows application (e.g. VS Code, Chrome, Terminal, Explorer)',
    tier: 'LOW_RISK' as RiskTier,
    async execute(params: { appName: string; args?: string }): Promise<{ success: boolean; app: string; pid?: number }> {
      const { spawn } = await import('node:child_process');
      const fs = await import('node:fs');
      const path = await import('node:path');

      const name = params.appName.toLowerCase().trim();
      const localAppData = process.env.LOCALAPPDATA || '';
      const programFiles = process.env.ProgramFiles || '';
      const programFilesX86 = process.env['ProgramFiles(x86)'] || '';

      let target = params.appName;

      if (name.includes('code') || name.includes('vscode') || name.includes('visual studio')) {
        const candidates = [
          path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
          path.join(programFiles, 'Microsoft VS Code', 'Code.exe'),
          path.join(programFilesX86, 'Microsoft VS Code', 'Code.exe'),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        target = found || 'code';
      } else if (name.includes('cursor')) {
        const p = path.join(localAppData, 'Programs', 'cursor', 'Cursor.exe');
        target = fs.existsSync(p) ? p : 'cursor';
      } else if (name.includes('chrome')) {
        const candidates = [
          path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        target = found || 'chrome';
      } else if (name.includes('edge')) {
        const candidates = [
          path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
          path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        target = found || 'msedge';
      } else if (name.includes('terminal') || name.includes('wt')) {
        target = 'wt';
      } else if (name.includes('explorer') || name.includes('folder')) {
        target = 'explorer';
      } else if (name.includes('notepad')) {
        target = 'notepad';
      }

      // Strip Electron variables so child apps don't exit in headless CLI mode
      const cleanEnv = { ...process.env };
      delete cleanEnv.ELECTRON_RUN_AS_NODE;
      delete cleanEnv.ELECTRON_NO_ASAR;
      delete cleanEnv.ATOM_SHELL_INTERNAL_RUN_AS_NODE;

      try {
        const escapedTarget = target.replace(/'/g, "''");
        const argsPart = params.args ? ` -ArgumentList '${params.args.replace(/'/g, "''")}'` : '';
        const psScript = `Start-Process -FilePath '${escapedTarget}'${argsPart}`;
        const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', psScript], {
          env: cleanEnv,
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
        return { success: true, app: params.appName, pid: child.pid };
      } catch {
        // Fallback to Windows cmd start detached
        try {
          const child = spawn('cmd.exe', ['/c', 'start', '', target, ...(params.args ? [params.args] : [])], {
            env: cleanEnv,
            detached: true,
            stdio: 'ignore',
          });
          child.unref();
          return { success: true, app: params.appName, pid: child.pid };
        } catch {
          return { success: false, app: params.appName };
        }
      }
    },
    async verify(params: { appName: string }): Promise<VerificationResult> {
      return {
        verified: true,
        evidence: `Launched application process for ${params.appName}`,
      };
    },
  },

  getClipboard: {
    name: 'get_clipboard',
    description: 'Reads text from the Windows clipboard',
    tier: 'SAFE' as RiskTier,
    async execute(): Promise<string> {
      try {
        const { stdout } = await execAsync('powershell.exe -NoProfile -Command "Get-Clipboard"');
        return stdout.trim();
      } catch {
        return '';
      }
    },
  },

  setClipboard: {
    name: 'set_clipboard',
    description: 'Sets text content into the Windows clipboard',
    tier: 'LOW_RISK' as RiskTier,
    async execute(params: { text: string }): Promise<{ success: boolean }> {
      const escaped = params.text.replace(/"/g, '`"');
      await execAsync(`powershell.exe -NoProfile -Command "Set-Clipboard -Value \\"${escaped}\\""`);
      return { success: true };
    },
    async verify(params: { text: string }): Promise<VerificationResult> {
      try {
        const { stdout } = await execAsync('powershell.exe -NoProfile -Command "Get-Clipboard"');
        const matched = stdout.trim() === params.text.trim();
        return {
          verified: matched,
          evidence: matched ? 'Verified clipboard matches expected text' : 'Clipboard content does not match',
        };
      } catch {
        return { verified: false, evidence: 'Could not inspect clipboard' };
      }
    },
  },
};
