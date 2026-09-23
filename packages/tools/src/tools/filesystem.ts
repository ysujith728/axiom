/**
 * @axiom/tools - Real filesystem tools with verification strategies.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { RiskTier, VerificationResult } from '@axiom/shared';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  modifiedAt: number;
}

export const FileSystemTools = {
  listFiles: {
    name: 'list_files',
    description: 'Lists files and directories at the specified path',
    tier: 'SAFE' as RiskTier,
    async execute(params: { dirPath: string }): Promise<FileItem[]> {
      const target = path.resolve(params.dirPath);
      if (!fs.existsSync(target)) {
        throw new Error(`Directory does not exist: ${target}`);
      }
      const entries = fs.readdirSync(target, { withFileTypes: true });
      return entries.map((e) => {
        const full = path.join(target, e.name);
        let size = 0;
        let modifiedAt = Date.now();
        try {
          const stat = fs.statSync(full);
          size = stat.size;
          modifiedAt = stat.mtimeMs;
        } catch {
          // Ignore inaccessible files
        }
        return {
          name: e.name,
          path: full,
          isDirectory: e.isDirectory(),
          sizeBytes: size,
          modifiedAt,
        };
      });
    },
    async verify(params: { dirPath: string }, result: FileItem[]): Promise<VerificationResult> {
      return {
        verified: Array.isArray(result),
        evidence: `Listed ${result.length} items in ${params.dirPath}`,
      };
    },
  },

  readFile: {
    name: 'read_file',
    description: 'Reads text content from a file',
    tier: 'SAFE' as RiskTier,
    async execute(params: { filePath: string; maxBytes?: number }): Promise<string> {
      const target = path.resolve(params.filePath);
      if (!fs.existsSync(target)) {
        throw new Error(`File not found: ${target}`);
      }
      const maxBytes = params.maxBytes || 500000; // 500KB default
      const stat = fs.statSync(target);
      if (stat.size > maxBytes) {
        const fd = fs.openSync(target, 'r');
        const buffer = Buffer.alloc(maxBytes);
        fs.readSync(fd, buffer, 0, maxBytes, 0);
        fs.closeSync(fd);
        return buffer.toString('utf8') + `\n\n... [Truncated: File size is ${stat.size} bytes]`;
      }
      return fs.readFileSync(target, 'utf8');
    },
    async verify(params: { filePath: string }, result: string): Promise<VerificationResult> {
      return {
        verified: typeof result === 'string',
        evidence: `Successfully read ${result.length} characters from ${params.filePath}`,
      };
    },
  },

  createFile: {
    name: 'create_file',
    description: 'Creates a new file with specified content',
    tier: 'LOW_RISK' as RiskTier,
    async execute(params: { filePath: string; content: string }): Promise<{ success: boolean; path: string }> {
      const target = path.resolve(params.filePath);
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(target, params.content, 'utf8');
      return { success: true, path: target };
    },
    async verify(params: { filePath: string }): Promise<VerificationResult> {
      const target = path.resolve(params.filePath);
      const exists = fs.existsSync(target);
      return {
        verified: exists,
        evidence: exists ? `Verified file exists at ${target}` : `File creation failed, not found at ${target}`,
      };
    },
  },

  modifyFile: {
    name: 'modify_file',
    description: 'Modifies an existing file with replacement content',
    tier: 'CONFIRMATION_REQUIRED' as RiskTier,
    async execute(params: { filePath: string; content: string }): Promise<{ success: boolean; bytesWritten: number }> {
      const target = path.resolve(params.filePath);
      if (!fs.existsSync(target)) {
        throw new Error(`Cannot modify non-existent file: ${target}`);
      }
      fs.writeFileSync(target, params.content, 'utf8');
      const stat = fs.statSync(target);
      return { success: true, bytesWritten: stat.size };
    },
    async verify(params: { filePath: string; content: string }): Promise<VerificationResult> {
      const target = path.resolve(params.filePath);
      if (!fs.existsSync(target)) {
        return { verified: false, evidence: 'Target file does not exist after modification' };
      }
      const actual = fs.readFileSync(target, 'utf8');
      const verified = actual === params.content;
      return {
        verified,
        evidence: verified ? 'Verified file content matches expected modification' : 'File content mismatch',
      };
    },
  },

  deleteFile: {
    name: 'delete_file',
    description: 'Permanently deletes a file or directory after explicit approval',
    tier: 'DANGEROUS' as RiskTier,
    async execute(params: { targetPath: string; isDirectory?: boolean }): Promise<{ success: boolean; path: string }> {
      const target = path.resolve(params.targetPath);
      if (!fs.existsSync(target)) {
        return { success: true, path: target };
      }
      if (params.isDirectory) {
        fs.rmSync(target, { recursive: true, force: true });
      } else {
        fs.unlinkSync(target);
      }
      return { success: true, path: target };
    },
    async verify(params: { targetPath: string }): Promise<VerificationResult> {
      const target = path.resolve(params.targetPath);
      const exists = fs.existsSync(target);
      return {
        verified: !exists,
        evidence: !exists ? `Verified deletion: path no longer exists at ${target}` : `Path still exists at ${target}`,
      };
    },
  },

  searchFiles: {
    name: 'search_files',
    description: 'Searches for files matching a pattern or containing a substring',
    tier: 'SAFE' as RiskTier,
    async execute(params: { rootDir: string; query: string; matchContent?: boolean }): Promise<string[]> {
      const root = path.resolve(params.rootDir);
      if (!fs.existsSync(root)) return [];
      const matches: string[] = [];

      function walk(current: string, depth = 0) {
        if (depth > 5 || matches.length >= 50) return;
        try {
          const items = fs.readdirSync(current, { withFileTypes: true });
          for (const item of items) {
            if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist') continue;
            const full = path.join(current, item.name);
            if (item.isDirectory()) {
              walk(full, depth + 1);
            } else {
              if (item.name.toLowerCase().includes(params.query.toLowerCase())) {
                matches.push(full);
              } else if (params.matchContent) {
                try {
                  const content = fs.readFileSync(full, 'utf8');
                  if (content.toLowerCase().includes(params.query.toLowerCase())) {
                    matches.push(full);
                  }
                } catch {
                  // Ignore binary files
                }
              }
            }
          }
        } catch {
          // Ignore unreadable dirs
        }
      }

      walk(root);
      return matches;
    },
    async verify(params: { query: string }, result: string[]): Promise<VerificationResult> {
      return {
        verified: Array.isArray(result),
        evidence: `Found ${result.length} matches for "${params.query}"`,
      };
    },
  },
};
