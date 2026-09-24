import { describe, it, expect } from 'vitest';
import { MouseKeyboardTools } from '../../packages/tools/src/tools/mouse_keyboard.js';

describe('MouseKeyboardTools', () => {
  it('executes mouse move and returns coordinates', async () => {
    const result = await MouseKeyboardTools.mouseMove.execute({ x: 100, y: 100 });
    expect(result.success).toBe(true);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);

    const verification = await MouseKeyboardTools.mouseMove.verify({ x: 100, y: 100 });
    expect(verification.verified).toBe(true);
    expect(verification.evidence).toContain('(100, 100)');
  });

  it('executes mouse click with specified button', async () => {
    const result = await MouseKeyboardTools.mouseClick.execute({ button: 'left' });
    expect(result.success).toBe(true);
    expect(result.button).toBe('left');

    const verification = await MouseKeyboardTools.mouseClick.verify({ button: 'left' });
    expect(verification.verified).toBe(true);
  });

  it('executes keyboard typing simulation', async () => {
    const result = await MouseKeyboardTools.keyboardType.execute({ text: 'Hello AXIOM' });
    expect(result.success).toBe(true);
    expect(result.characters).toBe(11);

    const verification = await MouseKeyboardTools.keyboardType.verify({ text: 'Hello AXIOM' });
    expect(verification.verified).toBe(true);
  });

  it('executes keyboard hotkey dispatch', async () => {
    const result = await MouseKeyboardTools.keyboardHotkey.execute({ hotkey: 'ctrl+c' });
    expect(result.success).toBe(true);

    const verification = await MouseKeyboardTools.keyboardHotkey.verify({ hotkey: 'ctrl+c' });
    expect(verification.verified).toBe(true);
  });
});
