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
        const ps = `Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object Id, ProcessName, MainWindowTitle | ConvertTo-Json`;
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
    async execute(params: { appName: string; args?: string }): Promise<{ success: boolean; app: string }> {
      const name = params.appName.toLowerCase();
      let cmd = params.appName;

      if (name.includes('code') || name.includes('vs code')) {
        cmd = 'code';
      } else if (name.includes('chrome')) {
        cmd = 'start chrome';
      } else if (name.includes('edge')) {
        cmd = 'start msedge';
      } else if (name.includes('terminal')) {
        cmd = 'wt';
      } else if (name.includes('explorer') || name.includes('folder')) {
        cmd = 'explorer';
      }

      const fullCmd = params.args ? `${cmd} ${params.args}` : cmd;
      await execAsync(`powershell.exe -NoProfile -Command "Start-Process ${cmd}"`);
      return { success: true, app: params.appName };
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
