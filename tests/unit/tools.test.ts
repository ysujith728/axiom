import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { ToolRegistry } from '../../packages/tools/src/index.js';

describe('ToolRegistry & Subsystem Tools', () => {
  const registry = new ToolRegistry();

  it('lists default registered tools', () => {
    const list = registry.list();
    expect(list.length).toBeGreaterThanOrEqual(10);
    expect(list.some((t) => t.name === 'list_files')).toBe(true);
    expect(list.some((t) => t.name === 'execute_powershell')).toBe(true);
    expect(list.some((t) => t.name === 'launch_application')).toBe(true);
  });

  it('executes list_files and verifies the result evidence', async () => {
    const { result, verification } = await registry.executeTool('list_files', { dirPath: '.' });
    expect(Array.isArray(result)).toBe(true);
    expect(verification.verified).toBe(true);
    expect(verification.evidence).toContain('Listed');
  });

  it('creates a temporary file and verifies its physical existence', async () => {
    const testFile = path.resolve('./temp_unit_test.txt');
    try {
      const { verification } = await registry.executeTool('create_file', {
        filePath: testFile,
        content: 'axiom_unit_test_content_123',
      });

      expect(verification.verified).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf8')).toBe('axiom_unit_test_content_123');
    } finally {
      if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    }
  });

  it('executes PowerShell command and verifies exit code 0', async () => {
    const { result, verification } = await registry.executeTool('execute_powershell', {
      command: 'Write-Output "AXIOM_ALIVE"',
    });

    expect((result as any).stdout).toContain('AXIOM_ALIVE');
    expect(verification.verified).toBe(true);
  });
});
