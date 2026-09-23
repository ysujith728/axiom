/**
 * @axiom/tools - Unified Tool Registry, Dispatcher, and Verification Engine.
 */

import type { RiskTier, VerificationResult } from '@axiom/shared';
import { FileSystemTools } from './tools/filesystem.js';
import { TerminalTools } from './tools/terminal.js';
import { WindowsTools } from './tools/windows.js';
import { GitTools } from './tools/git.js';
import { DeveloperTools } from './tools/developer.js';
import { BrowserTools } from './tools/browser.js';
import { VisionTools } from './tools/vision.js';

export interface ExecutableTool<TParams = any, TResult = any> {
  name: string;
  description: string;
  tier: RiskTier;
  execute(params: TParams): Promise<TResult>;
  verify?(params: TParams, result: TResult): Promise<VerificationResult>;
}

export class ToolRegistry {
  private tools = new Map<string, ExecutableTool>();

  constructor() {
    this.registerDefaults();
  }

  public register(tool: ExecutableTool): void {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): ExecutableTool | undefined {
    return this.tools.get(name);
  }

  public list(): ExecutableTool[] {
    return Array.from(this.tools.values());
  }

  public async executeTool(name: string, params: Record<string, unknown>): Promise<{
    result: unknown;
    verification: VerificationResult;
    durationMs: number;
  }> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool not found in registry: "${name}"`);
    }

    const startTime = Date.now();
    const result = await tool.execute(params);
    const durationMs = Date.now() - startTime;

    let verification: VerificationResult = {
      verified: true,
      evidence: `Tool "${name}" completed execution in ${durationMs}ms`,
    };

    if (tool.verify) {
      try {
        verification = await tool.verify(params, result);
      } catch (err: any) {
        verification = {
          verified: false,
          evidence: `Verification failed: ${err.message}`,
        };
      }
    }

    return { result, verification, durationMs };
  }

  private registerDefaults(): void {
    // Filesystem
    this.register(FileSystemTools.listFiles);
    this.register(FileSystemTools.readFile);
    this.register(FileSystemTools.createFile);
    this.register(FileSystemTools.modifyFile);
    this.register(FileSystemTools.deleteFile);
    this.register(FileSystemTools.searchFiles);

    // Terminal
    this.register(TerminalTools.executePowerShell);

    // Windows
    this.register(WindowsTools.listWindows);
    this.register(WindowsTools.launchApplication);
    this.register(WindowsTools.getClipboard);
    this.register(WindowsTools.setClipboard);

    // Git
    this.register(GitTools.gitStatus);
    this.register(GitTools.gitDiff);
    this.register(GitTools.gitCommit);
    this.register(GitTools.gitPush);

    // Developer
    this.register(DeveloperTools.inspectProject);
    this.register(DeveloperTools.runTests);

    // Browser
    this.register(BrowserTools.navigateTo);
    this.register(BrowserTools.searchWeb);

    // Vision
    this.register(VisionTools.captureScreen);
  }
}

export {
  FileSystemTools,
  TerminalTools,
  WindowsTools,
  GitTools,
  DeveloperTools,
  BrowserTools,
  VisionTools,
};
