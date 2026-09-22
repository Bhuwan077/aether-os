/**
 * BeatMatrix 16-step drum machine & sequencer types
 */

export type DrumTrackId =
  | 'kick'
  | 'snare'
  | 'hihat_closed'
  | 'hihat_open'
  | 'synth_pulse'
  | 'cyber_beep';

export interface DrumTrackConfig {
  id: DrumTrackId;
  name: string;
  color: string;
}

export interface DrumPattern {
  id: string;
  name: string;
  bpm: number;
  totalSteps: number;
  tracks: Record<DrumTrackId, boolean[]>;
}

export interface SequencerClockState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  volume: number;
}
