import { Complex, c, cAdd, cMul, cScale, cMagSq } from './complex';

export type GateType = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'CNOT' | 'MEASURE';

export interface GateStep {
  id: string;
  gate: GateType;
  targetQubit: number;
  controlQubit?: number; // for CNOT
}

const INV_SQRT2 = 1 / Math.SQRT2;

export class QuantumCircuit {
  public numQubits: number;
  // Statevector of size 2^numQubits
  public state: Complex[];

  constructor(numQubits: number) {
    this.numQubits = Math.max(1, Math.min(4, numQubits));
    this.state = this.createInitialState();
  }

  private createInitialState(): Complex[] {
    const size = 1 << this.numQubits;
    const s: Complex[] = new Array(size).fill(null).map(() => c(0, 0));
    // |0...0> = 1
    s[0] = c(1, 0);
    return s;
  }

  public reset(): void {
    this.state = this.createInitialState();
  }

  // Apply single-qubit gate
  public applyGate(gate: GateType, target: number): void {
    if (target < 0 || target >= this.numQubits) return;
    const size = 1 << this.numQubits;
    const newState: Complex[] = new Array(size).fill(null).map(() => c(0, 0));

    // Matrix entries for 1-qubit gate
    let m00 = c(1, 0), m01 = c(0, 0), m10 = c(0, 0), m11 = c(1, 0);

    switch (gate) {
      case 'H':
        m00 = c(INV_SQRT2, 0);
        m01 = c(INV_SQRT2, 0);
        m10 = c(INV_SQRT2, 0);
        m11 = c(-INV_SQRT2, 0);
        break;
      case 'X': // NOT
        m00 = c(0, 0);
        m01 = c(1, 0);
        m10 = c(1, 0);
        m11 = c(0, 0);
        break;
      case 'Y':
        m00 = c(0, 0);
        m01 = c(0, -1);
        m10 = c(0, 1);
        m11 = c(0, 0);
        break;
      case 'Z':
        m00 = c(1, 0);
        m01 = c(0, 0);
        m10 = c(0, 0);
        m11 = c(-1, 0);
        break;
      case 'S':
        m00 = c(1, 0);
        m01 = c(0, 0);
        m10 = c(0, 0);
        m11 = c(0, 1);
        break;
      case 'T':
        m00 = c(1, 0);
        m01 = c(0, 0);
        m10 = c(0, 0);
        m11 = c(INV_SQRT2, INV_SQRT2);
        break;
    }

    const bitMask = 1 << target;

    for (let i = 0; i < size; i++) {
      if ((i & bitMask) === 0) {
        const i0 = i;
        const i1 = i | bitMask;

        const a0 = this.state[i0];
        const a1 = this.state[i1];

        // new a0 = m00*a0 + m01*a1
        newState[i0] = cAdd(cMul(m00, a0), cMul(m01, a1));
        // new a1 = m10*a0 + m11*a1
        newState[i1] = cAdd(cMul(m10, a0), cMul(m11, a1));
      }
    }

    this.state = newState;
  }

  // Apply CNOT gate
  public applyCNOT(control: number, target: number): void {
    if (control === target || control >= this.numQubits || target >= this.numQubits) return;
    const size = 1 << this.numQubits;
    const newState = [...this.state];

    const cMask = 1 << control;
    const tMask = 1 << target;

    for (let i = 0; i < size; i++) {
      // If control bit is 1 and target bit is 0, swap amplitude with state where target bit is 1
      if ((i & cMask) !== 0 && (i & tMask) === 0) {
        const targetHigh = i | tMask;
        const tmp = newState[i];
        newState[i] = newState[targetHigh];
        newState[targetHigh] = tmp;
      }
    }

    this.state = newState;
  }

  // Calculate probabilities of all basis states
  public getProbabilities(): { stateStr: string; probability: number }[] {
    const size = 1 << this.numQubits;
    const probs: { stateStr: string; probability: number }[] = [];

    for (let i = 0; i < size; i++) {
      const stateStr = i.toString(2).padStart(this.numQubits, '0');
      const p = cMagSq(this.state[i]);
      probs.push({ stateStr: `|${stateStr}⟩`, probability: Number(p.toFixed(4)) });
    }

    return probs;
  }
}
