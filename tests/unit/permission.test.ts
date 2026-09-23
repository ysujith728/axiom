import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionEngine } from '../../packages/permissions/src/index.js';
import { loadRuntimeConfig } from '../../packages/config/src/index.js';

describe('PermissionEngine', () => {
  let engine: PermissionEngine;
  const config = loadRuntimeConfig();

  beforeEach(() => {
    engine = new PermissionEngine(config);
  });

  it('automatically approves SAFE operations', () => {
    const decision = engine.evaluate({
      toolName: 'list_files',
      parameters: { dirPath: '.' },
      explanation: 'Listing directory',
      tier: 'SAFE',
    });

    expect(decision.allowed).toBe(true);
    expect(decision.requiresUserConfirmation).toBe(false);
    expect(decision.tier).toBe('SAFE');
  });

  it('flags file modifications as requiring user confirmation', () => {
    const decision = engine.evaluate({
      toolName: 'modify_file',
      parameters: { filePath: './test.txt', content: 'hello' },
      explanation: 'Modifying code file',
      tier: 'CONFIRMATION_REQUIRED',
    });

    expect(decision.allowed).toBe(false);
    expect(decision.requiresUserConfirmation).toBe(true);
    expect(decision.tier).toBe('CONFIRMATION_REQUIRED');
  });

  it('marks deletion operations as DANGEROUS', () => {
    const decision = engine.evaluate({
      toolName: 'delete_file',
      parameters: { targetPath: './important.dat' },
      explanation: 'Deleting file',
      tier: 'DANGEROUS',
    });

    expect(decision.allowed).toBe(false);
    expect(decision.requiresUserConfirmation).toBe(true);
    expect(decision.tier).toBe('DANGEROUS');
  });
});
