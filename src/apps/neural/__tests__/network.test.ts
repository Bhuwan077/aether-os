import { describe, it, expect } from 'vitest';
import { NeuralNetwork } from '../engine/network';
import { activate, activateDerivative } from '../engine/activations';
import { DataPoint } from '../engine/types';

describe('Neural Network Engine', () => {
  it('should compute activation functions and derivatives accurately', () => {
    expect(activate(0, 'sigmoid')).toBeCloseTo(0.5, 5);
    expect(activate(0, 'tanh')).toBeCloseTo(0, 5);
    expect(activate(5, 'relu')).toBe(5);
    expect(activate(-5, 'relu')).toBe(0);

    expect(activateDerivative(0.5, 'sigmoid')).toBeCloseTo(0.25, 5);
    expect(activateDerivative(0, 'tanh')).toBeCloseTo(1, 5);
    expect(activateDerivative(2, 'relu')).toBe(1);
    expect(activateDerivative(-2, 'relu')).toBe(0);
  });

  it('should initialize weights with correct layer dimensions and forward propagate', () => {
    const nn = new NeuralNetwork([2, 4, 1], ['tanh', 'sigmoid']);
    expect(nn.weights.length).toBe(2);
    expect(nn.weights[0].length).toBe(4); // 4 hidden neurons
    expect(nn.weights[0][0].length).toBe(2); // 2 inputs
    expect(nn.weights[1].length).toBe(1); // 1 output neuron

    const { activations } = nn.forward([0.5, -0.5]);
    expect(activations.length).toBe(3);
    expect(activations[0]).toEqual([0.5, -0.5]);
    expect(activations[1].length).toBe(4);
    expect(activations[2].length).toBe(1);
    expect(activations[2][0]).toBeGreaterThanOrEqual(0);
    expect(activations[2][0]).toBeLessThanOrEqual(1);
  });

  it('should decrease loss during backpropagation training steps', () => {
    const nn = new NeuralNetwork([2, 4, 1], ['tanh', 'sigmoid']);
    const dataset: DataPoint[] = [
      { x: 0.8, y: 0.8, label: 1 },
      { x: 0.9, y: 0.7, label: 1 },
      { x: -0.8, y: -0.8, label: 0 },
      { x: -0.7, y: -0.9, label: 0 },
    ];

    const initialLoss = nn.trainStep(dataset, 0.1);
    let finalLoss = initialLoss;
    for (let i = 0; i < 40; i++) {
      finalLoss = nn.trainStep(dataset, 0.2);
    }

    expect(finalLoss).toBeLessThan(initialLoss);
  });
});
