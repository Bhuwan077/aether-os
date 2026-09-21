export type ActivationType = 'relu' | 'sigmoid' | 'tanh';

export interface DataPoint {
  x: number;
  y: number;
  label: number; // 0 or 1 (or -1 and 1)
}

export interface NetworkConfig {
  layerSizes: number[]; // e.g. [2, 4, 4, 1]
  activations: ActivationType[];
  learningRate: number;
}
