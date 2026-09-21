import React, { useState, useEffect, useRef } from 'react';
import { PixelTool, CYBER_PALETTE } from './types';
import { sound } from '../../core/audio/soundEngine';
import {
  Paintbrush,
  Eraser,
  PaintBucket,
  Pipette,
  RotateCcw,
  Download,
  Grid,
  Play,
  Pause,
  Plus,
  Trash2,
} from 'lucide-react';

const GRID_SIZE = 24;

export const CyberPaint: React.FC = () => {
  const [frames, setFrames] = useState<string[][][]>([
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill('')),
  ]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [activeColor, setActiveColor] = useState<string>('#00f3ff');
  const [activeTool, setActiveTool] = useState<PixelTool>('pencil');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(false);
  const [animFps, setAnimFps] = useState<number>(4);

  const pixels = frames[currentFrameIdx] || frames[0];

  // Animation preview loop
  useEffect(() => {
    let timer: number;
    if (isPlayingAnim && frames.length > 1) {
      timer = window.setInterval(() => {
        setCurrentFrameIdx((prev) => (prev + 1) % frames.length);
      }, 1000 / animFps);
    }
    return () => clearInterval(timer);
  }, [isPlayingAnim, frames.length, animFps]);

  // Apply pixel tool
  const applyToolAt = (r: number, c: number) => {
    if (isPlayingAnim || r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;

    if (activeTool === 'dropper') {
      const picked = pixels[r][c];
      if (picked) {
        setActiveColor(picked);
        setActiveTool('pencil');
        sound.playClick();
      }
      return;
    }

    if (activeTool === 'bucket') {
      sound.playClick();
      const targetColor = pixels[r][c];
      if (targetColor === activeColor) return;

      const next = pixels.map((row) => [...row]);
      const queue: [number, number][] = [[r, c]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        const key = `${cr},${cc}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (next[cr][cc] === targetColor) {
          next[cr][cc] = activeColor;
          if (cr > 0) queue.push([cr - 1, cc]);
          if (cr < GRID_SIZE - 1) queue.push([cr + 1, cc]);
          if (cc > 0) queue.push([cc, cc - 1]);
          if (cc < GRID_SIZE - 1) queue.push([cc, cc + 1]);
        }
      }

      setFrames((all) => all.map((f, i) => (i === currentFrameIdx ? next : f)));
      return;
    }

    // Pencil or Eraser
    const color = activeTool === 'eraser' ? '' : activeColor;
    if (pixels[r][c] !== color) {
      setFrames((all) =>
        all.map((f, i) => {
          if (i !== currentFrameIdx) return f;
          const next = f.map((row) => [...row]);
          next[r][c] = color;
          return next;
        })
      );
    }
  };

  const handleAddFrame = () => {
    sound.playClick();
    const cloned = pixels.map((row) => [...row]);
    setFrames((prev) => [...prev, cloned]);
    setCurrentFrameIdx(frames.length);
  };

  const handleDeleteFrame = (idx: number) => {
    if (frames.length <= 1) return;
    sound.playClick();
    setFrames((prev) => prev.filter((_, i) => i !== idx));
    setCurrentFrameIdx((prev) => Math.max(0, prev - 1));
  };

  const handleClearCurrent = () => {
    sound.playClick();
    const empty = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(''));
    setFrames((all) => all.map((f, i) => (i === currentFrameIdx ? empty : f)));
  };

  const handleExport = () => {
    sound.playSuccess();
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE * 16;
    canvas.height = GRID_SIZE * 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (pixels[r][c]) {
          ctx.fillStyle = pixels[r][c];
          ctx.fillRect(c * 16, r * 16, 16, 16);
        }
      }
    }

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `cyberpaint-frame-${currentFrameIdx + 1}.png`;
    a.click();
  };

  return (
    <div
      onMouseUp={() => setIsMouseDown(false)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '10px', backgroundColor: 'rgba(6, 7, 14, 0.95)', color: '#e0f7fa' }}
    >
      {/* Top Toolbar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '6px',
        }}
      >
        {/* Tool Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => { sound.playClick(); setActiveTool('pencil'); }}
            className={`btn-cyber ${activeTool === 'pencil' ? 'btn-cyber-primary' : ''}`}
            title="Pencil"
          >
            <Paintbrush size={14} />
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTool('eraser'); }}
            className={`btn-cyber ${activeTool === 'eraser' ? 'btn-cyber-primary' : ''}`}
            title="Eraser"
          >
            <Eraser size={14} />
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTool('bucket'); }}
            className={`btn-cyber ${activeTool === 'bucket' ? 'btn-cyber-primary' : ''}`}
            title="Fill Bucket"
          >
            <PaintBucket size={14} />
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTool('dropper'); }}
            className={`btn-cyber ${activeTool === 'dropper' ? 'btn-cyber-primary' : ''}`}
            title="Eye Dropper"
          >
            <Pipette size={14} />
          </button>
        </div>

        {/* Color Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {CYBER_PALETTE.map((col) => {
            const isSelected = activeColor === col && activeTool !== 'eraser';
            return (
              <div
                key={col}
                onClick={() => {
                  sound.playClick();
                  setActiveColor(col);
                  if (activeTool === 'eraser') setActiveTool('pencil');
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  backgroundColor: col,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: isSelected ? '0 0 8px #ffffff' : 'none',
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`btn-cyber ${showGrid ? 'btn-cyber-primary' : ''}`}
            title="Toggle Grid Lines"
          >
            <Grid size={14} />
          </button>
          <button onClick={handleClearCurrent} className="btn-cyber" title="Clear Current Frame">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleExport} className="btn-cyber" title="Download Sprite PNG">
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Canvas View */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#04050a',
          padding: '8px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: showGrid ? '1px' : '0px',
            backgroundColor: showGrid ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            width: 'min(65vh, 380px)',
            height: 'min(65vh, 380px)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          }}
        >
          {pixels.map((row, r) =>
            row.map((color, c) => (
              <div
                key={`${r}-${c}`}
                onMouseDown={() => { setIsMouseDown(true); applyToolAt(r, c); }}
                onMouseEnter={() => { if (isMouseDown && activeTool !== 'bucket' && activeTool !== 'dropper') applyToolAt(r, c); }}
                style={{
                  backgroundColor: color || 'rgba(10, 10, 18, 0.95)',
                  cursor: activeTool === 'dropper' ? 'crosshair' : 'pointer',
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Animation Timeline Strip */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderRadius: '6px',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              sound.playClick();
              setIsPlayingAnim(!isPlayingAnim);
            }}
            className={`btn-cyber ${isPlayingAnim ? 'btn-cyber-primary' : ''}`}
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            {isPlayingAnim ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlayingAnim ? 'Stop' : 'Play'}</span>
          </button>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span>FPS:</span>
            <input
              type="range"
              min={1}
              max={12}
              value={animFps}
              onChange={(e) => setAnimFps(Number(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--accent)' }}
            />
            <span>{animFps}</span>
          </label>
        </div>

        {/* Frames Thumbnail Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          {frames.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                sound.playClick();
                setCurrentFrameIdx(idx);
              }}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: currentFrameIdx === idx ? 'rgba(0, 243, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: currentFrameIdx === idx ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>#{idx + 1}</span>
              {frames.length > 1 && (
                <Trash2
                  size={10}
                  color="var(--error)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFrame(idx);
                  }}
                />
              )}
            </div>
          ))}

          <button onClick={handleAddFrame} className="btn-cyber" style={{ padding: '3px 6px', fontSize: '10px' }} title="Add Frame">
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
