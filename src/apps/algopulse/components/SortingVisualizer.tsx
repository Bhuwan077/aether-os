import React, { useState, useEffect, useRef } from 'react';
import { SortingAlgorithmId, SortStep } from '../types';
import { getSortSteps } from '../algorithms/sorting';
import { sound } from '../../../core/audio/soundEngine';
import { Play, Pause, RotateCcw, SkipForward, Volume2 } from 'lucide-react';

export const SortingVisualizer: React.FC = () => {
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(40);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAlgo, setSelectedAlgo] = useState<SortingAlgorithmId>('quicksort');
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef<number | null>(null);

  const resetArray = (size = arraySize) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArr);
    const computedSteps = getSortSteps(selectedAlgo, newArr);
    setSteps(computedSteps);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    resetArray(arraySize);
  }, [selectedAlgo, arraySize]);

  const currentStep = steps[currentStepIndex] || {
    array,
    comparing: [],
    swapping: [],
    sortedIndices: [],
  };

  // Step advancement with musical tone synthesis
  const advanceStep = () => {
    setCurrentStepIndex((prev) => {
      if (prev >= steps.length - 1) {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        sound.playSuccess();
        return prev;
      }
      const next = prev + 1;
      const step = steps[next];

      if (soundEnabled && step) {
        const val = step.swapping[0] !== undefined
          ? step.array[step.swapping[0]]
          : (step.comparing[0] !== undefined ? step.array[step.comparing[0]] : null);

        if (val !== null && val !== undefined) {
          const freq = 200 + (val / 100) * 700;
          sound.playTone(freq, 0.04, 'triangle', 0.2);
        }
      }

      return next;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(advanceStep, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps, soundEnabled]);

  const maxVal = Math.max(...(currentStep.array.length > 0 ? currentStep.array : [100]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px' }}>
      {/* Control Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value as SortingAlgorithmId)}
            className="btn-cyber"
            style={{ padding: '4px 8px', outline: 'none' }}
          >
            <option value="quicksort" style={{ background: '#121220' }}>QuickSort (O(N log N))</option>
            <option value="bubblesort" style={{ background: '#121220' }}>BubbleSort (O(N²))</option>
            <option value="insertionsort" style={{ background: '#121220' }}>InsertionSort (O(N²))</option>
          </select>

          <button onClick={() => resetArray()} className="btn-cyber" title="Randomize Array">
            <RotateCcw size={13} />
            <span>Randomize</span>
          </button>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn-cyber ${isPlaying ? 'btn-cyber-primary' : ''}`}
            style={{ padding: '4px 10px' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Visualize'}</span>
          </button>

          <button
            onClick={advanceStep}
            disabled={isPlaying || currentStepIndex >= steps.length - 1}
            className="btn-cyber"
            title="Step Forward"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`btn-cyber ${soundEnabled ? 'btn-cyber-primary' : ''}`}
            title="Harmonic Audio Tones"
          >
            <Volume2 size={14} />
          </button>
        </div>

        {/* Sliders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Size:</span>
            <input
              type="range"
              min={15}
              max={70}
              value={arraySize}
              disabled={isPlaying}
              onChange={(e) => setArraySize(Number(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--accent)' }}
            />
            <span>{arraySize}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Speed:</span>
            <input
              type="range"
              min={5}
              max={150}
              value={155 - speed}
              onChange={(e) => setSpeed(155 - Number(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--accent)' }}
            />
          </label>
        </div>
      </div>

      {/* Visualizer Canvas / Bars */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: arraySize > 40 ? '2px' : '4px',
          padding: '16px 12px 0 12px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'rgba(5, 5, 12, 0.8)',
        }}
      >
        {currentStep.array.map((val, idx) => {
          const isComparing = currentStep.comparing.includes(idx);
          const isSwapping = currentStep.swapping.includes(idx);
          const isSorted = currentStep.sortedIndices.includes(idx);

          let barColor = 'var(--accent)';
          let glow = 'none';

          if (isSwapping) {
            barColor = 'var(--error)';
            glow = '0 0 12px var(--error)';
          } else if (isComparing) {
            barColor = 'var(--warning)';
            glow = '0 0 10px var(--warning)';
          } else if (isSorted) {
            barColor = 'var(--success)';
            glow = '0 0 8px var(--success)';
          }

          const heightPercent = (val / maxVal) * 92;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${heightPercent}%`,
                backgroundColor: barColor,
                boxShadow: glow,
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.05s ease, background-color 0.05s ease',
                position: 'relative',
              }}
            >
              {arraySize <= 30 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {val}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}
      >
        <span>Algorithm: <strong style={{ color: 'var(--accent)' }}>{selectedAlgo.toUpperCase()}</strong></span>
        <span>Step: {currentStepIndex + 1} / {steps.length}</span>
        <span>Comparisons: {currentStep.comparing.length > 0 ? 'Active' : 'Idle'}</span>
      </div>
    </div>
  );
};
