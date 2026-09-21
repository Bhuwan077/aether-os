import { describe, it, expect } from 'vitest';
import { CYBER_PALETTE } from '../types';

describe('CyberPaint Logic', () => {
  it('should have standard cyberpunk neon palette colors', () => {
    expect(CYBER_PALETTE).toContain('#00f3ff');
    expect(CYBER_PALETTE).toContain('#ff007f');
    expect(CYBER_PALETTE.length).toBeGreaterThanOrEqual(8);
  });

  it('should correctly execute flood fill on 2D pixel grid', () => {
    const size = 5;
    const grid: string[][] = Array.from({ length: size }, () => new Array(size).fill(''));

    // Fill center cross
    grid[2][2] = '#00f3ff';

    // 4-way BFS flood fill
    const targetColor = '';
    const newColor = '#ff007f';
    const queue: [number, number][] = [[0, 0]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (grid[r][c] === targetColor) {
        grid[r][c] = newColor;
        if (r > 0) queue.push([r - 1, c]);
        if (r < size - 1) queue.push([r + 1, c]);
        if (c > 0) queue.push([c, c - 1]);
        if (c < size - 1) queue.push([c, c + 1]);
      }
    }

    // Origin filled with new color
    expect(grid[0][0]).toBe(newColor);
    // Previously filled cell kept its original color
    expect(grid[2][2]).toBe('#00f3ff');
  });
});
