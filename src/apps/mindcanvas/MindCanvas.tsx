import React, { useState, useEffect, useRef } from 'react';
import { GraphNode, GraphEdge } from './types';
import { sound } from '../../core/audio/soundEngine';
import { Plus, Play, Pause, RotateCcw, Download, Sparkles } from 'lucide-react';

const DEFAULT_NODES: GraphNode[] = [
  { id: 'kernel', label: 'Aether Kernel', x: 350, y: 220, vx: 0, vy: 0, radius: 24, color: '#00f3ff', group: 'core' },
  { id: 'vfs', label: 'VFS Storage', x: 230, y: 140, vx: 0, vy: 0, radius: 18, color: '#00ff88', group: 'core' },
  { id: 'audio', label: 'Web Audio Synth', x: 470, y: 140, vx: 0, vy: 0, radius: 18, color: '#ff007f', group: 'core' },
  { id: 'wm', label: 'Window Compositor', x: 350, y: 340, vx: 0, vy: 0, radius: 20, color: '#6366f1', group: 'core' },
  { id: 'term', label: 'RetroTerm', x: 170, y: 280, vx: 0, vy: 0, radius: 16, color: '#00ff66', group: 'apps' },
  { id: 'algo', label: 'AlgoPulse', x: 530, y: 280, vx: 0, vy: 0, radius: 16, color: '#ffb700', group: 'apps' },
  { id: 'code', label: 'CodeCraft', x: 200, y: 400, vx: 0, vy: 0, radius: 16, color: '#38bdf8', group: 'apps' },
  { id: 'synth', label: 'SynthLab', x: 500, y: 400, vx: 0, vy: 0, radius: 16, color: '#f43f5e', group: 'apps' },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { sourceId: 'kernel', targetId: 'vfs' },
  { sourceId: 'kernel', targetId: 'audio' },
  { sourceId: 'kernel', targetId: 'wm' },
  { sourceId: 'vfs', targetId: 'term' },
  { sourceId: 'vfs', targetId: 'code' },
  { sourceId: 'audio', targetId: 'algo' },
  { sourceId: 'audio', targetId: 'synth' },
  { sourceId: 'wm', targetId: 'term' },
  { sourceId: 'wm', targetId: 'algo' },
  { sourceId: 'wm', targetId: 'code' },
  { sourceId: 'wm', targetId: 'synth' },
];

export const MindCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(DEFAULT_EDGES);
  const [physicsActive, setPhysicsActive] = useState(true);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>(nodes);
  const edgesRef = useRef<GraphEdge[]>(edges);
  const physicsRef = useRef(physicsActive);

  nodesRef.current = nodes;
  edgesRef.current = edges;
  physicsRef.current = physicsActive;

  // Add a new node
  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    sound.playSuccess();
    const colors = ['#00f3ff', '#ff007f', '#00ff88', '#ffb700', '#a855f7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const id = `node-${Date.now()}`;

    const newNode: GraphNode = {
      id,
      label: newNodeLabel.trim(),
      x: 300 + (Math.random() - 0.5) * 100,
      y: 250 + (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0,
      radius: 16,
      color: randomColor,
      group: 'custom',
    };

    setNodes((prev) => [...prev, newNode]);
    // Connect to central kernel by default
    setEdges((prev) => [...prev, { sourceId: 'kernel', targetId: id }]);
    setNewNodeLabel('');
  };

  const resetGraph = () => {
    sound.playClick();
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playSuccess();
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aether-architecture-graph.png';
    a.click();
  };

  // Mouse interaction for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const node of nodesRef.current) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      if (Math.hypot(dx, dy) <= node.radius + 6) {
        sound.playClick();
        setDraggedNodeId(node.id);
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNodeId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggedNodeId ? { ...n, x: mouseX, y: mouseY, vx: 0, vy: 0 } : n
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  // Physics animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;
      const currNodes = nodesRef.current;
      const currEdges = edgesRef.current;

      // Force-directed simulation step
      if (physicsRef.current) {
        // Repulsion (Coulomb)
        for (let i = 0; i < currNodes.length; i++) {
          for (let j = i + 1; j < currNodes.length; j++) {
            const a = currNodes[i];
            const b = currNodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;

            if (dist < 220) {
              const force = (220 - dist) / dist * 0.08;
              a.vx -= dx * force;
              a.vy -= dy * force;
              b.vx += dx * force;
              b.vy += dy * force;
            }
          }
        }

        // Spring Attraction (Hooke)
        for (const edge of currEdges) {
          const a = currNodes.find((n) => n.id === edge.sourceId);
          const b = currNodes.find((n) => n.id === edge.targetId);
          if (!a || !b) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const targetDist = 110;
          const force = (dist - targetDist) * 0.005;

          a.vx += dx * force;
          a.vy += dy * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
        }

        // Center gravity and damping
        for (const node of currNodes) {
          node.vx += (w / 2 - node.x) * 0.001;
          node.vy += (h / 2 - node.y) * 0.001;

          node.vx *= 0.88;
          node.vy *= 0.88;

          node.x += node.vx;
          node.y += node.vy;

          // Boundary constraints
          node.x = Math.max(node.radius + 10, Math.min(w - node.radius - 10, node.x));
          node.y = Math.max(node.radius + 10, Math.min(h - node.radius - 10, node.y));
        }
      }

      // Render
      ctx.fillStyle = '#06060e';
      ctx.fillRect(0, 0, w, h);

      // Grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 0; x < w; x += 30) {
        for (let y = 0; y < h; y += 30) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Draw Edges
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (const edge of currEdges) {
        const a = currNodes.find((n) => n.id === edge.sourceId);
        const b = currNodes.find((n) => n.id === edge.targetId);
        if (!a || !b) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw Nodes
      for (const node of currNodes) {
        // Glow
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = "11px 'Fira Code', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px' }}>
      {/* Controls Header */}
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
          <input
            type="text"
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
            placeholder="New concept / module..."
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              width: '180px',
            }}
          />
          <button onClick={handleAddNode} className="btn-cyber btn-cyber-primary" style={{ height: '28px' }}>
            <Plus size={13} />
            <span>Add Node</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setPhysicsActive(!physicsActive)}
            className={`btn-cyber ${physicsActive ? 'btn-cyber-primary' : ''}`}
            style={{ height: '28px' }}
          >
            {physicsActive ? <Pause size={13} /> : <Play size={13} />}
            <span>Physics {physicsActive ? 'Active' : 'Frozen'}</span>
          </button>

          <button onClick={resetGraph} className="btn-cyber" style={{ height: '28px' }} title="Reset Architecture Graph">
            <RotateCcw size={13} />
          </button>

          <button onClick={exportImage} className="btn-cyber" style={{ height: '28px' }} title="Export as PNG">
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Canvas View */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#06060e',
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ width: '100%', height: '100%', display: 'block', cursor: draggedNodeId ? 'grabbing' : 'grab' }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Force-directed spring physics layout • Drag nodes to reposition
        </div>
      </div>
    </div>
  );
};
