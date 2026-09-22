/**
 * CelestialOrbits physics types and simulation structures
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  fixed?: boolean;
  trail: Vector2D[];
}

export interface SimulationConfig {
  G: number; // Gravitational constant
  softening: number; // Softening parameter to prevent infinity singularity
  timeScale: number; // Simulation speed factor
  maxTrailLength: number; // Maximum stored trail points
  collisions: boolean; // Merge bodies on physical collision
}

export interface SimulationState {
  bodies: CelestialBody[];
  config: SimulationConfig;
  stepCount: number;
  simulatedTime: number;
}
