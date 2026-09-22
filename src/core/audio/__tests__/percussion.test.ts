import { describe, it, expect, vi } from 'vitest';
import { SoundEngine } from '../soundEngine';

describe('SoundEngine Percussion & Drum Synthesis', () => {
  it('should safely execute playKick without throwing in headless environments', () => {
    const engine = new SoundEngine();
    expect(() => engine.playKick()).not.toThrow();
  });

  it('should safely execute playSnare without throwing in headless environments', () => {
    const engine = new SoundEngine();
    expect(() => engine.playSnare()).not.toThrow();
  });

  it('should safely execute playHiHat for both closed and open states', () => {
    const engine = new SoundEngine();
    expect(() => engine.playHiHat(true)).not.toThrow();
    expect(() => engine.playHiHat(false)).not.toThrow();
  });

  it('should not attempt synthesis when muted', () => {
    const engine = new SoundEngine();
    engine.toggleMute();
    expect(engine.isMuted()).toBe(true);

    const resumeSpy = vi.spyOn(engine, 'resume');
    engine.playKick();
    engine.playSnare();
    engine.playHiHat();

    expect(resumeSpy).not.toHaveBeenCalled();
  });
});
