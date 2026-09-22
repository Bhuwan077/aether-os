import { CelestialBody } from './types';

export interface OrbitalPreset {
  id: string;
  name: string;
  description: string;
  bodies: CelestialBody[];
}

export const ORBITAL_PRESETS: OrbitalPreset[] = [
  {
    id: 'solar_system',
    name: 'Keplerian Solar System',
    description: 'Central massive star with concentric circular Keplerian planetary orbits.',
    bodies: [
      {
        id: 'sun',
        name: 'Sol',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        mass: 12000,
        radius: 18,
        color: '#f59e0b',
        fixed: true,
        trail: []
      },
      {
        id: 'mercury',
        name: 'Hermes',
        x: 0,
        y: -70,
        vx: 13.0,
        vy: 0,
        mass: 5,
        radius: 4,
        color: '#94a3b8',
        trail: []
      },
      {
        id: 'earth',
        name: 'Terra',
        x: 0,
        y: -140,
        vx: 9.25,
        vy: 0,
        mass: 15,
        radius: 6,
        color: '#38bdf8',
        trail: []
      },
      {
        id: 'mars',
        name: 'Ares',
        x: 0,
        y: -210,
        vx: 7.55,
        vy: 0,
        mass: 10,
        radius: 5,
        color: '#ef4444',
        trail: []
      },
      {
        id: 'jupiter',
        name: 'Zeus',
        x: 0,
        y: -300,
        vx: 6.32,
        vy: 0,
        mass: 80,
        radius: 11,
        color: '#fbbf24',
        trail: []
      }
    ]
  },
  {
    id: 'figure_eight',
    name: 'Figure-8 Choreography',
    description: 'The famous Chenciner-Montgomery 3-body zero-angular-momentum periodic solution.',
    bodies: [
      {
        id: 'b1',
        name: 'Body Alpha',
        x: -150,
        y: 0,
        vx: 2.33,
        vy: 2.16,
        mass: 2500,
        radius: 8,
        color: '#38bdf8',
        trail: []
      },
      {
        id: 'b2',
        name: 'Body Beta',
        x: 150,
        y: 0,
        vx: 2.33,
        vy: 2.16,
        mass: 2500,
        radius: 8,
        color: '#34d399',
        trail: []
      },
      {
        id: 'b3',
        name: 'Body Gamma',
        x: 0,
        y: 0,
        vx: -4.66,
        vy: -4.32,
        mass: 2500,
        radius: 8,
        color: '#f43f5e',
        trail: []
      }
    ]
  },
  {
    id: 'binary_star',
    name: 'Binary Star & Circumbinary Planet',
    description: 'Twin stars revolving around their barycenter with a distant planet.',
    bodies: [
      {
        id: 'star_a',
        name: 'Primary Star',
        x: -50,
        y: 0,
        vx: 0,
        vy: -6.5,
        mass: 5000,
        radius: 12,
        color: '#f59e0b',
        trail: []
      },
      {
        id: 'star_b',
        name: 'Companion Star',
        x: 50,
        y: 0,
        vx: 0,
        vy: 6.5,
        mass: 5000,
        radius: 12,
        color: '#ec4899',
        trail: []
      },
      {
        id: 'planet_tatooine',
        name: 'Tatooine',
        x: 0,
        y: -240,
        vx: 6.45,
        vy: 0,
        mass: 12,
        radius: 5,
        color: '#a78bfa',
        trail: []
      }
    ]
  },
  {
    id: 'trojan_asteroids',
    name: 'Lagrange L4 & L5 Trojans',
    description: 'Jupiter-Sun system with asteroids trapped in stable triangular Lagrange points.',
    bodies: [
      {
        id: 'sun',
        name: 'Sol',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        mass: 15000,
        radius: 18,
        color: '#fbbf24',
        fixed: true,
        trail: []
      },
      {
        id: 'jupiter',
        name: 'Jupiter',
        x: 200,
        y: 0,
        vx: 0,
        vy: 8.66,
        mass: 600,
        radius: 9,
        color: '#f97316',
        trail: []
      },
      {
        id: 'trojan_l4',
        name: 'Trojan L4',
        x: 100,
        y: -173.2,
        vx: 7.5,
        vy: 4.33,
        mass: 2,
        radius: 3,
        color: '#2dd4bf',
        trail: []
      },
      {
        id: 'trojan_l5',
        name: 'Greek L5',
        x: 100,
        y: 173.2,
        vx: -7.5,
        vy: 4.33,
        mass: 2,
        radius: 3,
        color: '#2dd4bf',
        trail: []
      }
    ]
  }
];
