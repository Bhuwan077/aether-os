import { describe, it, expect } from 'vitest';
import {
  vecDistance,
  computeAccelerations,
  stepSimulation,
  computeSystemEnergy,
  DEFAULT_CONFIG
} from '../engine/nbody';
import { ORBITAL_PRESETS } from '../engine/presets';
import { CelestialBody } from '../engine/types';

describe('Gravitational Physics & Vector Math', () => {
  it('should compute exact Euclidean distance between points', () => {
    expect(vecDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(vecDistance({ x: -10, y: 5 }, { x: 10, y: 5 })).toBe(20);
  });

  it('should obey Newton third law (conservation of linear momentum in two-body system)', () => {
    const bodies: CelestialBody[] = [
      { id: '1', name: 'A', x: -50, y: 0, vx: 0, vy: 0, mass: 100, radius: 5, color: '#fff', trail: [] },
      { id: '2', name: 'B', x: 50, y: 0, vx: 0, vy: 0, mass: 200, radius: 5, color: '#fff', trail: [] }
    ];

    const acc = computeAccelerations(bodies, 1000, 0);
    // F1 = m1 * a1, F2 = m2 * a2 => m1*a1 + m2*a2 should equal 0
    const f1x = bodies[0].mass * acc[0].x;
    const f2x = bodies[1].mass * acc[1].x;
    expect(Math.abs(f1x + f2x)).toBeLessThan(1e-10);
    expect(acc[0].x).toBeGreaterThan(0); // Body 1 is pulled right toward Body 2
    expect(acc[1].x).toBeLessThan(0); // Body 2 is pulled left toward Body 1
  });

  it('should maintain stationary position for fixed bodies', () => {
    const bodies: CelestialBody[] = [
      { id: 'sun', name: 'Sol', x: 0, y: 0, vx: 0, vy: 0, mass: 10000, radius: 10, color: '#ff0', fixed: true, trail: [] },
      { id: 'planet', name: 'P', x: 100, y: 0, vx: 0, vy: 10, mass: 1, radius: 2, color: '#00f', trail: [] }
    ];

    const next = stepSimulation(bodies, DEFAULT_CONFIG, 0.1);
    expect(next[0].x).toBe(0);
    expect(next[0].y).toBe(0);
    expect(next[0].vx).toBe(0);
    expect(next[0].vy).toBe(0);
  });

  it('should preserve circular Keplerian orbit stability across integration steps', () => {
    // G = 1000, M = 10000, r = 100 => v = sqrt(G*M/r) = sqrt(1000 * 10000 / 100) = sqrt(100000) = 316.2277
    const r0 = 100;
    const M = 10000;
    const G = 1000;
    const v0 = Math.sqrt((G * M) / r0);

    let bodies: CelestialBody[] = [
      { id: 'sun', name: 'Sol', x: 0, y: 0, vx: 0, vy: 0, mass: M, radius: 10, color: '#ff0', fixed: true, trail: [] },
      { id: 'planet', name: 'P', x: r0, y: 0, vx: 0, vy: v0, mass: 0.1, radius: 2, color: '#0ff', trail: [] }
    ];

    const config = { ...DEFAULT_CONFIG, G, softening: 0, collisions: false };

    // Step 50 times with small dt = 0.005
    for (let i = 0; i < 50; i++) {
      bodies = stepSimulation(bodies, config, 0.005);
    }

    const currentRadius = vecDistance(bodies[0], bodies[1]);
    const errorPercent = (Math.abs(currentRadius - r0) / r0) * 100;
    expect(errorPercent).toBeLessThan(1.0); // Orbit remains within 1% of circular radius
  });

  it('should compute negative total energy for gravitationally bound systems', () => {
    const preset = ORBITAL_PRESETS.find((p) => p.id === 'solar_system')!;
    const energy = computeSystemEnergy(preset.bodies, DEFAULT_CONFIG.G);
    expect(energy.kinetic).toBeGreaterThan(0);
    expect(energy.potential).toBeLessThan(0);
    expect(energy.total).toBeLessThan(0); // Bound system
  });

  it('should have valid orbital presets with positive masses and radii', () => {
    expect(ORBITAL_PRESETS.length).toBeGreaterThanOrEqual(5);
    for (const preset of ORBITAL_PRESETS) {
      expect(preset.bodies.length).toBeGreaterThan(1);
      for (const b of preset.bodies) {
        expect(b.mass).toBeGreaterThan(0);
        expect(b.radius).toBeGreaterThan(0);
      }
    }

    const chaotic = ORBITAL_PRESETS.find((p) => p.id === 'chaotic_triple');
    expect(chaotic).toBeDefined();
    expect(chaotic?.bodies.length).toBe(3);
  });
  });
});
