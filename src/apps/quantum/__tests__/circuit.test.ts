import { describe, it, expect } from 'vitest';
import { c, cMul, cMagSq } from '../engine/complex';
import { QuantumCircuit } from '../engine/circuit';

describe('Quantum Computing Engine', () => {
  it('should verify complex number multiplication i * i = -1', () => {
    const i = c(0, 1);
    const iSquared = cMul(i, i);
    expect(iSquared.re).toBeCloseTo(-1, 5);
    expect(iSquared.im).toBeCloseTo(0, 5);
  });

  it('should create equal superposition using Hadamard gate', () => {
    const qc = new QuantumCircuit(1);
    qc.applyGate('H', 0);
    const probs = qc.getProbabilities();

    expect(probs[0].stateStr).toBe('|0⟩');
    expect(probs[0].probability).toBeCloseTo(0.5, 3);
    expect(probs[1].stateStr).toBe('|1⟩');
    expect(probs[1].probability).toBeCloseTo(0.5, 3);
  });

  it('should flip qubit using Pauli-X NOT gate', () => {
    const qc = new QuantumCircuit(1);
    qc.applyGate('X', 0);
    const probs = qc.getProbabilities();

    expect(probs[0].probability).toBe(0);
    expect(probs[1].probability).toBe(1);
  });

  it('should produce entangled Bell state |Φ+⟩ using Hadamard and CNOT', () => {
    const qc = new QuantumCircuit(2);
    // H on qubit 0
    qc.applyGate('H', 0);
    // CNOT control=0, target=1
    qc.applyCNOT(0, 1);

    const probs = qc.getProbabilities();
    // Expected: |00⟩ = 0.5, |11⟩ = 0.5, |01⟩ = 0, |10⟩ = 0
    const p00 = probs.find((p) => p.stateStr === '|00⟩')!.probability;
    const p11 = probs.find((p) => p.stateStr === '|11⟩')!.probability;
    const p01 = probs.find((p) => p.stateStr === '|01⟩')!.probability;
    const p10 = probs.find((p) => p.stateStr === '|10⟩')!.probability;

    expect(p00).toBeCloseTo(0.5, 3);
    expect(p11).toBeCloseTo(0.5, 3);
    expect(p01).toBe(0);
    expect(p10).toBe(0);
  });
});
