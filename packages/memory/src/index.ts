/**
 * @axiom/memory - Transparent, local-first persistent memory storage engine.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { MemoryEntry } from '@axiom/shared';
import type { AxiomRuntimeConfig } from '@axiom/config';

export class MemoryStore {
  private memoryFilePath: string;
  private entries: Map<string, MemoryEntry> = new Map();

  constructor(config: AxiomRuntimeConfig) {
    this.memoryFilePath = path.join(config.dataDir, 'memory.json');
    this.load();
  }

  public store(
    category: MemoryEntry['category'],
    key: string,
    value: string,
    tags: string[] = []
  ): MemoryEntry {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();
    const entry: MemoryEntry = {
      id,
      category,
      key,
      value,
      tags,
      createdAt: now,
      updatedAt: now,
    };

    this.entries.set(id, entry);
    this.save();
    return entry;
  }

  public query(queryText?: string, category?: MemoryEntry['category']): MemoryEntry[] {
    let results = Array.from(this.entries.values());

    if (category) {
      results = results.filter((e) => e.category === category);
    }

    if (queryText && queryText.trim()) {
      const q = queryText.toLowerCase();
      results = results.filter(
        (e) =>
          e.key.toLowerCase().includes(q) ||
          e.value.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public delete(id: string): boolean {
    const deleted = this.entries.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  public clearCategory(category: MemoryEntry['category']): number {
    let count = 0;
    for (const [id, entry] of this.entries.entries()) {
      if (entry.category === category) {
        this.entries.delete(id);
        count++;
      }
    }
    if (count > 0) this.save();
    return count;
  }

  private load(): void {
    try {
      if (fs.existsSync(this.memoryFilePath)) {
        const raw = fs.readFileSync(this.memoryFilePath, 'utf8');
        const list: MemoryEntry[] = JSON.parse(raw);
        for (const item of list) {
          this.entries.set(item.id, item);
        }
      }
    } catch (err) {
      console.error('[MemoryStore] Failed to load memories:', err);
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.memoryFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.entries.values());
      fs.writeFileSync(this.memoryFilePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[MemoryStore] Failed to persist memories:', err);
    }
  }
}
