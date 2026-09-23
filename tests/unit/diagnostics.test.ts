import { describe, it, expect } from 'vitest';
import { DiagnosticsTools } from '../../packages/tools/src/tools/diagnostics.js';

describe('DiagnosticsTools', () => {
  it('executes self_diagnose and returns comprehensive health scorecard', async () => {
    const report = await DiagnosticsTools.selfDiagnose.execute();
    expect(report.overallStatus).toBeDefined();
    expect(report.subsystems.runtime.status).toBe('OK');
    expect(report.subsystems.git.status).toBe('OK');
    expect(report.subsystems.memory.totalMB).toBeGreaterThan(0);

    const verification = await DiagnosticsTools.selfDiagnose.verify({}, report);
    expect(verification.verified).toBe(true);
    expect(verification.evidence).toContain('Diagnostics completed');
  });

  it('marks self_diagnose as SAFE tier', () => {
    expect(DiagnosticsTools.selfDiagnose.tier).toBe('SAFE');
  });
});
