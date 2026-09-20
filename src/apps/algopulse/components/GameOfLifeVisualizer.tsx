import React, { useState, useEffect, useRef } from 'react';
import { CellGrid, createEmptyGrid, computeNextGeneration, applyPreset } from '../algorithms/gameOfLife';
import { sound } from '../../../core/audio/soundEngine';
import { Play, Pause, RotateCcw, SkipForward, Sparkles } from 'lucide-react';

const ROWS = 28;
const COLS = 56;

export const GameOfLifeVisualizer: React.FC = () => {
  const [grid, setGrid] = useState<CellGrid>(() => applyPreset('glider', ROWS, COLS));
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(5);
  const [speed, setSpeed] = useState(80);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const timerRef = useRef<number | null>(null);

  const stepGen = () => {
    setGrid((prev) => {
      const { next, population: pop } = computeNextGeneration(prev);
      setPopulation(pop);
      return next;
    });
    setGeneration((g) => g + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(stepGen, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const toggleCell = (r: number, c: number) => {
    sound.playClick();
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  const handlePreset = (preset: 'glider' | 'pulsar' | 'spaceship' | 'random') => {
    setIsPlaying(false);
    setGeneration(0);
    const newGrid = applyPreset(preset, ROWS, COLS);
    setGrid(newGrid);
    sound.playSuccess();
  };

  const handleClear = () => {
    setIsPlaying(false);
    setGeneration(0);
    setPopulation(0);
    setGrid(createEmptyGrid(ROWS, COLS));
    sound.playClick();
  };

  return (
    <div
      onMouseUp={() => setIsMouseDown(false)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px' }}
    >
      {/* Control Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn-cyber ${isPlaying ? 'btn-cyber-primary' : ''}`}
            style={{ padding: '4px 12px' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          <button onClick={stepGen} disabled={isPlaying} className="btn-cyber" title="Step One Generation">
            <SkipForward size={14} />
          </button>

          <button onClick={handleClear} className="btn-cyber" title="Clear Grid">
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Preset:</span>
          <button onClick={() => handlePreset('glider')} className="btn-cyber" style={{ padding: '3px 8px' }}>
            Glider
          </button>
          <button onClick={() => handlePreset('spaceship')} className="btn-cyber" style={{ padding: '3px 8px' }}>
            Spaceship
          </button>
          <button onClick={() => handlePreset('pulsar')} className="btn-cyber" style={{ padding: '3px 8px' }}>
            Pulsar
          </button>
          <button onClick={() => handlePreset('random')} className="btn-cyber" style={{ padding: '3px 8px' }}>
            <Sparkles size={12} />
            Random
          </button>
        </div>

        {/* Speed & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Speed:</span>
            <input
              type="range"
              min={20}
              max={250}
              value={270 - speed}
              onChange={(e) => setSpeed(270 - Number(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--accent)' }}
            />
          </label>
          <span>Gen: <strong style={{ color: 'var(--accent)' }}>{generation}</strong></span>
          <span>Pop: <strong style={{ color: 'var(--success)' }}>{population}</strong></span>
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '1px',
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: 'rgba(3, 4, 10, 0.9)',
          overflow: 'hidden',
        }}
      >
        {grid.map((row, r) =>
          row.map((alive, c) => (
            <div
              key={`${r}-${c}`}
              onMouseDown={() => {
                setIsMouseDown(true);
                toggleCell(r, c);
              }}
              onMouseEnter={() => {
                if (isMouseDown) toggleCell(r, c);
              }}
              style={{
                backgroundColor: alive ? '#00f3ff' : 'rgba(255, 255, 255, 0.02)',
                boxShadow: alive ? '0 0 8px #00f3ff' : 'none',
                borderRadius: '1px',
                cursor: 'pointer',
                transition: 'background-color 0.1s ease',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
