import { describe, it, expect } from 'vitest';
import { generateCircleData, generateXorData, generateSpiralData, generateGaussianClusters } from '../engine/datasets';

describe('Neural Datasets Generators', () => {
  it('should generate circle dataset with balanced classes', () => {
    const data = generateCircleData(100);
    expect(data.length).toBe(100);
    const class1 = data.filter((d) => d.label === 1).length;
    const class0 = data.filter((d) => d.label === 0).length;
    expect(class1).toBeGreaterThan(20);
    expect(class0).toBeGreaterThan(20);
  });

  it('should generate XOR dataset with points spread across 4 quadrants', () => {
    const data = generateXorData(100);
    expect(data.length).toBe(100);
    expect(data.every((d) => d.label === 0 || d.label === 1)).toBe(true);
  });

  it('should generate Spiral dataset with intertwining arms', () => {
    const data = generateSpiralData(80);
    expect(data.length).toBe(80);
    const class1 = data.filter((d) => d.label === 1).length;
    const class0 = data.filter((d) => d.label === 0).length;
    expect(class1).toBe(40);
    expect(class0).toBe(40);
  });
});
