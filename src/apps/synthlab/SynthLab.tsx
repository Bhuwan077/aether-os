import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../core/audio/soundEngine';
import { Music, Sliders, Activity, Disc } from 'lucide-react';

interface NoteKey {
  note: string;
  freq: number;
  keyChar: string;
  isBlack: boolean;
}

const NOTES: NoteKey[] = [
  { note: 'C3', freq: 130.81, keyChar: 'Z', isBlack: false },
  { note: 'C#3', freq: 138.59, keyChar: 'S', isBlack: true },
  { note: 'D3', freq: 146.83, keyChar: 'X', isBlack: false },
  { note: 'D#3', freq: 155.56, keyChar: 'D', isBlack: true },
  { note: 'E3', freq: 164.81, keyChar: 'C', isBlack: false },
  { note: 'F3', freq: 174.61, keyChar: 'V', isBlack: false },
  { note: 'F#3', freq: 185.00, keyChar: 'G', isBlack: true },
  { note: 'G3', freq: 196.00, keyChar: 'B', isBlack: false },
  { note: 'G#3', freq: 207.65, keyChar: 'H', isBlack: true },
  { note: 'A3', freq: 220.00, keyChar: 'N', isBlack: false },
  { note: 'A#3', freq: 233.08, keyChar: 'J', isBlack: true },
  { note: 'B3', freq: 246.94, keyChar: 'M', isBlack: false },
  { note: 'C4', freq: 261.63, keyChar: 'Q', isBlack: false },
  { note: 'C#4', freq: 277.18, keyChar: '2', isBlack: true },
  { note: 'D4', freq: 293.66, keyChar: 'W', isBlack: false },
  { note: 'D#4', freq: 311.13, keyChar: '3', isBlack: true },
  { note: 'E4', freq: 329.63, keyChar: 'E', isBlack: false },
  { note: 'F4', freq: 349.23, keyChar: 'R', isBlack: false },
  { note: 'F#4', freq: 369.99, keyChar: '5', isBlack: true },
  { note: 'G4', freq: 392.00, keyChar: 'T', isBlack: false },
  { note: 'G#4', freq: 415.30, keyChar: '6', isBlack: true },
  { note: 'A4', freq: 440.00, keyChar: 'Y', isBlack: false },
  { note: 'A#4', freq: 466.16, keyChar: '7', isBlack: true },
  { note: 'B4', freq: 493.88, keyChar: 'U', isBlack: false },
  { note: 'C5', freq: 523.25, keyChar: 'I', isBlack: false },
];

export const SynthLab: React.FC = () => {
  const [waveType, setWaveType] = useState<OscillatorType>('sawtooth');
  const [attack, setAttack] = useState(0.04);
  const [decay, setDecay] = useState(0.15);
  const [sustain, setSustain] = useState(0.4);
  const [release, setRelease] = useState(0.3);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Play note using sound engine
  const playNote = (note: NoteKey) => {
    sound.playTone(note.freq, release + decay, waveType, sustain + 0.2);
    setActiveNotes((prev) => new Set(prev).add(note.note));
    setTimeout(() => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note.note);
        return next;
      });
    }, 200);
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const match = NOTES.find((n) => n.keyChar === key);
      if (match) {
        playNote(match);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waveType, sustain, release, decay]);

  // Real-time oscilloscope animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const analyser = sound.getAnalyser();

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = 'rgba(8, 8, 16, 0.25)';
      ctx.fillRect(0, 0, width, height);

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00f3ff';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Frequency bars
        const freqArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqArray);
        const barWidth = (width / bufferLength) * 2;
        let bx = 0;

        for (let i = 0; i < bufferLength / 2; i++) {
          const barHeight = (freqArray[i] / 255) * height * 0.6;
          ctx.fillStyle = `rgba(255, 0, 128, ${freqArray[i] / 300 + 0.1})`;
          ctx.fillRect(bx, height - barHeight, barWidth - 1, barHeight);
          bx += barWidth;
        }
      } else {
        // Idle ambient line
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  const loadPreset = (preset: 'cyber-bass' | 'neon-lead' | 'space-pad' | 'retro-pluck') => {
    sound.playClick();
    if (preset === 'cyber-bass') {
      setWaveType('sawtooth');
      setAttack(0.01);
      setDecay(0.2);
      setSustain(0.6);
      setRelease(0.15);
    } else if (preset === 'neon-lead') {
      setWaveType('square');
      setAttack(0.02);
      setDecay(0.1);
      setSustain(0.8);
      setRelease(0.25);
    } else if (preset === 'space-pad') {
      setWaveType('sine');
      setAttack(0.25);
      setDecay(0.4);
      setSustain(0.7);
      setRelease(0.6);
    } else if (preset === 'retro-pluck') {
      setWaveType('triangle');
      setAttack(0.01);
      setDecay(0.12);
      setSustain(0.2);
      setRelease(0.18);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px' }}>
      {/* Top Deck: Oscilloscope + Controls */}
      <div style={{ display: 'flex', gap: '12px', height: '140px' }}>
        {/* Oscilloscope Canvas */}
        <div
          className="glass-panel"
          style={{
            flex: 2,
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#05050b',
            boxShadow: 'inset 0 0 20px rgba(0, 243, 255, 0.1)',
          }}
        >
          <canvas ref={canvasRef} width={400} height={140} style={{ width: '100%', height: '100%', display: 'block' }} />
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '8px',
              fontSize: '10px',
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Activity size={12} />
            <span>REAL-TIME FFT OSCILLOSCOPE</span>
          </div>
        </div>

        {/* Synth Parameters Deck */}
        <div
          className="glass-panel"
          style={{
            flex: 3,
            padding: '10px 14px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Waveforms & Presets */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['sawtooth', 'square', 'sine', 'triangle'] as OscillatorType[]).map((wt) => (
                <button
                  key={wt}
                  onClick={() => {
                    setWaveType(wt);
                    sound.playClick();
                  }}
                  className={`btn-cyber ${waveType === wt ? 'btn-cyber-primary' : ''}`}
                  style={{ textTransform: 'capitalize', fontSize: '11px', padding: '3px 8px' }}
                >
                  {wt}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => loadPreset('cyber-bass')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>Bass</button>
              <button onClick={() => loadPreset('neon-lead')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>Lead</button>
              <button onClick={() => loadPreset('space-pad')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>Pad</button>
              <button onClick={() => loadPreset('retro-pluck')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>Pluck</button>
            </div>
          </div>

          {/* ADSR Sliders */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <span>Attack: {attack}s</span>
              <input type="range" min={0.01} max={0.5} step={0.01} value={attack} onChange={(e) => setAttack(Number(e.target.value))} style={{ width: '70px', accentColor: 'var(--accent)' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <span>Decay: {decay}s</span>
              <input type="range" min={0.01} max={0.5} step={0.01} value={decay} onChange={(e) => setDecay(Number(e.target.value))} style={{ width: '70px', accentColor: 'var(--accent)' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <span>Sustain: {Math.round(sustain * 100)}%</span>
              <input type="range" min={0} max={1} step={0.05} value={sustain} onChange={(e) => setSustain(Number(e.target.value))} style={{ width: '70px', accentColor: 'var(--accent)' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <span>Release: {release}s</span>
              <input type="range" min={0.05} max={1.2} step={0.05} value={release} onChange={(e) => setRelease(Number(e.target.value))} style={{ width: '70px', accentColor: 'var(--accent)' }} />
            </label>
          </div>
        </div>
      </div>

      {/* Virtual Piano Keyboard Deck */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#070712',
          position: 'relative',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', position: 'relative', height: '100%', minWidth: '600px' }}>
          {NOTES.filter((n) => !n.isBlack).map((whiteKey) => {
            const isPressed = activeNotes.has(whiteKey.note);
            return (
              <div
                key={whiteKey.note}
                onMouseDown={() => playNote(whiteKey)}
                style={{
                  flex: 1,
                  minWidth: '38px',
                  backgroundColor: isPressed ? 'var(--accent)' : '#e2e8f0',
                  boxShadow: isPressed ? '0 0 16px var(--accent)' : 'inset 0 -4px 0 #94a3b8',
                  borderRadius: '0 0 6px 6px',
                  border: '1px solid #1e293b',
                  marginRight: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: '8px',
                  userSelect: 'none',
                  transition: 'background-color 0.05s ease, transform 0.05s ease',
                  transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{whiteKey.note}</span>
                <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>[{whiteKey.keyChar}]</span>
              </div>
            );
          })}

          {/* Black Keys Overlay */}
          {NOTES.map((n, idx) => {
            if (!n.isBlack) return null;
            const isPressed = activeNotes.has(n.note);
            // Calculate proportional offset
            const whiteCountBefore = NOTES.slice(0, idx).filter((k) => !k.isBlack).length;
            const leftPercent = (whiteCountBefore / NOTES.filter((k) => !k.isBlack).length) * 100;

            return (
              <div
                key={n.note}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  playNote(n);
                }}
                style={{
                  position: 'absolute',
                  left: `calc(${leftPercent}% - 14px)`,
                  top: 0,
                  width: '26px',
                  height: '62%',
                  backgroundColor: isPressed ? '#ff007f' : '#1e1b2e',
                  boxShadow: isPressed ? '0 0 14px #ff007f' : '0 4px 8px rgba(0,0,0,0.8)',
                  borderRadius: '0 0 4px 4px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  zIndex: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: '6px',
                  userSelect: 'none',
                  transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
                  transition: 'background-color 0.05s ease',
                }}
              >
                <span style={{ fontSize: '8px', color: '#00f3ff', fontFamily: 'var(--font-mono)' }}>{n.keyChar}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
