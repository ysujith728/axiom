/**
 * @axiom/voice - Offline local voice pipeline, wake-word state machine, and audio synthesis.
 */

import { EventEmitter } from 'node:events';
import type { AxiomRuntimeConfig } from '@axiom/config';

export type VoiceState = 'SLEEPING' | 'LISTENING' | 'TRANSCRIBING' | 'THINKING' | 'SPEAKING';

export interface VoiceEvent {
  state: VoiceState;
  transcript?: string;
  volumeLevel?: number;
}

export class VoiceManager extends EventEmitter {
  private currentState: VoiceState = 'SLEEPING';
  private wakeWord = 'Axiom';
  private config: AxiomRuntimeConfig;

  constructor(config: AxiomRuntimeConfig) {
    super();
    this.config = config;
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public setState(state: VoiceState): void {
    this.currentState = state;
    this.emit('state', { state: this.currentState });
  }

  public triggerWakeWord(): void {
    console.log(`[VoiceManager] Wake word "${this.wakeWord}" detected. Transitioning to LISTENING.`);
    this.setState('LISTENING');
  }

  public async speakText(text: string): Promise<void> {
    this.setState('SPEAKING');
    console.log(`[VoiceManager] TTS speaking: "${text.substring(0, 80)}..."`);
    // Simulated speech duration proportional to length
    const durationMs = Math.min(4000, Math.max(1000, text.length * 40));
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    this.setState('SLEEPING');
  }
}
