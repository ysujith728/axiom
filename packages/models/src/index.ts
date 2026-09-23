/**
 * @axiom/models - Pluggable model abstraction, Ollama integration, and hardware-aware selection.
 */

import type { AxiomRuntimeConfig } from '@axiom/config';

export interface ModelMetadata {
  name: string;
  sizeBytes: number;
  format: string;
  family: string;
  parameterSize: string;
  quantizationLevel: string;
  role: 'GENERAL' | 'FAST' | 'CODING' | 'REASONING' | 'VISION';
  minRamRequiredMB: number;
  minVramRequiredMB: number;
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export class ModelManager {
  private config: AxiomRuntimeConfig;

  constructor(config: AxiomRuntimeConfig) {
    this.config = config;
  }

  /**
   * Checks if Ollama service is reachable.
   */
  public async isOllamaRunning(): Promise<boolean> {
    try {
      const res = await fetch(`${this.config.ollama.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetches installed models from local Ollama instance.
   */
  public async listInstalledModels(): Promise<ModelMetadata[]> {
    try {
      const res = await fetch(`${this.config.ollama.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const models = data.models || [];

      return models.map((m: any) => {
        const name = m.name || m.model;
        let role: ModelMetadata['role'] = 'GENERAL';
        if (name.includes('code') || name.includes('deepseek-coder')) role = 'CODING';
        else if (name.includes('qwen') || name.includes('1.5b') || name.includes('1b')) role = 'FAST';
        else if (name.includes('vision') || name.includes('llava')) role = 'VISION';

        return {
          name,
          sizeBytes: m.size || 0,
          format: m.details?.format || 'gguf',
          family: m.details?.family || 'llama',
          parameterSize: m.details?.parameter_size || '3B',
          quantizationLevel: m.details?.quantization_level || 'Q4_K_M',
          role,
          minRamRequiredMB: 4096,
          minVramRequiredMB: 1500,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Sends a completion request to Ollama with timeout and streaming support.
   */
  public async complete(
    messages: ModelMessage[],
    options?: { model?: string; temperature?: number; onToken?: (chunk: string) => void }
  ): Promise<string> {
    const isOnline = await this.isOllamaRunning();
    if (!isOnline) {
      throw new Error(
        `Ollama is not running at ${this.config.ollama.baseUrl}. Please start Ollama or verify local model setup.`
      );
    }

    const model = options?.model || this.config.ollama.defaultModel;
    const body = {
      model,
      messages,
      stream: !!options?.onToken,
      options: {
        temperature: options?.temperature ?? 0.2,
      },
    };

    const res = await fetch(`${this.config.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.ollama.timeoutMs),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama chat completion failed (${res.status}): ${errText}`);
    }

    if (!options?.onToken) {
      const data = await res.json();
      return data.message?.content || '';
    }

    // Stream chunks
    const reader = res.body?.getReader();
    if (!reader) throw new Error('Failed to get streaming response body');

    const decoder = new TextDecoder('utf8');
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const text = parsed.message?.content || '';
          fullResponse += text;
          options.onToken(text);
        } catch {
          // ignore partial chunks
        }
      }
    }

    return fullResponse;
  }
}
