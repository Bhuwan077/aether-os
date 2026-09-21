import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NeuralNetwork } from './engine/network';
import { DataPoint, ActivationType } from './engine/types';
import { sound } from '../../core/audio/soundEngine';
import { Play, Pause, RotateCcw, SkipForward, Sliders, Activity } from 'lucide-react';

export const NeuralPlayground: React.FC = () => {
  const [datasetType, setDatasetType] = useState<'circle' | 'xor' | 'spiral'>('circle');
  const [activation, setActivation] = useState<ActivationType>('tanh');
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [hiddenSize, setHiddenSize] = useState<number>(4);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);
  const [loss, setLoss] = useState<number>(0.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate 2D synthetic datasets
  const dataset = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    const N = 120;

    if (datasetType === 'circle') {
      for (let i = 0; i < N; i++) {
        const r = Math.random() < 0.5 ? Math.random() * 0.45 : 0.6 + Math.random() * 0.45;
        const theta = Math.random() * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        points.push({ x, y, label: r < 0.5 ? 1 : 0 });
      }
    } else if (datasetType === 'xor') {
      for (let i = 0; i < N; i++) {
        const x = (Math.random() * 2 - 1) * 0.9;
        const y = (Math.random() * 2 - 1) * 0.9;
        const label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
        points.push({ x, y, label });
      }
    } else if (datasetType === 'spiral') {
      for (let i = 0; i < N / 2; i++) {
        const r = (i / (N / 2)) * 0.95;
        const t = 1.75 * i * 0.15;
        points.push({ x: r * Math.sin(t), y: r * Math.cos(t), label: 1 });
        points.push({ x: -r * Math.sin(t), y: -r * Math.cos(t), label: 0 });
      }
    }

    return points;
  }, [datasetType]);

  // Model instance ref
  const modelRef = useRef<NeuralNetwork>(new NeuralNetwork([2, 4, 1], [activation, 'sigmoid']));

  // Re-initialize network when architecture changes
  useEffect(() => {
    modelRef.current = new NeuralNetwork([2, hiddenSize, 1], [activation, 'sigmoid']);
    setEpoch(0);
    setLoss(0.5);
  }, [hiddenSize, activation]);

  // Training step
  const stepTraining = () => {
    const model = modelRef.current;
    let l = 0;
    for (let i = 0; i < 4; i++) {
      l = model.trainStep(dataset, learningRate);
    }
    setLoss(Number(l.toFixed(4)));
    setEpoch((e) => e + 4);
  };

  // Training loop
  useEffect(() => {
    let animId: number;
    if (isTraining) {
      const loop = () => {
        stepTraining();
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isTraining, dataset, learningRate]);

  // Draw Decision Boundary Heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const model = modelRef.current;

    // 1. Heatmap background
    const res = 36;
    const cellW = width / res;
    const cellH = height / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x = (i / res) * 2.4 - 1.2;
        const y = 1.2 - (j / res) * 2.4;
        const pred = model.predict(x, y);

        // Interpolate cyan (0) to magenta/pink (1)
        const r = Math.round(pred * 255);
        const g = Math.round((1 - pred) * 243);
        const b = 255;
        const a = 0.25;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // 2. Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // 3. Scatter dataset points
    for (const pt of dataset) {
      const px = ((pt.x + 1.2) / 2.4) * width;
      const py = ((1.2 - pt.y) / 2.4) * height;

      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? '#ff007f' : '#00f3ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }, [dataset, epoch]);

  // Draw Network Architecture Graph
  useEffect(() => {
    const canvas = networkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const model = modelRef.current;
    const layers = [2, hiddenSize, 1];
    const layerXs = [40, w / 2, w - 40];

    // Compute neuron Y coordinates
    const neuronPositions: { x: number; y: number }[][] = [];
    for (let l = 0; l < layers.length; l++) {
      const count = layers[l];
      const positions: { x: number; y: number }[] = [];
      const spacing = h / (count + 1);
      for (let n = 0; n < count; n++) {
        positions.push({ x: layerXs[l], y: spacing * (n + 1) });
      }
      neuronPositions.push(positions);
    }

    // Draw Synaptic Connections (Weights)
    for (let l = 0; l < model.weights.length; l++) {
      const layerW = model.weights[l];
      for (let j = 0; j < layerW.length; j++) {
        for (let i = 0; i < layerW[j].length; i++) {
          const weight = layerW[j][i];
          const from = neuronPositions[l][i];
          const to = neuronPositions[l + 1][j];

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = weight >= 0 ? `rgba(0, 243, 255, ${Math.min(1, Math.abs(weight) * 0.8 + 0.15)})` : `rgba(255, 110, 0, ${Math.min(1, Math.abs(weight) * 0.8 + 0.15)})`;
          ctx.lineWidth = Math.min(4, Math.max(0.8, Math.abs(weight) * 1.5));
          ctx.stroke();
        }
      }
    }

    // Draw Neurons
    for (let l = 0; l < neuronPositions.length; l++) {
      for (let n = 0; n < neuronPositions[l].length; n++) {
        const pos = neuronPositions[l][n];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = l === 0 ? '#38bdf8' : (l === neuronPositions.length - 1 ? '#ff007f' : '#a855f7');
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [hiddenSize, epoch]);

  const handleReset = () => {
    sound.playClick();
    setIsTraining(false);
    modelRef.current = new NeuralNetwork([2, hiddenSize, 1], [activation, 'sigmoid']);
    setEpoch(0);
    setLoss(0.5);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px', backgroundColor: 'rgba(6, 7, 14, 0.95)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              sound.playClick();
              setIsTraining(!isTraining);
            }}
            className={`btn-cyber ${isTraining ? 'btn-cyber-primary' : ''}`}
            style={{ height: '28px', padding: '0 12px' }}
          >
            {isTraining ? <Pause size={13} /> : <Play size={13} />}
            <span>{isTraining ? 'Pause' : 'Train'}</span>
          </button>

          <button onClick={stepTraining} disabled={isTraining} className="btn-cyber" style={{ height: '28px' }} title="Single Epoch Step">
            <SkipForward size={13} />
          </button>

          <button onClick={handleReset} className="btn-cyber" style={{ height: '28px' }} title="Reset Weights">
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Dataset selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Data:</span>
          {(['circle', 'xor', 'spiral'] as const).map((d) => (
            <button
              key={d}
              onClick={() => {
                sound.playClick();
                setDatasetType(d);
                handleReset();
              }}
              className={`btn-cyber ${datasetType === d ? 'btn-cyber-primary' : ''}`}
              style={{ padding: '2px 8px', fontSize: '11px', textTransform: 'capitalize' }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Architecture & Params */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Neurons:</span>
            <input
              type="range"
              min={2}
              max={8}
              value={hiddenSize}
              onChange={(e) => setHiddenSize(Number(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--accent)' }}
            />
            <span>{hiddenSize}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>LR:</span>
            <select
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="btn-cyber"
              style={{ padding: '2px 6px', fontSize: '11px' }}
            >
              <option value={0.03} style={{ background: '#121220' }}>0.03</option>
              <option value={0.1} style={{ background: '#121220' }}>0.1</option>
              <option value={0.2} style={{ background: '#121220' }}>0.2</option>
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Act:</span>
            <select
              value={activation}
              onChange={(e) => setActivation(e.target.value as ActivationType)}
              className="btn-cyber"
              style={{ padding: '2px 6px', fontSize: '11px' }}
            >
              <option value="tanh" style={{ background: '#121220' }}>Tanh</option>
              <option value="relu" style={{ background: '#121220' }}>ReLU</option>
              <option value="sigmoid" style={{ background: '#121220' }}>Sigmoid</option>
            </select>
          </label>
        </div>

        {/* Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span>Epoch: <strong style={{ color: 'var(--accent)' }}>{epoch}</strong></span>
          <span>Loss: <strong style={{ color: loss < 0.1 ? 'var(--success)' : 'var(--warning)' }}>{loss}</strong></span>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div style={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {/* Heatmap Canvas */}
        <div
          className="glass-panel"
          style={{
            flex: 3,
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#04050a',
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{ width: '100%', height: '100%', maxWidth: '420px', maxHeight: '420px', display: 'block' }}
          />
          <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Decision Boundary Heatmap (Cyan: Class 0, Pink: Class 1)
          </div>
        </div>

        {/* Neural Network Architecture Topology */}
        <div
          className="glass-panel"
          style={{
            flex: 2,
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#04050a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span>NETWORK ARCHITECTURE</span>
            <Activity size={14} />
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas ref={networkCanvasRef} width={280} height={260} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Input (2)</span>
            <span>Hidden ({hiddenSize})</span>
            <span>Output (1)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
