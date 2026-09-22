import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  Sliders,
  Music,
  Download,
  Flame
} from 'lucide-react';
import { sound } from '../../core/audio/soundEngine';
import {
  DrumTrackId,
  DrumPattern,
  DrumTrackConfig
} from './engine/types';
import {
  TRACK_CONFIGS,
  TOTAL_STEPS,
  createEmptyPattern,
  toggleStep,
  computeStepIntervalMs,
  getNextStep,
  SEQUENCER_PRESETS
} from './engine/sequencer';

export const BeatMatrix: React.FC = () => {
  const [pattern, setPattern] = useState<DrumPattern>(() => SEQUENCER_PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(SEQUENCER_PRESETS[0].bpm);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const patternRef = useRef(pattern);
  patternRef.current = pattern;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play sound for active step tracks
  const triggerStepSounds = (step: number) => {
    const curPattern = patternRef.current;

    if (curPattern.tracks.kick[step]) {
      sound.playKick();
    }
    if (curPattern.tracks.snare[step]) {
      sound.playSnare();
    }
    if (curPattern.tracks.hihat_closed[step]) {
      sound.playHiHat(true);
    }
    if (curPattern.tracks.hihat_open[step]) {
      sound.playHiHat(false);
    }
    if (curPattern.tracks.synth_pulse[step]) {
      sound.playTone(110, 0.12, 'sawtooth', 0.25);
    }
    if (curPattern.tracks.cyber_beep[step]) {
      sound.playTone(880, 0.05, 'sine', 0.15);
    }
  };

  // Clock runner
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = computeStepIntervalMs(bpm);

    timerRef.current = setInterval(() => {
      const next = getNextStep(currentStepRef.current);
      setCurrentStep(next);
      triggerStepSounds(next);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm]);

  const handleTogglePlay = () => {
    sound.resume();
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    sound.playTone(nextState ? 600 : 350, 0.04);
  };

  const handlePadClick = (trackId: DrumTrackId, stepIdx: number) => {
    const updated = toggleStep(pattern, trackId, stepIdx);
    setPattern(updated);

    // Audio preview on click
    if (trackId === 'kick') sound.playKick();
    else if (trackId === 'snare') sound.playSnare();
    else if (trackId === 'hihat_closed') sound.playHiHat(true);
    else if (trackId === 'hihat_open') sound.playHiHat(false);
    else if (trackId === 'synth_pulse') sound.playTone(110, 0.1, 'sawtooth', 0.2);
    else if (trackId === 'cyber_beep') sound.playTone(880, 0.05, 'sine', 0.15);
  };

  const handleLoadPreset = (presetId: string) => {
    sound.playTone(550, 0.06);
    const preset = SEQUENCER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPattern(JSON.parse(JSON.stringify(preset)));
      setBpm(preset.bpm);
    }
  };

  const handleClear = () => {
    sound.playTone(300, 0.06);
    setPattern(createEmptyPattern('custom', 'Custom Beat', bpm));
  };

  const handleRandomize = () => {
    sound.playTone(720, 0.08, 'triangle', 0.2);
    const empty = createEmptyPattern('random', 'Neural Groove', bpm);
    for (const track of TRACK_CONFIGS) {
      const density = track.id === 'hihat_closed' ? 0.7 : track.id === 'kick' ? 0.35 : 0.25;
      empty.tracks[track.id] = Array.from({ length: TOTAL_STEPS }, () => Math.random() < density);
    }
    setPattern(empty);
  };

  const handleExportPattern = () => {
    sound.playTone(800, 0.05);
    const blob = new Blob([JSON.stringify(pattern, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beatmatrix_${pattern.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-rose-400" />
          <span className="font-semibold tracking-wide text-rose-400">BeatMatrix</span>
          <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-mono">
            16-Step Percussion Sequencer
          </span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => handleLoadPreset(e.target.value)}
            value={pattern.id}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-rose-500 font-mono"
          >
            {SEQUENCER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.bpm} BPM)
              </option>
            ))}
          </select>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded font-semibold text-white transition font-mono text-xs shadow ${
              isPlaying ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Stop' : 'Start'}
          </button>

          <button
            onClick={handleRandomize}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
            title="Randomize pattern"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Randomize
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
            title="Clear grid"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            onClick={handleExportPattern}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
            title="Export pattern JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Tempo & Info Bar */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-slate-300">
              Tempo: <strong className="text-rose-400 text-sm">{bpm}</strong> BPM
            </span>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-36 accent-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>Step:</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-rose-400 border border-slate-800 font-bold">
              {currentStep + 1} / 16
            </span>
          </div>
        </div>

        {/* Step Indicator Header (1..16) */}
        <div className="flex items-center mb-2 pl-32 pr-2">
          {Array.from({ length: TOTAL_STEPS }, (_, s) => {
            const isCurrent = currentStep === s && isPlaying;
            const isBeatStart = s % 4 === 0;
            return (
              <div
                key={s}
                className={`flex-1 text-center font-mono text-[10px] py-1 rounded transition-colors ${
                  isCurrent
                    ? 'bg-rose-500 text-white font-bold shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : isBeatStart
                    ? 'text-slate-300 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {s + 1}
              </div>
            );
          })}
        </div>

        {/* Drum Track Rows */}
        <div className="space-y-2 flex-1">
          {TRACK_CONFIGS.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition"
            >
              {/* Track Name Badge */}
              <div className="w-28 flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: track.color }} />
                <span className="text-xs font-mono font-medium text-slate-300 truncate">{track.name}</span>
              </div>

              {/* 16 Step Pads */}
              <div className="flex-1 flex gap-1">
                {Array.from({ length: TOTAL_STEPS }, (_, sIdx) => {
                  const isActive = pattern.tracks[track.id][sIdx];
                  const isCurrent = currentStep === sIdx && isPlaying;
                  const isBeatStart = sIdx % 4 === 0;

                  return (
                    <button
                      key={sIdx}
                      onClick={() => handlePadClick(track.id, sIdx)}
                      style={{
                        backgroundColor: isActive
                          ? track.color
                          : isCurrent
                          ? 'rgba(255,255,255,0.15)'
                          : isBeatStart
                          ? '#0f172a'
                          : '#090d16'
                      }}
                      className={`flex-1 h-12 rounded-lg border transition-all ${
                        isCurrent
                          ? 'border-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                          : isActive
                          ? 'border-white/30 shadow-[0_0_6px_rgba(0,0,0,0.5)]'
                          : isBeatStart
                          ? 'border-slate-700/80 hover:border-slate-500'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
