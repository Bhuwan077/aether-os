import { describe, it, expect } from 'vitest';
import { createInitialGrid, runDijkstra, runAStar } from '../algorithms/pathfinding';

describe('Pathfinding Algorithms', () => {
  it('should find shortest path using Dijkstra with no obstacles', () => {
    const grid = createInitialGrid(5, 5, [0, 0], [4, 4]);
    const start = grid[0][0];
    const end = grid[4][4];

    const { shortestPath } = runDijkstra(grid, start, end);
    expect(shortestPath.length).toBe(9); // Manhattan distance 4 + 4 + 1 = 9 nodes
    expect(shortestPath[0]).toBe(start);
    expect(shortestPath[shortestPath.length - 1]).toBe(end);
  });

  it('should find shortest path using A* search with no obstacles', () => {
    const grid = createInitialGrid(5, 5, [0, 0], [4, 4]);
    const start = grid[0][0];
    const end = grid[4][4];

    const { shortestPath } = runAStar(grid, start, end);
    expect(shortestPath.length).toBe(9);
    expect(shortestPath[0]).toBe(start);
    expect(shortestPath[shortestPath.length - 1]).toBe(end);
  });

  it('should navigate around walls correctly', () => {
    const grid = createInitialGrid(5, 5, [0, 0], [0, 2]);
    // Place wall blocking direct step [0, 1]
    grid[0][1].isWall = true;

    const start = grid[0][0];
    const end = grid[0][2];

    const { shortestPath } = runAStar(grid, start, end);
    expect(shortestPath.length).toBeGreaterThan(3);
    expect(shortestPath.some((n) => n.isWall)).toBe(false);
  });
});
