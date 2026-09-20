import React, { useState, useRef } from 'react';
import { PathfindingAlgorithmId, GridNode } from '../types';
import { createInitialGrid, runPathfinding } from '../algorithms/pathfinding';
import { sound } from '../../../core/audio/soundEngine';
import { Play, RotateCcw, Sparkles, MapPin, Target } from 'lucide-react';

const ROWS = 18;
const COLS = 36;

export const PathfindingVisualizer: React.FC = () => {
  const [startPos] = useState<[number, number]>([9, 6]);
  const [endPos] = useState<[number, number]>([9, 29]);
  const [grid, setGrid] = useState<GridNode[][]>(() => createInitialGrid(ROWS, COLS, [9, 6], [9, 29]));
  const [algo, setAlgo] = useState<PathfindingAlgorithmId>('astar');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const timeoutsRef = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const handleCellMouseDown = (row: number, col: number) => {
    if (isVisualizing) return;
    setIsMouseDown(true);
    toggleWall(row, col);
    sound.playClick();
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isMouseDown || isVisualizing) return;
    toggleWall(row, col);
  };

  const toggleWall = (row: number, col: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      const node = next[row][col];
      if (!node.isStart && !node.isEnd) {
        node.isWall = !node.isWall;
      }
      return next;
    });
  };

  const clearGrid = () => {
    clearTimeouts();
    setIsVisualizing(false);
    setGrid(createInitialGrid(ROWS, COLS, startPos, endPos));
    sound.playClick();
  };

  const clearPathOnly = () => {
    clearTimeouts();
    setIsVisualizing(false);
    setGrid((prev) =>
      prev.map((r) =>
        r.map((c) => ({
          ...c,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          heuristic: Infinity,
          totalCost: Infinity,
          parent: null,
        }))
      )
    );
    sound.playClick();
  };

  const generateRandomMaze = () => {
    clearPathOnly();
    setGrid((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!next[r][c].isStart && !next[r][c].isEnd) {
            next[r][c].isWall = Math.random() < 0.28;
          }
        }
      }
      return next;
    });
    sound.playSuccess();
  };

  const visualize = () => {
    if (isVisualizing) return;
    clearPathOnly();
    setIsVisualizing(true);

    const freshGrid = grid.map((r) =>
      r.map((c) => ({
        ...c,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        heuristic: Infinity,
        totalCost: Infinity,
        parent: null,
      }))
    );

    const startNode = freshGrid[startPos[0]][startPos[1]];
    const endNode = freshGrid[endPos[0]][endPos[1]];

    const { visitedNodesInOrder, shortestPath } = runPathfinding(algo, freshGrid, startNode, endNode);

    // Animate visited exploration wave
    visitedNodesInOrder.forEach((node, i) => {
      const t = window.setTimeout(() => {
        setGrid((prev) => {
          const next = prev.map((r) => [...r]);
          next[node.row][node.col] = { ...next[node.row][node.col], isVisited: true };
          return next;
        });

        if (i % 4 === 0) {
          sound.playTone(300 + (i % 40) * 15, 0.02, 'sine', 0.1);
        }
      }, i * 12);
      timeoutsRef.current.push(t);
    });

    // Animate shortest path
    const pathDelay = visitedNodesInOrder.length * 12;
    shortestPath.forEach((node, j) => {
      const t = window.setTimeout(() => {
        setGrid((prev) => {
          const next = prev.map((r) => [...r]);
          next[node.row][node.col] = { ...next[node.row][node.col], isPath: true };
          return next;
        });
        sound.playTone(600 + j * 25, 0.05, 'triangle', 0.25);

        if (j === shortestPath.length - 1) {
          setIsVisualizing(false);
          sound.playSuccess();
        }
      }, pathDelay + j * 30);
      timeoutsRef.current.push(t);
    });

    if (shortestPath.length === 0) {
      const t = window.setTimeout(() => {
        setIsVisualizing(false);
        sound.playError();
      }, pathDelay);
      timeoutsRef.current.push(t);
    }
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
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as PathfindingAlgorithmId)}
            className="btn-cyber"
            style={{ padding: '4px 8px', outline: 'none' }}
          >
            <option value="astar" style={{ background: '#121220' }}>A* Search (Heuristic)</option>
            <option value="dijkstra" style={{ background: '#121220' }}>Dijkstra's Algorithm (Guaranteed Shortest)</option>
          </select>

          <button onClick={visualize} disabled={isVisualizing} className="btn-cyber btn-cyber-primary">
            <Play size={14} />
            <span>Search Path</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={generateRandomMaze} disabled={isVisualizing} className="btn-cyber" title="Create Random Obstacles">
            <Sparkles size={14} />
            <span>Maze</span>
          </button>

          <button onClick={clearPathOnly} disabled={isVisualizing} className="btn-cyber">
            <span>Clear Path</span>
          </button>

          <button onClick={clearGrid} disabled={isVisualizing} className="btn-cyber" title="Reset Grid">
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--success)" /> Start
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Target size={12} color="var(--error)" /> Target
          </span>
          <span style={{ color: 'var(--text-muted)' }}>Click/Drag cells to draw walls</span>
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
          backgroundColor: 'rgba(5, 5, 12, 0.85)',
          overflow: 'hidden',
        }}
      >
        {grid.map((row, rIdx) =>
          row.map((node, cIdx) => {
            let bg = 'rgba(255, 255, 255, 0.03)';
            let glow = 'none';

            if (node.isStart) {
              bg = 'var(--success)';
              glow = '0 0 10px var(--success)';
            } else if (node.isEnd) {
              bg = 'var(--error)';
              glow = '0 0 10px var(--error)';
            } else if (node.isWall) {
              bg = '#2a2f45';
            } else if (node.isPath) {
              bg = '#ffe600';
              glow = '0 0 12px #ffe600';
            } else if (node.isVisited) {
              bg = 'rgba(0, 243, 255, 0.35)';
            }

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onMouseDown={() => handleCellMouseDown(rIdx, cIdx)}
                onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                style={{
                  backgroundColor: bg,
                  boxShadow: glow,
                  borderRadius: node.isStart || node.isEnd ? '4px' : '2px',
                  cursor: 'crosshair',
                  transition: 'background-color 0.15s ease, transform 0.1s ease',
                  transform: node.isPath ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
