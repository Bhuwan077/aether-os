import { DrumTrackId, DrumTrackConfig, DrumPattern } from './types';

export const TRACK_CONFIGS: DrumTrackConfig[] = [
  { id: 'kick', name: 'Kick 808', color: '#f43f5e' },
  { id: 'snare', name: 'Snare 909', color: '#38bdf8' },
  { id: 'hihat_closed', name: 'Hat Closed', color: '#f59e0b' },
  { id: 'hihat_open', name: 'Hat Open', color: '#fbbf24' },
  { id: 'synth_pulse', name: 'Synth Bass', color: '#a855f7' },
  { id: 'cyber_beep', name: 'Cyber Blip', color: '#10b981' }
];

export const TOTAL_STEPS = 16;

export function createEmptyPattern(id = 'custom', name = 'Custom Groove', bpm = 124): DrumPattern {
  const tracks: Record<DrumTrackId, boolean[]> = {
    kick: Array(TOTAL_STEPS).fill(false),
    snare: Array(TOTAL_STEPS).fill(false),
    hihat_closed: Array(TOTAL_STEPS).fill(false),
    hihat_open: Array(TOTAL_STEPS).fill(false),
    synth_pulse: Array(TOTAL_STEPS).fill(false),
    cyber_beep: Array(TOTAL_STEPS).fill(false)
  };

  return { id, name, bpm, totalSteps: TOTAL_STEPS, tracks };
}

export function toggleStep(pattern: DrumPattern, trackId: DrumTrackId, stepIdx: number): DrumPattern {
  const newTrack = [...pattern.tracks[trackId]];
  newTrack[stepIdx] = !newTrack[stepIdx];

  return {
    ...pattern,
    tracks: {
      ...pattern.tracks,
      [trackId]: newTrack
    }
  };
}

export function computeStepIntervalMs(bpm: number, stepsPerBeat = 4): number {
  // (60,000 ms / bpm) / stepsPerBeat
  return Math.max(20, (60000 / bpm) / stepsPerBeat);
}

export function getNextStep(current: number, total = TOTAL_STEPS): number {
  return (current + 1) % total;
}

export const SEQUENCER_PRESETS: DrumPattern[] = [
  {
    id: 'synthwave_pulse',
    name: 'Synthwave 1984',
    bpm: 120,
    totalSteps: 16,
    tracks: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat_closed: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      hihat_open: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      synth_pulse: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      cyber_beep: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false]
    }
  },
  {
    id: 'techno_berlin',
    name: 'Berlin Cyber Techno',
    bpm: 132,
    totalSteps: 16,
    tracks: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      hihat_closed: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat_open: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      synth_pulse: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
      cyber_beep: [true, false, false, false, false, true, false, false, true, false, false, true, false, false, false, false]
    }
  },
  {
    id: 'cyber_breakbeat',
    name: 'Neural Breakbeat',
    bpm: 140,
    totalSteps: 16,
    tracks: {
      kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
      hihat_closed: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true],
      hihat_open: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      synth_pulse: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
      cyber_beep: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false]
    }
  }
];
