import { describe, it, expect } from 'vitest';
import { SoundEngine } from '../soundEngine';

describe('SoundEngine', () => {
  it('should initialize with default volume and unmuted state', () => {
    const engine = new SoundEngine();
    expect(engine.isMuted()).toBe(false);
    expect(engine.getVolume()).toBe(0.3);
  });

  it('should clamp volume between 0 and 1', () => {
    const engine = new SoundEngine();
    engine.setVolume(1.5);
    expect(engine.getVolume()).toBe(1);

    engine.setVolume(-0.5);
    expect(engine.getVolume()).toBe(0);

    engine.setVolume(0.75);
    expect(engine.getVolume()).toBe(0.75);
  });

  it('should toggle mute correctly', () => {
    const engine = new SoundEngine();
    expect(engine.isMuted()).toBe(false);
    const muted = engine.toggleMute();
    expect(muted).toBe(true);
    expect(engine.isMuted()).toBe(true);

    const unmuted = engine.toggleMute();
    expect(unmuted).toBe(false);
    expect(engine.isMuted()).toBe(false);
  });
});
