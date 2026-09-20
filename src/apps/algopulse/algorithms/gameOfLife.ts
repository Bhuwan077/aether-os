export type CellGrid = boolean[][];

export function createEmptyGrid(rows: number, cols: number): CellGrid {
  return Array.from({ length: rows }, () => new Array(cols).fill(false));
}

export function computeNextGeneration(grid: CellGrid): { next: CellGrid; population: number } {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = createEmptyGrid(rows, cols);
  let population = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + rows) % rows;
          const nc = (c + dc + cols) % cols;
          if (grid[nr][nc]) neighbors++;
        }
      }

      if (grid[r][c]) {
        if (neighbors === 2 || neighbors === 3) {
          next[r][c] = true;
          population++;
        }
      } else {
        if (neighbors === 3) {
          next[r][c] = true;
          population++;
        }
      }
    }
  }

  return { next, population };
}

export function applyPreset(preset: 'glider' | 'pulsar' | 'spaceship' | 'random', rows: number, cols: number): CellGrid {
  const grid = createEmptyGrid(rows, cols);
  const midR = Math.floor(rows / 2);
  const midC = Math.floor(cols / 2);

  if (preset === 'random') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c] = Math.random() < 0.22;
      }
    }
    return grid;
  }

  if (preset === 'glider') {
    const coords = [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ];
    coords.forEach(([r, c]) => {
      grid[(midR + r) % rows][(midC + c) % cols] = true;
    });
  } else if (preset === 'spaceship') {
    // Lightweight Spaceship (LWSS)
    const coords = [
      [0, 1], [0, 4],
      [1, 0],
      [2, 0], [2, 4],
      [3, 0], [3, 1], [3, 2], [3, 3],
    ];
    coords.forEach(([r, c]) => {
      grid[(midR + r) % rows][(midC + c) % cols] = true;
    });
  } else if (preset === 'pulsar') {
    // Pulsar period 3 oscillator
    const offsets = [-6, -1, 1, 6];
    const bars = [-4, -3, -2, 2, 3, 4];

    offsets.forEach((o) => {
      bars.forEach((b) => {
        grid[(midR + o + rows) % rows][(midC + b + cols) % cols] = true;
        grid[(midR + b + rows) % rows][(midC + o + cols) % cols] = true;
      });
    });
  }

  return grid;
}
