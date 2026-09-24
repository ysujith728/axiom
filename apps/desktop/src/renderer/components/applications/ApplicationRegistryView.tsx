import React, { useState } from 'react';
import type { RegisteredApplication } from '@axiom/shared';
import { AppWindow, Shield, CheckCircle2, Lock, Ban, Play } from 'lucide-react';

const INITIAL_APPS: RegisteredApplication[] = [
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

export const ApplicationRegistryView: React.FC = () => {
  const [apps, setApps] = useState<RegisteredApplication[]>(INITIAL_APPS);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);

  const handleLaunchApp = (app: RegisteredApplication) => {
    setLaunchMessage(`Launching ${app.name}...`);
    setTimeout(() => setLaunchMessage(null), 3500);

    const axiom = (window as any).axiom;
    if (axiom?.startGoal) {
      axiom.startGoal(`Launch ${app.name}`);
    }
  };

  const toggleStatus = (id: string) => {
    setApps(
      apps.map((app) => {
        if (app.id !== id) return app;
        const nextStatus =
          app.status === 'enabled'
            ? 'restricted'
            : app.status === 'restricted'
            ? 'disabled'
            : 'enabled';
        return { ...app, status: nextStatus };
      })
    );
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white">Application Allowlist & Registry</h2>
          <p className="text-xs text-slate-400 font-mono">
            AXIOM only operates explicitly registered Windows applications. Configure automation permissions per application.
          </p>
        </div>
        {launchMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono animate-pulse">
            {launchMessage}
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5 text-cyan-400">
                <AppWindow className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white font-mono">{app.name}</h3>
                  <span className="text-[10px] font-mono text-slate-500">({app.executable})</span>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      app.status === 'enabled'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : app.status === 'restricted'
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Allowed: {app.allowedOperations.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLaunchApp(app)}
                disabled={app.status === 'disabled'}
                className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-200 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)] disabled:opacity-30 disabled:pointer-events-none"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-300" />
                <span>Launch</span>
              </button>

              <button
                onClick={() => toggleStatus(app.id)}
                className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5"
              >
                {app.status === 'enabled' && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                {app.status === 'restricted' && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                {app.status === 'disabled' && <Ban className="w-3.5 h-3.5 text-rose-400" />}
                <span>Toggle Status</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
