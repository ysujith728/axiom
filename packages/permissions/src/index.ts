/**
 * @axiom/permissions - Centralized 4-tier security evaluation and audit logger.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { RiskTier, ActionContext } from '@axiom/shared';
import type { AxiomRuntimeConfig } from '@axiom/config';

export interface PermissionDecision {
  allowed: boolean;
  tier: RiskTier;
  requiresUserConfirmation: boolean;
  reason: string;
  auditId: string;
}

export interface GroupedConfirmationRequest {
  groupId: string;
  title: string;
  reason: string;
  tier: RiskTier;
  actions: ActionContext[];
}

export interface AuditLogEntry {
  auditId: string;
  timestamp: number;
  toolName: string;
  tier: RiskTier;
  allowed: boolean;
  approvedBy: 'system' | 'user' | 'denied';
  parameters: Record<string, unknown>;
  targetPath?: string;
  durationMs?: number;
}

export class PermissionEngine {
  private config: AxiomRuntimeConfig;
  private pendingConfirmations = new Map<string, (allowed: boolean) => void>();

  constructor(config: AxiomRuntimeConfig) {
    this.config = config;
    this.ensureAuditLogExists();
  }

  /**
   * Evaluates the risk tier and determines if human confirmation is required.
   */
  public evaluate(action: ActionContext): PermissionDecision {
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const tier = action.tier;

    // Strict rule: File deletion and destructive system operations are always DANGEROUS
    if (action.toolName.toLowerCase().includes('delete') || tier === 'DANGEROUS') {
      return {
        allowed: false, // Requires explicit user approval
        tier: 'DANGEROUS',
        requiresUserConfirmation: true,
        reason: action.explanation || 'Destructive action requires explicit confirmation',
        auditId,
      };
    }

    // Existing file modifications and external network submissions require confirmation
    if (
      tier === 'CONFIRMATION_REQUIRED' ||
      (this.config.security.confirmFileModifications && action.toolName === 'modify_file')
    ) {
      return {
        allowed: false,
        tier: 'CONFIRMATION_REQUIRED',
        requiresUserConfirmation: true,
        reason: action.explanation || 'Modifying existing files or pushing external changes requires confirmation',
        auditId,
      };
    }

    // Safe and low-risk actions
    if (tier === 'SAFE' && this.config.security.autoApproveSafe) {
      return {
        allowed: true,
        tier: 'SAFE',
        requiresUserConfirmation: false,
        reason: 'Safe read-only operation authorized automatically',
        auditId,
      };
    }

    if (tier === 'LOW_RISK') {
      return {
        allowed: true,
        tier: 'LOW_RISK',
        requiresUserConfirmation: false,
        reason: 'Low-risk diagnostic or window operation authorized automatically',
        auditId,
      };
    }

    return {
      allowed: false,
      tier,
      requiresUserConfirmation: true,
      reason: action.explanation || 'Action requires user authorization',
      auditId,
    };
  }

  /**
   * Groups multiple file modifications or changes into one batch confirmation.
   */
  public createGroupedConfirmation(
    title: string,
    reason: string,
    actions: ActionContext[]
  ): GroupedConfirmationRequest {
    const maxTier: RiskTier = actions.some((a) => a.tier === 'DANGEROUS')
      ? 'DANGEROUS'
      : 'CONFIRMATION_REQUIRED';

    return {
      groupId: `grp_${Date.now()}`,
      title,
      reason,
      tier: maxTier,
      actions,
    };
  }

  /**
   * Appends an entry to the audit log, sanitizing passwords, API keys, and tokens.
   */
  public logAudit(entry: AuditLogEntry): void {
    try {
      const sanitizedParams = this.sanitizeSensitiveData(entry.parameters);
      const record = {
        ...entry,
        parameters: sanitizedParams,
      };
      fs.appendFileSync(this.config.auditLogPath, JSON.stringify(record) + '\n', 'utf8');
    } catch (err) {
      console.error('[PermissionEngine] Failed to write audit log:', err);
    }
  }

  private sanitizeSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'cookie'];
    const sanitized: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(obj)) {
      if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
        sanitized[k] = '[REDACTED]';
      } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        sanitized[k] = this.sanitizeSensitiveData(v as Record<string, unknown>);
      } else {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }

  private ensureAuditLogExists(): void {
    try {
      const dir = path.dirname(this.config.auditLogPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      // Ignore if directory exists
    }
  }
}
