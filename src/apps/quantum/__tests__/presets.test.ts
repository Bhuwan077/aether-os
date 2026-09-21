import { describe, it, expect } from 'vitest';
import { QuantumCircuit } from '../engine/circuit';
import { QUANTUM_PRESETS, sampleMeasurements } from '../engine/presets';

describe('Quantum Presets and Sampling', () => {
  it('should initialize and execute GHZ 3-qubit state', () => {
    const qc = new QuantumCircuit(3);
    QUANTUM_PRESETS.ghz.setup(qc);
    const probs = qc.getProbabilities();

    const p000 = probs.find((p) => p.stateStr === '|000⟩')!.probability;
    const p111 = probs.find((p) => p.stateStr === '|111⟩')!.probability;

    expect(p000).toBeCloseTo(0.5, 3);
    expect(p111).toBeCloseTo(0.5, 3);
  });

  it('should sample measurements according to probability distribution', () => {
    const qc = new QuantumCircuit(2);
    QUANTUM_PRESETS.bell.setup(qc);

    const shots = 500;
    const counts = sampleMeasurements(qc, shots);

    expect(counts['|00⟩']).toBeGreaterThan(150);
    expect(counts['|11⟩']).toBeGreaterThan(150);
    expect(counts['|01⟩'] || 0).toBe(0);
    expect(counts['|10⟩'] || 0).toBe(0);
  });
});
