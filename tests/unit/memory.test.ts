import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MemoryStore } from '../../packages/memory/src/index.js';
import { loadRuntimeConfig } from '../../packages/config/src/index.js';

describe('MemoryStore', () => {
  const config = loadRuntimeConfig();
  let memory: MemoryStore;

  beforeEach(() => {
    memory = new MemoryStore(config);
  });

  afterEach(() => {
    const memFile = path.join(config.dataDir, 'memory.json');
    if (fs.existsSync(memFile)) {
      try {
        fs.unlinkSync(memFile);
      } catch {
        // ignore
      }
    }
  });

  it('stores and retrieves memory by category', () => {
    const entry = memory.store('preference', 'editor', 'vscode', ['ide', 'editor']);
    expect(entry.id).toBeDefined();

    const results = memory.query(undefined, 'preference');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].key).toBe('editor');
    expect(results[0].value).toBe('vscode');
  });

  it('filters memories by search query text', () => {
    memory.store('fact', 'project_name', 'AXIOM', ['ai']);
    memory.store('fact', 'author', 'Sujith', ['dev']);

    const searchAxiom = memory.query('axiom');
    expect(searchAxiom.length).toBe(1);
    expect(searchAxiom[0].value).toBe('AXIOM');
  });

  it('deletes an entry by ID', () => {
    const entry = memory.store('task', 'reminder', 'deploy tomorrow');
    expect(memory.query('deploy').length).toBe(1);

    const deleted = memory.delete(entry.id);
    expect(deleted).toBe(true);
    expect(memory.query('deploy').length).toBe(0);
  });
});
