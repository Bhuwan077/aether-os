import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Orbit,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sparkles,
  Layers,
  Activity,
  Sliders,
  Maximize2,
  Trash2
} from 'lucide-react';
import { sound } from '../../core/audio/soundEngine';
import {
  CelestialBody,
  SimulationConfig,
  Vector2D
} from './engine/types';
import {
  DEFAULT_CONFIG,
  stepSimulation,
  computeSystemEnergy
} from './engine/nbody';
import { ORBITAL_PRESETS } from './engine/presets';

export const CelestialOrbits: React.FC = () => {
  const [bodies, setBodies] = useState<CelestialBody[]>(() =>
    JSON.parse(JSON.stringify(ORBITAL_PRESETS[0].bodies))
  );
  const [config, setConfig] = useState<SimulationConfig>({ ...DEFAULT_CONFIG });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('solar_system');
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(false);
  const [spawnMass, setSpawnMass] = useState<number>(20);
  const [spawnColor, setSpawnColor] = useState<string>('#38bdf8');

  // Interactive sling state
  const [dragStart, setDragStart] = useState<Vector2D | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Vector2D | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const bodiesRef = useRef<CelestialBody[]>(bodies);
  bodiesRef.current = bodies;

  const [telemetry, setTelemetry] = useState({
    kinetic: 0,
    potential: 0,
    total: 0,
    bodyCount: bodies.length
  });

  // Load preset
  const handleLoadPreset = (presetId: string) => {
    sound.playTone(520, 0.08, 'sine', 0.15);
    const preset = ORBITAL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      const cloned = JSON.parse(JSON.stringify(preset.bodies));
      setBodies(cloned);
    }
  };

  // Reset current preset
  const handleReset = () => {
    sound.playTone(400, 0.08, 'sine', 0.15);
    handleLoadPreset(selectedPreset);
  };

  // Clear all bodies
  const handleClear = () => {
    sound.playTone(300, 0.08, 'sine', 0.15);
    setBodies([]);
  };

  // Step simulation frame
  const step = useCallback(() => {
    const dt = 0.016; // 60 FPS standard delta
    setBodies((prev) => {
      const next = stepSimulation(prev, config, dt);
      return next;
    });
  }, [config]);

  // Main animation loop
  useEffect(() => {
    let lastEnergyUpdate = 0;

    const loop = (timestamp: number) => {
      if (isPlaying) {
        step();
      }

      if (timestamp - lastEnergyUpdate > 250) {
        const energy = computeSystemEnergy(bodiesRef.current, config.G);
        setTelemetry({
          kinetic: energy.kinetic,
          potential: energy.potential,
          total: energy.total,
          bodyCount: bodiesRef.current.length
        });
        lastEnergyUpdate = timestamp;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, step, config.G]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = (cx % gridSize); x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = (cy % gridSize); y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Origin crosshair
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    // Draw Trails
    if (showTrails) {
      for (const body of bodies) {
        if (body.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = body.color;
          for (let i = 0; i < body.trail.length; i++) {
            const pt = body.trail[i];
            const px = cx + pt.x;
            const py = cy + pt.y;
            const alpha = (i / body.trail.length) * 0.4;
            ctx.globalAlpha = alpha;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.lineWidth = Math.max(1, body.radius * 0.4);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // Draw Bodies
    for (const body of bodies) {
      const bx = cx + body.x;
      const by = cy + body.y;

      // Glow gradient
      const glow = ctx.createRadialGradient(bx, by, body.radius * 0.5, bx, by, body.radius * 2.5);
      glow.addColorStop(0, body.color);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, body.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Solid sphere
      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(bx, by, body.radius, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(body.name, bx, by + body.radius + 12);

      // Velocity vectors
      if (showVectors && !body.fixed) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + body.vx * 4, by + body.vy * 4);
        ctx.stroke();
      }
    }

    // Interactive launch sling preview
    if (dragStart && dragCurrent) {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(dragCurrent.x, dragCurrent.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spawn body preview
      ctx.fillStyle = spawnColor;
      ctx.beginPath();
      ctx.arc(dragStart.x, dragStart.y, Math.max(3, Math.cbrt(spawnMass) * 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }, [bodies, showTrails, showVectors, dragStart, dragCurrent, spawnColor, spawnMass]);

  // Mouse Sling Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragCurrent({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart || !dragCurrent || !canvasRef.current) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const posX = dragStart.x - cx;
    const posY = dragStart.y - cy;

    // Sling velocity (opposite direction of drag)
    const vx = (dragStart.x - dragCurrent.x) * 0.08;
    const vy = (dragStart.y - dragCurrent.y) * 0.08;

    const newBody: CelestialBody = {
      id: `body_${Date.now()}`,
      name: `Probe-${bodies.length + 1}`,
      x: posX,
      y: posY,
      vx,
      vy,
      mass: spawnMass,
      radius: Math.max(3, Math.cbrt(spawnMass) * 2),
      color: spawnColor,
      trail: []
    };

    sound.playTone(600, 0.06, 'sine', 0.2);
    setBodies((prev) => [...prev, newBody]);
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-amber-400" />
          <span className="font-semibold tracking-wide text-amber-400">CelestialOrbits</span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-mono">
            N-Body Gravitation
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedPreset}
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
          >
            {ORBITAL_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              sound.playTone(isPlaying ? 350 : 550, 0.05);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-white transition font-mono ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Simulate'}
          </button>

          <button
            onClick={() => {
              step();
              sound.playTone(450, 0.04);
            }}
            disabled={isPlaying}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded transition"
            title="Step 1 Frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
            title="Reset System"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-300 rounded transition"
            title="Clear All Bodies"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Simulation Canvas & Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={480}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-crosshair block"
          />

          {/* Telemetry Overlay Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] space-y-1 shadow-lg pointer-events-none">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <Activity className="w-3 h-3" />
              <span>Telemetry</span>
            </div>
            <div className="text-slate-400">Bodies: <span className="text-slate-200">{telemetry.bodyCount}</span></div>
            <div className="text-slate-400">Kinetic E: <span className="text-cyan-400">{telemetry.kinetic}</span></div>
            <div className="text-slate-400">Potential E: <span className="text-rose-400">{telemetry.potential}</span></div>
            <div className="text-slate-400">Total E: <span className="text-emerald-400 font-bold">{telemetry.total}</span></div>
          </div>

          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500 pointer-events-none">
            Tip: Click and drag anywhere to launch a new celestial mass with a slingshot vector.
          </div>
        </div>

        {/* Right Settings Sidebar */}
        <div className="w-64 border-l border-slate-800 bg-slate-900/50 p-3 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Simulation Parameters
          </div>

          {/* Sliders */}
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Gravity (G):</span>
                <span className="text-amber-400">{config.G}</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={config.G}
                onChange={(e) => setConfig({ ...config, G: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Time Warp:</span>
                <span className="text-amber-400">{config.timeScale}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={config.timeScale}
                onChange={(e) => setConfig({ ...config, timeScale: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Softening (ε):</span>
                <span className="text-amber-400">{config.softening}</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={config.softening}
                onChange={(e) => setConfig({ ...config, softening: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Visual Toggles */}
          <div className="space-y-2 text-xs font-mono">
            <span className="text-slate-400 uppercase text-[10px] block">Display Layers</span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showTrails}
                onChange={(e) => setShowTrails(e.target.checked)}
                className="accent-amber-500"
              />
              Particle Orbit Trails
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="accent-amber-500"
              />
              Velocity Vectors
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={config.collisions}
                onChange={(e) => setConfig({ ...config, collisions: e.target.checked })}
                className="accent-amber-500"
              />
              Inelastic Collisions
            </label>
          </div>

          <hr className="border-slate-800" />

          {/* Launcher Customizer */}
          <div className="space-y-2 text-xs font-mono">
            <span className="text-slate-400 uppercase text-[10px] block">Launcher Mass & Color</span>
            <div className="flex items-center justify-between text-slate-400">
              <span>Mass:</span>
              <span className="text-amber-400">{spawnMass}</span>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={spawnMass}
              onChange={(e) => setSpawnMass(Number(e.target.value))}
              className="w-full accent-amber-500"
            />

            <div className="flex gap-2 pt-1">
              {['#38bdf8', '#34d399', '#f59e0b', '#ec4899', '#a78bfa'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSpawnColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    spawnColor === c ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
