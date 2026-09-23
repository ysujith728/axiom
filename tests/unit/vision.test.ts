import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { VisionTools } from '../../packages/tools/src/tools/vision.js';

describe('VisionTools', () => {
  it('captures a screen and physically verifies output file existence', async () => {
    const testOutputPath = path.resolve('./temp_screen_test.png');
    try {
      const result = await VisionTools.captureScreen.execute({ outputPath: testOutputPath });
      expect(result.filePath).toBe(testOutputPath);
      expect(fs.existsSync(testOutputPath)).toBe(true);

      const verification = await VisionTools.captureScreen.verify({}, result);
      expect(verification.verified).toBe(true);
      expect(verification.evidence).toContain('Verified screenshot');
    } finally {
      if (fs.existsSync(testOutputPath)) {
        fs.unlinkSync(testOutputPath);
      }
    }
  });

  it('marks screen capture as SAFE risk tier', () => {
    expect(VisionTools.captureScreen.tier).toBe('SAFE');
  });
});
