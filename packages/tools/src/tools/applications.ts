/**
 * @axiom/tools - Windows Application Registry and Permission Adapter.
 */

import type { RiskTier, VerificationResult, RegisteredApplication } from '@axiom/shared';

const DEFAULT_APPLICATIONS: RegisteredApplication[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    executable: 'code',
    status: 'enabled',
    capabilities: ['editor', 'terminal', 'git', 'extensions'],
    launchMethod: 'command',
    allowedOperations: ['open_file', 'open_project', 'run_command'],
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    executable: 'chrome',
    status: 'enabled',
    capabilities: ['browser', 'web_research', 'devtools'],
    launchMethod: 'command',
    allowedOperations: ['navigate', 'search', 'read_page'],
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    executable: 'msedge',
    status: 'enabled',
    capabilities: ['browser', 'web_research'],
    launchMethod: 'command',
    allowedOperations: ['navigate', 'search'],
  },
  {
    id: 'terminal',
    name: 'Windows Terminal',
    executable: 'wt',
    status: 'enabled',
    capabilities: ['powershell', 'cmd', 'wsl'],
    launchMethod: 'command',
    allowedOperations: ['run_diagnostics', 'run_build'],
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    executable: 'explorer',
    status: 'enabled',
    capabilities: ['filesystem', 'folder_browse'],
    launchMethod: 'command',
    allowedOperations: ['open_folder', 'reveal_file'],
  },
  {
    id: 'notepad',
    name: 'Notepad',
    executable: 'notepad',
    status: 'enabled',
    capabilities: ['text_editor'],
    launchMethod: 'command',
    allowedOperations: ['view_log', 'open_text'],
  },
];

const appStore = new Map<string, RegisteredApplication>(
  DEFAULT_APPLICATIONS.map((app) => [app.id, app])
);

export const ApplicationRegistryTools = {
  listApplications: {
    name: 'list_applications',
    description: 'Lists all registered Windows desktop applications with status and allowed operations',
    tier: 'SAFE' as RiskTier,
    async execute(): Promise<RegisteredApplication[]> {
      return Array.from(appStore.values());
    },
    async verify(_params: unknown, result: RegisteredApplication[]): Promise<VerificationResult> {
      return {
        verified: Array.isArray(result) && result.length > 0,
        evidence: `Discovered ${result.length} registered applications in system registry`,
      };
    },
  },

  setApplicationRestriction: {
    name: 'set_application_restriction',
    description: 'Enables, disables, or restricts AXIOM automation permissions for a specific application',
    tier: 'CONFIRMATION_REQUIRED' as RiskTier,
    async execute(params: { appId: string; status: 'enabled' | 'disabled' | 'restricted' }): Promise<{ success: boolean; app: RegisteredApplication }> {
      const app = appStore.get(params.appId);
      if (!app) {
        throw new Error(`Application ID "${params.appId}" not found in registry`);
      }
      app.status = params.status;
      appStore.set(params.appId, app);
      return { success: true, app };
    },
    async verify(params: { appId: string; status: string }): Promise<VerificationResult> {
      const app = appStore.get(params.appId);
      const ok = app?.status === params.status;
      return {
        verified: ok,
        evidence: ok
          ? `Verified application "${params.appId}" status updated to ${params.status}`
          : `Failed to verify status change for "${params.appId}"`,
      };
    },
  },
};
