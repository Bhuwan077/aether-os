import { ActivationType, DataPoint } from './types';
import { activate, activateDerivative } from './activations';

export class NeuralNetwork {
  public layerSizes: number[];
  public activations: ActivationType[];
  // weights[layerIdx][neuronIdx][prevNeuronIdx]
  public weights: number[][][];
  // biases[layerIdx][neuronIdx]
  public biases: number[][];

  constructor(layerSizes: number[], activations?: ActivationType[]) {
    this.layerSizes = layerSizes;
    this.activations = activations || new Array(layerSizes.length - 1).fill('tanh');
    this.weights = [];
    this.biases = [];

    // Xavier / He initialization
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const fanIn = layerSizes[l];
      const fanOut = layerSizes[l + 1];
      const scale = Math.sqrt(2 / (fanIn + fanOut));

      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let j = 0; j < fanOut; j++) {
        const neuronWeights: number[] = [];
        for (let i = 0; i < fanIn; i++) {
          neuronWeights.push((Math.random() * 2 - 1) * scale);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push(0);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  public forward(input: number[]): { activations: number[][]; preActivations: number[][] } {
    const allActivations: number[][] = [input];
    const allPreActivations: number[][] = [input];

    let current = input;

    for (let l = 0; l < this.weights.length; l++) {
      const layerW = this.weights[l];
      const layerB = this.biases[l];
      const actType = this.activations[l] || 'tanh';

      const nextPre: number[] = [];
      const nextAct: number[] = [];

      for (let j = 0; j < layerW.length; j++) {
        let sum = layerB[j];
        for (let i = 0; i < current.length; i++) {
          sum += layerW[j][i] * current[i];
        }
        nextPre.push(sum);
        nextAct.push(activate(sum, actType));
      }

      allPreActivations.push(nextPre);
      allActivations.push(nextAct);
      current = nextAct;
    }

    return { activations: allActivations, preActivations: allPreActivations };
  }

  public predict(x: number, y: number): number {
    const { activations } = this.forward([x, y]);
    const outputLayer = activations[activations.length - 1];
    return outputLayer[0];
  }

  public trainStep(data: DataPoint[], learningRate: number): number {
    let totalLoss = 0;

    // Gradient accumulators
    const weightGradients: number[][][] = this.weights.map((l) =>
      l.map((n) => new Array(n.length).fill(0))
    );
    const biasGradients: number[][] = this.biases.map((b) => new Array(b.length).fill(0));

    for (const point of data) {
      const { activations } = this.forward([point.x, point.y]);
      const predicted = activations[activations.length - 1][0];
      const target = point.label;

      const error = predicted - target;
      totalLoss += error * error;

      // Backpropagation deltas
      // deltas[layerIdx][neuronIdx]
      const deltas: number[][] = [];

      // Output layer delta
      const L = this.weights.length;
      const outActType = this.activations[L - 1] || 'sigmoid';
      const outDelta = 2 * error * activateDerivative(predicted, outActType);
      deltas[L - 1] = [outDelta];

      // Hidden layers backpropagation
      for (let l = L - 2; l >= 0; l--) {
        const nextDelta = deltas[l + 1];
        const nextWeights = this.weights[l + 1];
        const currentActivations = activations[l + 1];
        const currentActType = this.activations[l] || 'tanh';

        const layerDelta: number[] = [];

        for (let j = 0; j < this.layerSizes[l + 1]; j++) {
          let sum = 0;
          for (let k = 0; k < nextDelta.length; k++) {
            sum += nextDelta[k] * nextWeights[k][j];
          }
          const delta = sum * activateDerivative(currentActivations[j], currentActType);
          layerDelta.push(delta);
        }

        deltas[l] = layerDelta;
      }

      // Accumulate gradients
      for (let l = 0; l < L; l++) {
        const layerDelta = deltas[l];
        const prevActs = activations[l];

        for (let j = 0; j < layerDelta.length; j++) {
          biasGradients[l][j] += layerDelta[j];
          for (let i = 0; i < prevActs.length; i++) {
            weightGradients[l][j][i] += layerDelta[j] * prevActs[i];
          }
        }
      }
    }

    // Apply gradient descent step
    const N = Math.max(1, data.length);
    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        this.biases[l][j] -= (learningRate * biasGradients[l][j]) / N;
        for (let i = 0; i < this.weights[l][j].length; i++) {
          this.weights[l][j][i] -= (learningRate * weightGradients[l][j][i]) / N;
        }
      }
    }

    return totalLoss / N;
  }
}
