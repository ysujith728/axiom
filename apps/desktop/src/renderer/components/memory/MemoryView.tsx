import React, { useState, useEffect } from 'react';
import type { MemoryEntry } from '@axiom/shared';
import { Search, Plus, Trash2, Database, Tag } from 'lucide-react';

export const MemoryView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadMemories();
  }, [searchQuery, selectedCategory]);

  const loadMemories = async () => {
    const axiom = (window as any).axiom;
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    if (axiom?.queryMemory) {
      const list = await axiom.queryMemory(searchQuery, cat);
      setMemories(list || []);
    } else {
      // Mock memories for preview
      setMemories([
        {
          id: 'mem_1',
          category: 'preference',
          key: 'primary_ide',
          value: 'Visual Studio Code',
          tags: ['editor', 'tools'],
          createdAt: Date.now() - 100000,
          updatedAt: Date.now() - 100000,
        },
        {
          id: 'mem_2',
          category: 'project',
          key: 'axiom_repo_path',
          value: 'D:\\PROJECTS\\axiom',
          tags: ['workspace', 'git'],
          createdAt: Date.now() - 50000,
          updatedAt: Date.now() - 50000,
        },
        {
          id: 'mem_3',
          category: 'fact',
          key: 'machine_specs',
          value: 'i7-1355U, 16GB RAM, NVIDIA GeForce MX570 A (2GB VRAM)',
          tags: ['hardware', 'limits'],
          createdAt: Date.now() - 20000,
          updatedAt: Date.now() - 20000,
        },
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    const axiom = (window as any).axiom;
    if (axiom?.deleteMemory) {
      await axiom.deleteMemory(id);
      loadMemories();
    } else {
      setMemories(memories.filter((m) => m.id !== id));
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const axiom = (window as any).axiom;
    if (axiom?.storeMemory) {
      await axiom.storeMemory('fact', newKey, newValue);
      setNewKey('');
      setNewValue('');
      setShowAddModal(false);
      loadMemories();
    } else {
      setMemories([
        {
          id: `mem_${Date.now()}`,
          category: 'fact',
          key: newKey,
          value: newValue,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...memories,
      ]);
      setNewKey('');
      setNewValue('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white">Transparent Local Memory</h2>
          <p className="text-xs text-slate-400 font-mono">
            Persistent local context stored in SQLite. You maintain complete sovereignty over what AXIOM remembers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Fact</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by keyword..."
            className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0e111a] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2 font-mono focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="preference">Preferences</option>
          <option value="project">Projects</option>
          <option value="fact">Facts</option>
          <option value="conversation">Conversations</option>
          <option value="task">Tasks</option>
        </select>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid gap-3">
        {memories.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-400">
                  {m.category}
                </span>
                <h4 className="text-xs font-semibold text-white font-mono">{m.key}</h4>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{m.value}</p>
              {m.tags && m.tags.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {m.tags.map((t) => (
                    <span key={t} className="text-[10px] text-slate-400 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDelete(m.id)}
              className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddMemory}
            className="w-full max-w-md bg-[#0e111a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">Add Persistent Memory Fact</h3>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Key / Subject</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. favorite_browser, target_dir"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Value / Knowledge</label>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Content for AXIOM to remember..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white shadow-lg"
              >
                Save Fact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
