import { Vector2D, CelestialBody, SimulationConfig } from './types';

export const DEFAULT_CONFIG: SimulationConfig = {
  G: 1000,
  softening: 15,
  timeScale: 1.0,
  maxTrailLength: 120,
  collisions: true
};

export function vecDistance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function computeAccelerations(bodies: CelestialBody[], G: number, softening: number): Vector2D[] {
  const n = bodies.length;
  const accelerations: Vector2D[] = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
  const epsSq = softening * softening;

  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    if (bi.fixed) continue;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const bj = bodies[j];

      const dx = bj.x - bi.x;
      const dy = bj.y - bi.y;
      const distSq = dx * dx + dy * dy + epsSq;
      const dist = Math.sqrt(distSq);

      // Newton's law of universal gravitation: F = G * m1 * m2 / dist^2
      // a_i = F / m_i = G * m_j / dist^2 along unit vector (dx/dist, dy/dist)
      const forceFactor = (G * bj.mass) / (distSq * dist);

      accelerations[i].x += dx * forceFactor;
      accelerations[i].y += dy * forceFactor;
    }
  }

  return accelerations;
}

export function stepSimulation(bodies: CelestialBody[], config: SimulationConfig, dt: number): CelestialBody[] {
  const effectiveDt = dt * config.timeScale;
  const n = bodies.length;
  if (n === 0) return bodies;

  // 1. Initial accelerations a(t)
  const a0 = computeAccelerations(bodies, config.G, config.softening);

  // 2. Velocity Verlet: Half-step velocities & full-step positions
  const nextBodies: CelestialBody[] = bodies.map((b, i) => {
    if (b.fixed) {
      return { ...b };
    }

    const vHalfX = b.vx + 0.5 * a0[i].x * effectiveDt;
    const vHalfY = b.vy + 0.5 * a0[i].y * effectiveDt;

    const nextX = b.x + vHalfX * effectiveDt;
    const nextY = b.y + vHalfY * effectiveDt;

    // Update trail
    const trail = [...b.trail, { x: b.x, y: b.y }];
    if (trail.length > config.maxTrailLength) {
      trail.shift();
    }

    return {
      ...b,
      x: nextX,
      y: nextY,
      vx: vHalfX, // temporarily store half-step velocity
      vy: vHalfY,
      trail
    };
  });

  // 3. Accelerations at new positions a(t + dt)
  const a1 = computeAccelerations(nextBodies, config.G, config.softening);

  // 4. Final velocity update
  for (let i = 0; i < n; i++) {
    if (!nextBodies[i].fixed) {
      nextBodies[i].vx += 0.5 * a1[i].x * effectiveDt;
      nextBodies[i].vy += 0.5 * a1[i].y * effectiveDt;
    }
  }

  // 5. Inelastic collision & merging (optional)
  if (config.collisions) {
    return handleCollisions(nextBodies);
  }

  return nextBodies;
}

function handleCollisions(bodies: CelestialBody[]): CelestialBody[] {
  const merged = new Set<string>();
  const result: CelestialBody[] = [];

  for (let i = 0; i < bodies.length; i++) {
    if (merged.has(bodies[i].id)) continue;
    let current = { ...bodies[i] };

    for (let j = i + 1; j < bodies.length; j++) {
      if (merged.has(bodies[j].id)) continue;
      const other = bodies[j];

      const dist = vecDistance(current, other);
      if (dist < (current.radius + other.radius) * 0.7) {
        // Merge into the more massive body (conservation of momentum)
        const totalMass = current.mass + other.mass;
        const vx = (current.vx * current.mass + other.vx * other.mass) / totalMass;
        const vy = (current.vy * current.mass + other.vy * other.mass) / totalMass;
        const x = (current.x * current.mass + other.x * other.mass) / totalMass;
        const y = (current.y * current.mass + other.y * other.mass) / totalMass;
        const newRadius = Math.cbrt(Math.pow(current.radius, 3) + Math.pow(other.radius, 3));

        current = {
          ...current,
          x,
          y,
          vx,
          vy,
          mass: totalMass,
          radius: Math.min(newRadius, 40),
          name: current.mass >= other.mass ? current.name : other.name,
          color: current.mass >= other.mass ? current.color : other.color
        };

        merged.add(other.id);
      }
    }

    result.push(current);
  }

  return result;
}

export function computeSystemEnergy(bodies: CelestialBody[], G: number): { kinetic: number; potential: number; total: number } {
  let kinetic = 0;
  let potential = 0;

  for (let i = 0; i < bodies.length; i++) {
    const bi = bodies[i];
    const vSq = bi.vx * bi.vx + bi.vy * bi.vy;
    kinetic += 0.5 * bi.mass * vSq;

    for (let j = i + 1; j < bodies.length; j++) {
      const bj = bodies[j];
      const dist = vecDistance(bi, bj);
      if (dist > 0.0001) {
        potential -= (G * bi.mass * bj.mass) / dist;
      }
    }
  }

  return {
    kinetic: Math.round(kinetic),
    potential: Math.round(potential),
    total: Math.round(kinetic + potential)
  };
}
