import { describe, it, expect } from 'vitest';
import { generateBubbleSortSteps, generateQuickSortSteps, generateInsertionSortSteps } from '../algorithms/sorting';

describe('Sorting Algorithms Step Generator', () => {
  const sample = [50, 20, 40, 10, 30];

  it('should generate steps that end with completely sorted array for BubbleSort', () => {
    const steps = generateBubbleSortSteps(sample);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.array).toEqual([10, 20, 30, 40, 50]);
  });

  it('should generate steps that end with completely sorted array for InsertionSort', () => {
    const steps = generateInsertionSortSteps(sample);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.array).toEqual([10, 20, 30, 40, 50]);
  });

  it('should generate steps that end with completely sorted array for QuickSort', () => {
    const steps = generateQuickSortSteps(sample);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.array).toEqual([10, 20, 30, 40, 50]);
  });
});
