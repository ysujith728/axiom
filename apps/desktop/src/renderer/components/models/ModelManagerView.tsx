import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Download, RefreshCw, CheckCircle, Database } from 'lucide-react';

interface ModelInfo {
  name: string;
  role: string;
  sizeBytes: number;
  parameterSize: string;
  minRamRequiredMB: number;
}

export const ModelManagerView: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [activeModel, setActiveModel] = useState('llama3.2:3b');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    const axiom = (window as any).axiom;
    if (axiom?.listModels) {
      const list = await axiom.listModels();
      setModels(list);
    } else {
      // Mock catalog for preview mode
      setModels([
        {
          name: 'llama3.2:3b',
          role: 'GENERAL REASONING',
          sizeBytes: 2147483648,
          parameterSize: '3.2B',
          minRamRequiredMB: 4096,
        },
        {
          name: 'qwen2.5:1.5b',
          role: 'FAST CODE & TOOLS',
          sizeBytes: 980000000,
          parameterSize: '1.5B',
          minRamRequiredMB: 2048,
        },
        {
          name: 'all-minilm:latest',
          role: 'EMBEDDINGS',
          sizeBytes: 120000000,
          parameterSize: '33M',
          minRamRequiredMB: 512,
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white">Local AI Model Manager</h2>
          <p className="text-xs text-slate-400 font-mono">
            Pluggable GGUF local model execution via Ollama (No cloud dependencies or paid APIs)
          </p>
        </div>
        <button
          onClick={loadModels}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid gap-3">
        {models.map((m) => {
          const isActive = activeModel === m.name;
          const sizeGB = (m.sizeBytes / (1024 * 1024 * 1024)).toFixed(1);
          return (
            <div
              key={m.name}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-cyan-500/[0.04] border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.06)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 text-cyan-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white font-mono">{m.name}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                      {m.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-1">
                    <span>Size: {sizeGB} GB</span>
                    <span>Params: {m.parameterSize}</span>
                    <span>RAM Req: {Math.round(m.minRamRequiredMB / 1024)} GB</span>
                  </div>
                </div>
              </div>

              <div>
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded-xl">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active Model</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveModel(m.name)}
                    className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
