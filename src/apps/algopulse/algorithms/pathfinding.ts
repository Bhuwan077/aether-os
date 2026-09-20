import { GridNode, PathfindingAlgorithmId } from '../types';

export function createInitialGrid(rows: number, cols: number, start: [number, number], end: [number, number]): GridNode[][] {
  const grid: GridNode[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridNode[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isStart: r === start[0] && c === start[1],
        isEnd: r === end[0] && c === end[1],
        isWall: false,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        heuristic: Infinity,
        totalCost: Infinity,
        parent: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

function getNeighbors(node: GridNode, grid: GridNode[][]): GridNode[] {
  const neighbors: GridNode[] = [];
  const { row, col } = node;
  const rows = grid.length;
  const cols = grid[0].length;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < rows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < cols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((n) => !n.isWall);
}

function manhattanDistance(a: GridNode, b: GridNode): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function runDijkstra(grid: GridNode[][], start: GridNode, end: GridNode) {
  const visitedNodesInOrder: GridNode[] = [];
  start.distance = 0;
  const unvisitedNodes: GridNode[] = [];

  for (const row of grid) {
    for (const node of row) {
      if (!node.isWall) unvisitedNodes.push(node);
    }
  }

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closest = unvisitedNodes.shift()!;

    if (closest.distance === Infinity) break;
    closest.isVisited = true;
    visitedNodesInOrder.push(closest);

    if (closest.row === end.row && closest.col === end.col) break;

    const neighbors = getNeighbors(closest, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        const newDist = closest.distance + 1;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.parent = closest;
        }
      }
    }
  }

  const shortestPath: GridNode[] = [];
  let curr: GridNode | null = end;
  if (end.parent || (end.row === start.row && end.col === start.col)) {
    while (curr) {
      shortestPath.unshift(curr);
      curr = curr.parent;
    }
  }

  return { visitedNodesInOrder, shortestPath };
}

export function runAStar(grid: GridNode[][], start: GridNode, end: GridNode) {
  const visitedNodesInOrder: GridNode[] = [];
  start.distance = 0;
  start.heuristic = manhattanDistance(start, end);
  start.totalCost = start.heuristic;

  const openSet: GridNode[] = [start];
  const closedSet = new Set<string>();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.totalCost - b.totalCost || a.heuristic - b.heuristic);
    const curr = openSet.shift()!;
    const key = `${curr.row},${curr.col}`;

    if (closedSet.has(key)) continue;
    closedSet.add(key);
    curr.isVisited = true;
    visitedNodesInOrder.push(curr);

    if (curr.row === end.row && curr.col === end.col) break;

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      const nKey = `${neighbor.row},${neighbor.col}`;
      if (closedSet.has(nKey)) continue;

      const tentativeG = curr.distance + 1;
      if (tentativeG < neighbor.distance) {
        neighbor.parent = curr;
        neighbor.distance = tentativeG;
        neighbor.heuristic = manhattanDistance(neighbor, end);
        neighbor.totalCost = neighbor.distance + neighbor.heuristic;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  const shortestPath: GridNode[] = [];
  let currPath: GridNode | null = end;
  if (end.parent || (end.row === start.row && end.col === start.col)) {
    while (currPath) {
      shortestPath.unshift(currPath);
      currPath = currPath.parent;
    }
  }

  return { visitedNodesInOrder, shortestPath };
}

export function runPathfinding(
  algo: PathfindingAlgorithmId,
  grid: GridNode[][],
  start: GridNode,
  end: GridNode
) {
  if (algo === 'astar') return runAStar(grid, start, end);
  return runDijkstra(grid, start, end);
}
