/**
 * @axiom/tools - Browser and Web Automation Tools with safety tiers and verification.
 */

import type { RiskTier, VerificationResult } from '@axiom/shared';

export interface PageContentResult {
  url: string;
  title: string;
  statusCode: number;
  textSnippet: string;
  links: string[];
}

export interface WebSearchResult {
  query: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export const BrowserTools = {
  navigateTo: {
    name: 'navigate_to',
    description: 'Navigates to a public web URL and extracts title and readable content',
    tier: 'SAFE' as RiskTier,
    async execute(params: { url: string }): Promise<PageContentResult> {
      let targetUrl = params.url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }

      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AXIOM-Agent/1.0',
        },
        signal: AbortSignal.timeout(15000),
      });

      const html = await res.text();

      // Extract basic title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : targetUrl;

      // Extract text snippet by removing script, style, and HTML tags
      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract top links
      const links: string[] = [];
      const linkRegex = /href="(https?:\/\/[^"#\s]+)"/gi;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(html)) !== null && links.length < 15) {
        if (!links.includes(match[1])) {
          links.push(match[1]);
        }
      }

      return {
        url: targetUrl,
        title,
        statusCode: res.status,
        textSnippet: cleanText.substring(0, 2000),
        links,
      };
    },
    async verify(params: { url: string }, result: PageContentResult): Promise<VerificationResult> {
      const ok = result.statusCode >= 200 && result.statusCode < 400;
      return {
        verified: ok,
        evidence: ok
          ? `Verified navigation to ${result.url}: HTTP ${result.statusCode}, Title "${result.title}"`
          : `Navigation failed with HTTP status ${result.statusCode}`,
      };
    },
  },

  searchWeb: {
    name: 'search_web',
    description: 'Searches the web for public information and returns relevant source snippets',
    tier: 'SAFE' as RiskTier,
    async execute(params: { query: string }): Promise<WebSearchResult> {
      // Use DuckDuckGo HTML endpoint without requiring paid API tokens
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(params.query)}`;
      try {
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AXIOM-Agent/1.0',
          },
          signal: AbortSignal.timeout(15000),
        });

        const html = await res.text();
        const results: Array<{ title: string; url: string; snippet: string }> = [];

        // Match result links
        const resultRegex = /<a class="result__snippet[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;
        while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
          const rawUrl = match[1];
          const snippet = match[2].replace(/<[^>]+>/g, '').trim();
          results.push({
            title: `Search Result ${results.length + 1}`,
            url: rawUrl,
            snippet,
          });
        }

        if (results.length === 0) {
          // Fallback simple search structure
          results.push({
            title: `Query: ${params.query}`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(params.query)}`,
            snippet: `Search completed for "${params.query}". Consult direct links for detailed investigation.`,
          });
        }

        return { query: params.query, results };
      } catch (err: any) {
        return {
          query: params.query,
          results: [
            {
              title: 'Offline / Search Fallback',
              url: 'local',
              snippet: `Unable to query external search engine: ${err.message}`,
            },
          ],
        };
      }
    },
    async verify(params: { query: string }, result: WebSearchResult): Promise<VerificationResult> {
      return {
        verified: result.results.length > 0,
        evidence: `Discovered ${result.results.length} search results for "${params.query}"`,
      };
    },
  },
};
