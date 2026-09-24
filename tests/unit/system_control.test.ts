import { describe, it, expect } from 'vitest';
import { SystemControlTools } from '../../packages/tools/src/tools/system_control.js';

describe('SystemControlTools', () => {
  it('inspects network status and verifies adapters', async () => {
    const result = await SystemControlTools.getNetworkStatus.execute();
    expect(result.connected).toBeDefined();
    expect(Array.isArray(result.adapters)).toBe(true);

    const verification = await SystemControlTools.getNetworkStatus.verify({}, result);
    expect(verification.verified).toBe(true);
  });

  it('adjusts volume and bounds to valid range', async () => {
    const result = await SystemControlTools.setVolume.execute({ level: 45 });
    expect(result.success).toBe(true);
    expect(result.level).toBe(45);

    const verification = await SystemControlTools.setVolume.verify({ level: 45 });
    expect(verification.verified).toBe(true);
    expect(verification.evidence).toContain('45%');
  });

  it('marks system_power as DANGEROUS risk tier', () => {
    expect(SystemControlTools.systemPower.tier).toBe('DANGEROUS');
  });
});
