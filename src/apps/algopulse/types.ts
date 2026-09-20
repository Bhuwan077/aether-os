export type SortingAlgorithmId = 'quicksort' | 'mergesort' | 'bubblesort' | 'heapsort' | 'insertionsort';

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sortedIndices: number[];
}

export type PathfindingAlgorithmId = 'astar' | 'dijkstra' | 'bfs' | 'dfs';

export interface GridNode {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  heuristic: number;
  totalCost: number;
  parent: GridNode | null;
}
