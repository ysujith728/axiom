import React from 'react';
import type { SystemMetrics } from '@axiom/shared';
import { Cpu, HardDrive, Zap, Layers, Activity, Wifi } from 'lucide-react';

interface SystemMonitorProps {
  metrics: SystemMetrics | null;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ metrics }) => {
  if (!metrics) return null;

  const ramUsedPercent = Math.round((metrics.usedMemoryMB / metrics.totalMemoryMB) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
      {/* CPU */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU</span>
          </div>
          <span className="font-mono text-[11px] text-cyan-300">{metrics.cpuUsagePercent}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${metrics.cpuUsagePercent}%` }}
          />
        </div>
      </div>

      {/* RAM */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Memory</span>
          </div>
          <span className="font-mono text-[11px] text-purple-300">
            {Math.round(metrics.usedMemoryMB / 1024)}GB / {Math.round(metrics.totalMemoryMB / 1024)}GB
          </span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-400 transition-all duration-500"
            style={{ width: `${ramUsedPercent}%` }}
          />
        </div>
      </div>

      {/* GPU */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPU / VRAM</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-300">2GB MX570</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400" style={{ width: '25%' }} />
        </div>
      </div>

      {/* AI & Network */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Local AI</span>
          </div>
          <span className="font-mono text-[11px] text-slate-300">
            {metrics.ollamaRunning ? 'Ollama Online' : 'Local Fallback'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span>Local First</span>
        </div>
      </div>
    </div>
  );
};
