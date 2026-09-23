import React, { useState } from 'react';
import type { TaskItem } from '@axiom/shared';
import { Calendar, CheckCircle2, Clock, Play, XCircle, AlertCircle } from 'lucide-react';

export const TasksView: React.FC = () => {
  const [tasks] = useState<TaskItem[]>([
    {
      id: 'task_1',
      name: 'Repository Diagnostics & Health Check',
      description: 'Audit Git branches, unstaged changes, and local test suites',
      status: 'completed',
      createdAt: Date.now() - 3600000,
      startedAt: Date.now() - 3590000,
      completedAt: Date.now() - 3585000,
      progressPercent: 100,
      logs: ['Inspected working tree', 'Ran Vitest test suites (15/15 passed)'],
    },
    {
      id: 'task_2',
      name: 'Screen Resolution & Display Calibration',
      description: 'Check active Windows display coordinates and DPI scaling',
      status: 'completed',
      createdAt: Date.now() - 1800000,
      startedAt: Date.now() - 1795000,
      completedAt: Date.now() - 1792000,
      progressPercent: 100,
      logs: ['Detected 1920x1080 primary display', 'DPI scaling 125% confirmed'],
    },
    {
      id: 'task_3',
      name: 'Scheduled Daily Workspace Hygiene',
      description: 'Check for dangling temporary files and prune stale logs',
      status: 'queued',
      createdAt: Date.now() - 600000,
      scheduledFor: Date.now() + 86400000,
      progressPercent: 0,
      logs: ['Scheduled for execution tomorrow at 02:00 AM'],
    },
  ]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white">Task Manager & Scheduler</h2>
          <p className="text-xs text-slate-400 font-mono">
            Track immediate and scheduled autonomous tasks. Tasks run while AXIOM is active.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {task.status === 'running' && <Play className="w-5 h-5 text-cyan-400 animate-pulse" />}
                {task.status === 'failed' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {task.status === 'queued' && <Clock className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white">{task.name}</h3>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      task.status === 'completed'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : task.status === 'failed'
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : task.status === 'running'
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{task.description}</p>
              </div>
            </div>

            <div className="text-right">
              {task.scheduledFor ? (
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scheduled Tomorrow</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">100% Verified</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
