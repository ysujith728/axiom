import React, { useState } from 'react';
import { Sliders, Shield, Mic, Cpu, HardDrive, Check, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [strictMode, setStrictMode] = useState(true);
  const [autoApproveSafe, setAutoApproveSafe] = useState(true);
  const [confirmModifications, setConfirmModifications] = useState(true);
  const [wakeWord, setWakeWord] = useState('Axiom');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [defaultModel, setDefaultModel] = useState('llama3.2:3b');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="h-full flex flex-col p-6 overflow-y-auto max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white">AXIOM Settings & Preferences</h2>
          <p className="text-xs text-slate-400 font-mono">
            Configure security boundaries, local AI endpoints, and voice sensitivity
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white shadow-lg shadow-cyan-600/20"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Security Settings Section */}
        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase font-mono">
            <Shield className="w-4 h-4" />
            <span>Security & Permissions</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <h4 className="text-xs font-semibold text-white">Strict Security Enforcement</h4>
              <p className="text-[11px] text-slate-400 font-mono">Blocks unverified tools and enforces safety gates on all actions</p>
            </div>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <h4 className="text-xs font-semibold text-white">Auto-Approve SAFE Read-Only Tools</h4>
              <p className="text-[11px] text-slate-400 font-mono">Allows non-destructive queries (e.g. file search, system info) without prompting</p>
            </div>
            <input
              type="checkbox"
              checked={autoApproveSafe}
              onChange={(e) => setAutoApproveSafe(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-xs font-semibold text-white">Require Confirmation for Code & File Edits</h4>
              <p className="text-[11px] text-slate-400 font-mono">Prompts with change preview before modifying existing files on disk</p>
            </div>
            <input
              type="checkbox"
              checked={confirmModifications}
              onChange={(e) => setConfirmModifications(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
          </div>
        </section>

        {/* Local AI Settings */}
        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase font-mono">
            <Cpu className="w-4 h-4" />
            <span>Local AI Model Engine</span>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Ollama Endpoint URL</label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Default Reasoning Model</label>
            <input
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
            />
          </div>
        </section>

        {/* Voice Settings */}
        <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase font-mono">
            <Mic className="w-4 h-4" />
            <span>Local Voice Pipeline</span>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Wake Phrase</label>
            <input
              type="text"
              value={wakeWord}
              onChange={(e) => setWakeWord(e.target.value)}
              className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">Processed locally on device via openWakeWord</p>
          </div>
        </section>
      </div>
    </form>
  );
};
