import React from 'react';
import type { ActionContext, RiskTier } from '@axiom/shared';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PermissionModalProps {
  request: {
    step: { title: string; toolName: string };
    action: ActionContext;
    reason: string;
  };
  onRespond: (allowed: boolean) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ request, onRespond }) => {
  const { action, reason, step } = request;
  const isDangerous = action.tier === 'DANGEROUS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e111a] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isDangerous ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-amber-500 shadow-[0_0_12px_#f59e0b]'
          }`}
        />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2.5 rounded-xl ${
              isDangerous ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {isDangerous ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white tracking-wide">
              Authorization Required
            </h2>
            <p className="text-xs text-slate-400">
              AXIOM requires explicit approval to execute this operation
            </p>
          </div>
          <span
            className={`ml-auto text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${
              isDangerous
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            {action.tier}
          </span>
        </div>

        {/* Details Box */}
        <div className="space-y-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Action</span>
            <span className="text-slate-200 font-semibold">{step.title} ({action.toolName})</span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Reason</span>
            <span className="text-slate-300">{reason}</span>
          </div>

          {action.parameters && Object.keys(action.parameters).length > 0 && (
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Parameters</span>
              <pre className="mt-1 p-2 rounded bg-black/40 border border-white/5 text-slate-300 overflow-x-auto max-h-32 text-[11px]">
                {JSON.stringify(action.parameters, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => onRespond(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            Deny
          </button>
          <button
            onClick={() => onRespond(true)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium text-white transition-all shadow-lg ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Allow Execution
          </button>
        </div>
      </div>
    </div>
  );
};
