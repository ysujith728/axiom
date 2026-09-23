import React from 'react';
import type { AgentPlan, PlanStep } from '@axiom/shared';
import { CheckCircle2, Clock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface ActivityStreamProps {
  plan: AgentPlan | null;
  activeStep: PlanStep | null;
}

export const ActivityStream: React.FC<ActivityStreamProps> = ({ plan, activeStep }) => {
  if (!plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
        <Clock className="w-8 h-8 stroke-1 mb-2 opacity-40" />
        <span>No active task in progress.</span>
        <span className="text-[11px] text-slate-600 mt-1">Autonomous tool executions and verification trails will stream here.</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Plan</span>
          <h3 className="text-xs font-medium text-slate-200 truncate max-w-xs">{plan.goal}</h3>
        </div>
        <span
          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
            plan.status === 'completed'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              : plan.status === 'failed'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
          }`}
        >
          {plan.status}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {plan.steps.map((step) => {
          const isCurrent = activeStep?.id === step.id;
          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all text-xs ${
                isCurrent
                  ? 'bg-white/[0.04] border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.08)]'
                  : step.status === 'completed'
                  ? 'bg-white/[0.02] border-white/5 opacity-80'
                  : step.status === 'failed'
                  ? 'bg-rose-500/[0.04] border-rose-500/30'
                  : 'bg-white/[0.01] border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : step.status === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : step.status === 'running' ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-500">
                      {step.index}
                    </div>
                  )}
                  <span className="font-medium text-slate-200">{step.title}</span>
                </div>
                {step.durationMs && (
                  <span className="text-[10px] font-mono text-slate-500">{step.durationMs}ms</span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono ml-6 space-y-1">
                <div>Tool: <span className="text-cyan-300">{step.toolName}</span></div>
                {step.verification && (
                  <div className="flex items-center gap-1.5 text-emerald-400/90 text-[10px] pt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{step.verification.evidence}</span>
                  </div>
                )}
                {step.error && (
                  <div className="text-rose-400 text-[10px] pt-1 font-mono">
                    Error: {step.error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
