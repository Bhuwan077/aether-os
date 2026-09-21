import React, { useState, useMemo } from 'react';
import { QuantumCircuit, GateType } from './engine/circuit';
import { sound } from '../../core/audio/soundEngine';
import { Play, RotateCcw, Sparkles, Trash2, HelpCircle } from 'lucide-react';

interface PlacedGate {
  id: string;
  step: number;
  qubit: number;
  gate: GateType;
  controlQubit?: number;
}

const GATES_PALETTE: { type: GateType; label: string; desc: string; color: string }[] = [
  { type: 'H', label: 'H', desc: 'Hadamard (Superposition)', color: '#00f3ff' },
  { type: 'X', label: 'X', desc: 'Pauli-X (Quantum NOT)', color: '#ff007f' },
  { type: 'Z', label: 'Z', desc: 'Pauli-Z (Phase Flip)', color: '#a855f7' },
  { type: 'S', label: 'S', desc: 'Phase Gate (π/2)', color: '#38bdf8' },
  { type: 'T', label: 'T', desc: 'T Gate (π/4)', color: '#ffb700' },
  { type: 'CNOT', label: 'CX', desc: 'Controlled-NOT (Entangle)', color: '#00ff88' },
];

const NUM_QUBITS = 3;
const NUM_STEPS = 6;

export const QuantumStudio: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<GateType>('H');
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([
    { id: '1', step: 0, qubit: 0, gate: 'H' },
    { id: '2', step: 1, qubit: 1, gate: 'CNOT', controlQubit: 0 },
  ]);

  // Compute Quantum Simulation result based on placed gates
  const { probabilities, circuitState } = useMemo(() => {
    const qc = new QuantumCircuit(NUM_QUBITS);

    // Sort placed gates chronologically by step
    const sorted = [...placedGates].sort((a, b) => a.step - b.step);

    for (const g of sorted) {
      if (g.gate === 'CNOT') {
        const ctrl = g.controlQubit !== undefined ? g.controlQubit : (g.qubit === 0 ? 1 : 0);
        qc.applyCNOT(ctrl, g.qubit);
      } else {
        qc.applyGate(g.gate, g.qubit);
      }
    }

    return {
      probabilities: qc.getProbabilities(),
      circuitState: qc.state,
    };
  }, [placedGates]);

  const handleCellClick = (step: number, qubit: number) => {
    sound.playClick();
    const existingIdx = placedGates.findIndex((g) => g.step === step && g.qubit === qubit);

    if (existingIdx !== -1) {
      // Remove existing gate
      setPlacedGates((prev) => prev.filter((_, idx) => idx !== existingIdx));
    } else {
      // Add selected gate
      const newGate: PlacedGate = {
        id: `gate-${Date.now()}-${step}-${qubit}`,
        step,
        qubit,
        gate: selectedGate,
        controlQubit: selectedGate === 'CNOT' ? (qubit === 0 ? 1 : 0) : undefined,
      };
      setPlacedGates((prev) => [...prev, newGate]);
    }
  };

  const handleClear = () => {
    sound.playClick();
    setPlacedGates([]);
  };

  const loadPreset = (preset: 'bell' | 'ghz' | 'superposition') => {
    sound.playSuccess();
    if (preset === 'bell') {
      setPlacedGates([
        { id: '1', step: 0, qubit: 0, gate: 'H' },
        { id: '2', step: 1, qubit: 1, gate: 'CNOT', controlQubit: 0 },
      ]);
    } else if (preset === 'ghz') {
      setPlacedGates([
        { id: '1', step: 0, qubit: 0, gate: 'H' },
        { id: '2', step: 1, qubit: 1, gate: 'CNOT', controlQubit: 0 },
        { id: '3', step: 2, qubit: 2, gate: 'CNOT', controlQubit: 1 },
      ]);
    } else if (preset === 'superposition') {
      setPlacedGates([
        { id: '1', step: 0, qubit: 0, gate: 'H' },
        { id: '2', step: 0, qubit: 1, gate: 'H' },
        { id: '3', step: 0, qubit: 2, gate: 'H' },
      ]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px', backgroundColor: 'rgba(6, 7, 14, 0.95)', color: '#e0f7fa' }}>
      {/* Top Deck: Gate Palette & Preset Buttons */}
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
        {/* Gate Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Select Gate:</span>
          {GATES_PALETTE.map((g) => {
            const isSelected = selectedGate === g.type;
            return (
              <button
                key={g.type}
                onClick={() => {
                  sound.playClick();
                  setSelectedGate(g.type);
                }}
                className={`btn-cyber ${isSelected ? 'btn-cyber-primary' : ''}`}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderColor: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                }}
                title={g.desc}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Presets & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Presets:</span>
          <button onClick={() => loadPreset('bell')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>Bell State</button>
          <button onClick={() => loadPreset('ghz')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>GHZ State</button>
          <button onClick={() => loadPreset('superposition')} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px' }}>Uniform 3-Qubit</button>
          <button onClick={handleClear} className="btn-cyber" style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--error)' }} title="Clear Circuit">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Main Split: Circuit Board Wire Deck + Measurement Histogram */}
      <div style={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {/* Circuit Board Wire Grid */}
        <div
          className="glass-panel"
          style={{
            flex: 3,
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            backgroundColor: '#04050a',
            position: 'relative',
          }}
        >
          {Array.from({ length: NUM_QUBITS }).map((_, qIdx) => (
            <div key={qIdx} style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '60px' }}>
              {/* Qubit Label */}
              <div
                style={{
                  width: '50px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                |q{qIdx}⟩
              </div>

              {/* Wire Line */}
              <div
                style={{
                  position: 'absolute',
                  left: '60px',
                  right: '20px',
                  height: '2px',
                  backgroundColor: 'rgba(0, 243, 255, 0.3)',
                  boxShadow: '0 0 4px rgba(0, 243, 255, 0.2)',
                  zIndex: 1,
                }}
              />

              {/* Step Slots */}
              <div style={{ flex: 1, marginLeft: '60px', display: 'flex', justifyContent: 'space-around', zIndex: 2 }}>
                {Array.from({ length: NUM_STEPS }).map((_, stepIdx) => {
                  const placed = placedGates.find((g) => g.step === stepIdx && g.qubit === qIdx);

                  return (
                    <div
                      key={stepIdx}
                      onClick={() => handleCellClick(stepIdx, qIdx)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        border: placed ? '1px solid var(--accent)' : '1px dashed rgba(255, 255, 255, 0.15)',
                        backgroundColor: placed ? 'rgba(0, 243, 255, 0.2)' : 'rgba(10, 10, 20, 0.7)',
                        boxShadow: placed ? '0 0 10px rgba(0, 243, 255, 0.4)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: placed ? '#ffffff' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {placed?.gate === 'CNOT' ? '⊕' : placed?.gate}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            Click an empty slot to place selected gate • Click an occupied slot to remove
          </div>
        </div>

        {/* Measurement Probability Histogram Deck */}
        <div
          className="glass-panel"
          style={{
            flex: 2,
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#04050a',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '12px' }}>
            MEASUREMENT OUTCOME PROBABILITIES
          </span>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            {probabilities.map((item) => {
              const pct = Math.round(item.probability * 100);
              return (
                <div key={item.stateStr} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: item.probability > 0 ? '#ffffff' : 'var(--text-muted)' }}>{item.stateStr}</span>
                    <span style={{ color: item.probability > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: item.probability > 0 ? 'var(--accent)' : 'transparent',
                        boxShadow: item.probability > 0 ? '0 0 6px var(--accent)' : 'none',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
