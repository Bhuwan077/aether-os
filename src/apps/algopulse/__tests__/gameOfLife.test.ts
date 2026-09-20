import { describe, it, expect } from 'vitest';
import { createEmptyGrid, computeNextGeneration, applyPreset } from '../algorithms/gameOfLife';

describe("Conway's Game of Life", () => {
  it('should initialize empty grid with correct dimensions', () => {
    const grid = createEmptyGrid(10, 20);
    expect(grid.length).toBe(10);
    expect(grid[0].length).toBe(20);
    expect(grid.every((row) => row.every((c) => c === false))).toBe(true);
  });

  it('an underpopulated cell with fewer than 2 neighbors dies', () => {
    const grid = createEmptyGrid(5, 5);
    grid[2][2] = true; // isolated cell
    const { next, population } = computeNextGeneration(grid);
    expect(next[2][2]).toBe(false);
    expect(population).toBe(0);
  });

  it('a dead cell with exactly 3 live neighbors becomes a live cell', () => {
    const grid = createEmptyGrid(5, 5);
    grid[1][2] = true;
    grid[2][1] = true;
    grid[2][3] = true;

    const { next } = computeNextGeneration(grid);
    expect(next[2][2]).toBe(true);
  });

  it('blinker oscillator oscillates with period 2', () => {
    const grid = createEmptyGrid(5, 5);
    // Horizontal blinker
    grid[2][1] = true;
    grid[2][2] = true;
    grid[2][3] = true;

    const gen1 = computeNextGeneration(grid);
    // Vertical blinker
    expect(gen1.next[1][2]).toBe(true);
    expect(gen1.next[2][2]).toBe(true);
    expect(gen1.next[3][2]).toBe(true);
    expect(gen1.next[2][1]).toBe(false);
    expect(gen1.next[2][3]).toBe(false);

    const gen2 = computeNextGeneration(gen1.next);
    // Back to horizontal
    expect(gen2.next[2][1]).toBe(true);
    expect(gen2.next[2][2]).toBe(true);
    expect(gen2.next[2][3]).toBe(true);
  });

  it('should apply glider preset with 5 living cells', () => {
    const grid = applyPreset('glider', 10, 10);
    let count = 0;
    grid.forEach((row) => row.forEach((c) => { if (c) count++; }));
    expect(count).toBe(5);
  });
});
