import { describe, it, expect } from 'vitest';
import { BrowserTools } from '../../packages/tools/src/tools/browser.js';

describe('BrowserTools', () => {
  it('formats search queries and returns structured web results', async () => {
    const result = await BrowserTools.searchWeb.execute({ query: 'open source AI agent' });
    expect(result.query).toBe('open source AI agent');
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);

    const verification = await BrowserTools.searchWeb.verify({ query: 'open source AI agent' }, result);
    expect(verification.verified).toBe(true);
  });

  it('marks browser navigation as SAFE tier', () => {
    expect(BrowserTools.navigateTo.tier).toBe('SAFE');
    expect(BrowserTools.searchWeb.tier).toBe('SAFE');
  });
});
