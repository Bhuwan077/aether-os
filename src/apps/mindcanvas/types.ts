export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  group: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  length?: number;
}
