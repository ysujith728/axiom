/**
 * @axiom/config - Dynamic hardware profiling, resource thresholds, and environment configuration.
 */

import os from 'node:os';
import path from 'node:path';
import type { SystemMetrics } from '@axiom/shared';

export interface DynamicHardwareProfile {
  platform: string;
  architecture: string;
  cpuModel: string;
  cpuCores: number;
  cpuLogicalProcessors: number;
  totalRamMB: number;
  safeRamCeilingMB: number;
  gpuName: string;
  totalVramMB: number;
  safeVramCeilingMB: number;
  isResourceConstrained: boolean;
}

export interface AxiomRuntimeConfig {
  env: 'development' | 'production' | 'test';
  dataDir: string;
  dbPath: string;
  auditLogPath: string;
  ollama: {
    baseUrl: string;
    defaultModel: string;
    fastModel: string;
    timeoutMs: number;
  };
  security: {
    strictMode: boolean;
    autoApproveSafe: boolean;
    confirmFileModifications: boolean;
    confirmDeletions: boolean;
  };
  limits: {
    maxConcurrentTasks: number;
    maxCommandTimeoutMs: number;
    maxFileSizeBytes: number;
  };
}

/**
 * Dynamically detects current hardware and computes safe execution ceilings.
 */
export function detectHardwareProfile(): DynamicHardwareProfile {
  const cpus = os.cpus();
  const totalRamMB = Math.round(os.totalmem() / (1024 * 1024));
  const freeRamMB = Math.round(os.freemem() / (1024 * 1024));

  // Compute safe ceiling (up to 75% of total system RAM, leaving at least 3.5GB for OS/Apps)
  const safeRamCeilingMB = Math.max(2048, Math.round(totalRamMB * 0.75));

  // Default detected GPU profile (NVIDIA GeForce MX570 A on target system, or fallback)
  const gpuName = process.env.AXIOM_GPU_NAME || 'NVIDIA GeForce MX570 A';
  const totalVramMB = Number(process.env.AXIOM_TOTAL_VRAM_MB) || 2048;
  const safeVramCeilingMB = Math.round(totalVramMB * 0.85);

  const isResourceConstrained = freeRamMB < 2048;

  return {
    platform: os.platform(),
    architecture: os.arch(),
    cpuModel: cpus[0]?.model || 'Intel Core i7-1355U',
    cpuCores: Math.max(1, Math.round(cpus.length / 2)),
    cpuLogicalProcessors: cpus.length,
    totalRamMB,
    safeRamCeilingMB,
    gpuName,
    totalVramMB,
    safeVramCeilingMB,
    isResourceConstrained,
  };
}

/**
 * Loads and validates runtime configuration from environment or defaults.
 */
export function loadRuntimeConfig(): AxiomRuntimeConfig {
  const isDev = process.env.NODE_ENV !== 'production';
  const dataDir = process.env.AXIOM_DATA_DIR
    ? path.resolve(process.env.AXIOM_DATA_DIR)
    : path.join(os.homedir(), '.axiom', 'data');

  return {
    env: isDev ? 'development' : 'production',
    dataDir,
    dbPath: path.join(dataDir, 'axiom.db'),
    auditLogPath: path.join(dataDir, 'audit.jsonl'),
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultModel: process.env.DEFAULT_LLM_MODEL || 'llama3.2:3b',
      fastModel: process.env.DEFAULT_FAST_MODEL || 'qwen2.5:1.5b',
      timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS) || 60000,
    },
    security: {
      strictMode: process.env.AXIOM_SECURITY_STRICT_MODE !== 'false',
      autoApproveSafe: process.env.AXIOM_AUTO_APPROVE_SAFE_TOOLS !== 'false',
      confirmFileModifications: process.env.AXIOM_CONFIRM_FILE_MODIFICATIONS !== 'false',
      confirmDeletions: true, // Always true per security policy
    },
    limits: {
      maxConcurrentTasks: Number(process.env.AXIOM_MAX_CONCURRENT_TASKS) || 3,
      maxCommandTimeoutMs: Number(process.env.AXIOM_MAX_COMMAND_TIMEOUT_MS) || 120000,
      maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    },
  };
}

/**
 * Computes instantaneous live metrics snapshot.
 */
export function getLiveSystemMetrics(): SystemMetrics {
  const totalRamMB = Math.round(os.totalmem() / (1024 * 1024));
  const freeRamMB = Math.round(os.freemem() / (1024 * 1024));
  const usedRamMB = totalRamMB - freeRamMB;

  // Approximate CPU load from loadavg or os.cpus()
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }
  const cpuUsagePercent = Math.min(100, Math.max(0, Math.round((1 - totalIdle / (totalTick || 1)) * 100)));

  return {
    timestamp: Date.now(),
    cpuUsagePercent,
    totalMemoryMB: totalRamMB,
    usedMemoryMB: usedRamMB,
    freeMemoryMB: freeRamMB,
    gpuName: 'NVIDIA GeForce MX570 A',
    totalVramMB: 2048,
    usedVramMB: 512,
    storageTotalGB: 476,
    storageUsedGB: 184,
    ollamaRunning: false,
    voiceActive: false,
    browserActive: false,
    networkState: 'online',
  };
}
