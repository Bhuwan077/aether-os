import { describe, it, expect } from 'vitest';
import {
  createEmptyPattern,
  toggleStep,
  computeStepIntervalMs,
  getNextStep,
  SEQUENCER_PRESETS,
  TRACK_CONFIGS,
  TOTAL_STEPS
} from '../engine/sequencer';

describe('BeatMatrix Sequencer Engine', () => {
  it('should initialize empty pattern with 16 steps per track', () => {
    const pattern = createEmptyPattern('test-id', 'Test Pattern', 128);
    expect(pattern.id).toBe('test-id');
    expect(pattern.bpm).toBe(128);
    expect(pattern.totalSteps).toBe(TOTAL_STEPS);

    for (const config of TRACK_CONFIGS) {
      expect(pattern.tracks[config.id]).toBeDefined();
      expect(pattern.tracks[config.id].length).toBe(TOTAL_STEPS);
      expect(pattern.tracks[config.id].every((s) => s === false)).toBe(true);
    }
  });

  it('should toggle individual steps accurately without state mutation', () => {
    const initial = createEmptyPattern();
    expect(initial.tracks.kick[0]).toBe(false);

    const toggled = toggleStep(initial, 'kick', 0);
    expect(toggled.tracks.kick[0]).toBe(true);
    expect(initial.tracks.kick[0]).toBe(false); // Immutability

    const untoggled = toggleStep(toggled, 'kick', 0);
    expect(untoggled.tracks.kick[0]).toBe(false);
  });

  it('should compute exact step millisecond intervals from BPM', () => {
    // At 120 BPM: 1 beat = 500ms => 1 sixteenth-note = 125ms
    expect(computeStepIntervalMs(120)).toBe(125);
    // At 60 BPM: 1 sixteenth-note = 250ms
    expect(computeStepIntervalMs(60)).toBe(250);
    // At 240 BPM: 1 sixteenth-note = 62.5ms
    expect(computeStepIntervalMs(240)).toBe(62.5);
  });

  it('should advance clock steps and loop cleanly', () => {
    expect(getNextStep(0)).toBe(1);
    expect(getNextStep(14)).toBe(15);
    expect(getNextStep(15)).toBe(0); // Loops back to step 0
  });

  it('should provide complete rhythmic presets for all drum tracks', () => {
    expect(SEQUENCER_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of SEQUENCER_PRESETS) {
      expect(preset.bpm).toBeGreaterThan(60);
      expect(preset.totalSteps).toBe(16);
      for (const track of TRACK_CONFIGS) {
        expect(preset.tracks[track.id]).toBeDefined();
        expect(preset.tracks[track.id].length).toBe(16);
      }
    }
  });
});
