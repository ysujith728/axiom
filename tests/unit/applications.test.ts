import { describe, it, expect } from 'vitest';
import { ApplicationRegistryTools } from '../../packages/tools/src/tools/applications.js';

describe('ApplicationRegistryTools', () => {
  it('lists registered desktop applications', async () => {
    const list = await ApplicationRegistryTools.listApplications.execute();
    expect(list.length).toBeGreaterThanOrEqual(5);
    expect(list.some((a) => a.id === 'vscode')).toBe(true);
    expect(list.some((a) => a.id === 'chrome')).toBe(true);

    const verification = await ApplicationRegistryTools.listApplications.verify({}, list);
    expect(verification.verified).toBe(true);
  });

  it('updates application restriction status', async () => {
    const result = await ApplicationRegistryTools.setApplicationRestriction.execute({
      appId: 'notepad',
      status: 'restricted',
    });
    expect(result.success).toBe(true);
    expect(result.app.status).toBe('restricted');

    const verification = await ApplicationRegistryTools.setApplicationRestriction.verify({
      appId: 'notepad',
      status: 'restricted',
    });
    expect(verification.verified).toBe(true);
  });
});
