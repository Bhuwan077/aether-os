import { ActivationType } from './types';

export function activate(val: number, type: ActivationType): number {
  switch (type) {
    case 'sigmoid':
      return 1 / (1 + Math.exp(-Math.max(-45, Math.min(45, val))));
    case 'tanh':
      return Math.tanh(val);
    case 'relu':
      return Math.max(0, val);
    default:
      return val;
  }
}

export function activateDerivative(activatedVal: number, type: ActivationType): number {
  switch (type) {
    case 'sigmoid':
      return activatedVal * (1 - activatedVal);
    case 'tanh':
      return 1 - activatedVal * activatedVal;
    case 'relu':
      return activatedVal > 0 ? 1 : 0;
    default:
      return 1;
  }
}
