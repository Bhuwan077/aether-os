import { SortStep, SortingAlgorithmId } from '../types';

export function generateBubbleSortSteps(initial: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initial];
  const n = arr.length;
  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sortedIndices: [...sortedIndices],
      });

      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sortedIndices: [...sortedIndices],
        });
      }
    }
    sortedIndices.push(n - 1 - i);
  }
  sortedIndices.push(0);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [...sortedIndices],
  });

  return steps;
}

export function generateInsertionSortSteps(initial: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initial];
  const sortedIndices: number[] = [0];

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [i, j],
      swapping: [],
      sortedIndices: [...sortedIndices],
    });

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j, j + 1],
        sortedIndices: [...sortedIndices],
      });
      j = j - 1;
    }
    arr[j + 1] = key;
    sortedIndices.push(i);
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: Array.from({ length: arr.length }, (_, idx) => idx),
  });

  return steps;
}

export function generateQuickSortSteps(initial: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initial];
  const sortedIndices: number[] = [];

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        sortedIndices: [...sortedIndices],
      });

      if (arr[j] < pivot) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, j],
          sortedIndices: [...sortedIndices],
        });
      }
    }

    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    sortedIndices.push(i + 1);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i + 1, high],
      sortedIndices: [...sortedIndices],
    });

    return i + 1;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sortedIndices.push(low);
    }
  }

  quickSort(0, arr.length - 1);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: Array.from({ length: arr.length }, (_, idx) => idx),
  });

  return steps;
}

export function getSortSteps(algorithm: SortingAlgorithmId, array: number[]): SortStep[] {
  switch (algorithm) {
    case 'bubblesort': return generateBubbleSortSteps(array);
    case 'insertionsort': return generateInsertionSortSteps(array);
    case 'quicksort': return generateQuickSortSteps(array);
    default: return generateQuickSortSteps(array);
  }
}
