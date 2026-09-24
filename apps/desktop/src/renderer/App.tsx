import React, { useState, useEffect } from 'react';
import type { ExecutionState, AgentPlan, PlanStep, SystemMetrics } from '@axiom/shared';
import { AxiomCore } from './components/core/AxiomCore';
import { ActivityStream } from './components/activity/ActivityStream';
import { PermissionModal } from './components/permissions/PermissionModal';
import { SystemMonitor } from './components/system/SystemMonitor';
import { ModelManagerView } from './components/models/ModelManagerView';
import { MemoryView } from './components/memory/MemoryView';
import { TasksView } from './components/tasks/TasksView';
import { ApplicationRegistryView } from './components/applications/ApplicationRegistryView';
import { FullSystemDiagnosticsView } from './components/system/FullSystemDiagnosticsView';
import { SettingsView } from './components/settings/SettingsView';
import {
  Mic,
  MicOff,
  Send,
  Minus,
  Square,
  X,
  Compass,
  Database,
  Calendar,
  Activity,
  Cpu,
  AppWindow,
  Sliders,
} from 'lucide-react';

type ActiveTab = 'command' | 'models' | 'memory' | 'tasks' | 'applications' | 'diagnostics' | 'settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('command');
  const [state, setState] = useState<ExecutionState>('IDLE');
  const [goalInput, setGoalInput] = useState('');
  const [currentPlan, setCurrentPlan] = useState<AgentPlan | null>(null);
  const [activeStep, setActiveStep] = useState<PlanStep | null>(null);
  const [permissionRequest, setPermissionRequest] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    const axiom = (window as any).axiom;
    if (!axiom) {
      setMetrics({
        timestamp: Date.now(),
        cpuUsagePercent: 14,
        totalMemoryMB: 16384,
        usedMemoryMB: 7168,
        freeMemoryMB: 9216,
        gpuName: 'NVIDIA GeForce MX570 A',
        totalVramMB: 2048,
        usedVramMB: 512,
        storageTotalGB: 476,
        storageUsedGB: 184,
        ollamaRunning: false,
        voiceActive: false,
        browserActive: false,
        networkState: 'online',
      });
      return;
    }

    const unsubState = axiom.onAgentState?.((s: ExecutionState) => setState(s));
    const unsubPlan = axiom.onPlanUpdate?.((p: AgentPlan) => setCurrentPlan(p));
    const unsubStep = axiom.onStepUpdate?.((st: PlanStep) => setActiveStep(st));
    const unsubPerm = axiom.onPermissionRequest?.((req: any) => setPermissionRequest(req));

    axiom.getMetrics?.().then(setMetrics);
    const metricsInterval = setInterval(() => {
      axiom.getMetrics?.().then(setMetrics);
    }, 3000);

    return () => {
      unsubState?.();
      unsubPlan?.();
      unsubStep?.();
      unsubPerm?.();
      clearInterval(metricsInterval);
    };
  }, []);

  const handleSubmitGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goalInput.trim()) return;

    const goal = goalInput;
    setGoalInput('');
    setState('UNDERSTANDING');

    const axiom = (window as any).axiom;
    if (axiom?.startGoal) {
      try {
        await axiom.startGoal(goal);
      } catch (err) {
        console.error('Goal execution error:', err);
        setState('FAILED');
      }
    } else {
      setTimeout(() => setState('PLANNING'), 400);
      setTimeout(() => {
        const dummyPlan: AgentPlan = {
          id: 'plan_mock',
          goal,
          status: 'in_progress',
          createdAt: Date.now(),
          steps: [
            {
              id: 's1',
              index: 1,
              title: 'Inspect Target Environment',
              toolName: 'inspect_project',
              tier: 'SAFE',
              requiresConfirmation: false,
              status: 'completed',
              explanation: 'Scanning workspace structure',
              durationMs: 140,
              verification: { verified: true, evidence: 'Inspected local repository structure' },
              parameters: {},
            },
            {
              id: 's2',
              index: 2,
              title: 'Execute Requested Task',
              toolName: 'execute_powershell',
              tier: 'LOW_RISK',
              requiresConfirmation: false,
              status: 'completed',
              explanation: 'Executing operation',
              durationMs: 380,
              verification: { verified: true, evidence: 'Verified exit code 0' },
              parameters: {},
            },
          ],
        };
        setCurrentPlan(dummyPlan);
        setState('EXECUTING');
      }, 900);
      setTimeout(() => setState('COMPLETED'), 2200);
    }
  };

  const handlePermissionResponse = (allowed: boolean) => {
    const axiom = (window as any).axiom;
    if (axiom?.respondPermission) {
      axiom.respondPermission(allowed);
    }
    setPermissionRequest(null);
  };

  const handleQuickPrompt = (prompt: string) => {
    setGoalInput(prompt);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090d] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Custom Titlebar */}
      <header className="h-10 flex items-center justify-between px-4 bg-[#0a0d14] border-b border-white/5 drag-region">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span className="font-semibold text-xs tracking-wider text-white">AXIOM</span>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 ml-4 no-drag">
            <button
              onClick={() => setActiveTab('command')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'command'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Core</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'models'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Models</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'memory'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Memory</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'applications'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <AppWindow className="w-3.5 h-3.5" />
              <span>Apps</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'diagnostics'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Health</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white/10 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={() => (window as any).axiom?.minimizeWindow?.()}
            className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => (window as any).axiom?.maximizeWindow?.()}
            className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => (window as any).axiom?.closeWindow?.()}
            className="w-7 h-7 rounded hover:bg-rose-600/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'command' && (
          <>
            {/* Center: AXIOM Intelligence Core & Conversation */}
            <main className="flex-1 flex flex-col items-center justify-between p-6 relative overflow-hidden">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

              <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                <AxiomCore state={state} size={280} />
                <div className="mt-4 text-center max-w-md">
                  <h1 className="text-xl font-medium tracking-tight text-white mb-1">
                    {state === 'IDLE' && 'How can I assist your computer today?'}
                    {state === 'LISTENING' && 'Listening for your command...'}
                    {state === 'UNDERSTANDING' && 'Decomposing natural-language intent...'}
                    {state === 'PLANNING' && 'Formulating execution steps & safety tiers...'}
                    {state === 'WAITING_FOR_PERMISSION' && 'Waiting for your authorization...'}
                    {state === 'EXECUTING' && 'Operating tools with controlled boundaries...'}
                    {state === 'VERIFYING' && 'Verifying result evidence before reporting...'}
                    {state === 'COMPLETED' && 'Goal accomplished and verified.'}
                    {state === 'FAILED' && 'Task encountered an issue.'}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    {currentPlan?.goal ? `Goal: "${currentPlan.goal}"` : 'Local-first • Privacy conscious • Hardware aware'}
                  </p>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="w-full max-w-xl flex flex-wrap gap-2 justify-center mb-3 z-10">
                {[
                  'Open Visual Studio Code',
                  'Inspect Git repository status',
                  'Run project tests',
                  'Capture desktop screenshot',
                  'Search web for local LLMs',
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleQuickPrompt(p)}
                    className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-300 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Command Bar */}
              <form
                onSubmit={handleSubmitGoal}
                className="w-full max-w-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/50 focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(0,240,255,0.2)] rounded-2xl p-2 flex items-center gap-3 backdrop-blur-xl transition-all z-10"
              >
                <button
                  type="button"
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isVoiceActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#00f0ff]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Ask AXIOM to operate your computer, run code, or inspect files..."
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans px-2"
                />

                <button
                  type="submit"
                  disabled={!goalInput.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <span>Execute</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </main>

            {/* Right: Live Activity Stream */}
            <aside className="w-80 border-l border-white/5 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col">
              <ActivityStream plan={currentPlan} activeStep={activeStep} />
            </aside>
          </>
        )}

        {activeTab === 'models' && <ModelManagerView />}
        {activeTab === 'memory' && <MemoryView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'applications' && <ApplicationRegistryView />}
        {activeTab === 'diagnostics' && <FullSystemDiagnosticsView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* Bottom Live Hardware Monitor */}
      <footer className="border-t border-white/5 bg-[#07080c]">
        <SystemMonitor metrics={metrics} />
      </footer>

      {/* Interactive Permission Authorization Modal */}
      {permissionRequest && (
        <PermissionModal
          request={permissionRequest}
          onRespond={handlePermissionResponse}
        />
      )}
    </div>
  );
};
