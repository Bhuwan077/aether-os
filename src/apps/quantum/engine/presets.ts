import { QuantumCircuit } from './circuit';

export interface QuantumPreset {
  id: string;
  name: string;
  description: string;
  setup: (qc: QuantumCircuit) => void;
}

export const QUANTUM_PRESETS: Record<string, QuantumPreset> = {
  bell: {
    id: 'bell',
    name: 'Bell State (|Φ+⟩)',
    description: 'Maximally entangled 2-qubit Einstein-Podolsky-Rosen (EPR) state.',
    setup: (qc: QuantumCircuit) => {
      qc.reset();
      qc.applyGate('H', 0);
      qc.applyCNOT(0, 1);
    },
  },
  ghz: {
    id: 'ghz',
    name: 'Greenberger-Horne-Zeilinger (GHZ)',
    description: '3-qubit entangled superposition state (|000⟩ + |111⟩)/√2.',
    setup: (qc: QuantumCircuit) => {
      qc.reset();
      qc.applyGate('H', 0);
      qc.applyCNOT(0, 1);
      qc.applyCNOT(1, 2);
    },
  },
  uniform: {
    id: 'uniform',
    name: 'Uniform Superposition',
    description: 'All 8 basis states have equal 12.5% probability.',
    setup: (qc: QuantumCircuit) => {
      qc.reset();
      qc.applyGate('H', 0);
      qc.applyGate('H', 1);
      qc.applyGate('H', 2);
    },
  },
};

export function sampleMeasurements(qc: QuantumCircuit, shots = 1024): Record<string, number> {
  const probs = qc.getProbabilities();
  const counts: Record<string, number> = {};

  for (const item of probs) {
    counts[item.stateStr] = 0;
  }

  for (let s = 0; s < shots; s++) {
    const rand = Math.random();
    let cumulative = 0;
    for (const item of probs) {
      cumulative += item.probability;
      if (rand <= cumulative) {
        counts[item.stateStr]++;
        break;
      }
    }
  }

  return counts;
}
