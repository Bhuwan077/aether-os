import React from 'react';
import { Sparkles, Terminal, Cpu, Code, Music, Share2, CheckSquare, Activity, Command } from 'lucide-react';
import { sound } from '../../core/audio/soundEngine';

interface WelcomeAppProps {
  onLaunchApp: (id: any) => void;
}

export const WelcomeApp: React.FC<WelcomeAppProps> = ({ onLaunchApp }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        overflowY: 'auto',
        backgroundColor: 'rgba(8, 8, 18, 0.95)',
        color: '#e0f7fa',
        lineHeight: '1.6',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '8px' }}>
          <Sparkles size={24} />
          <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '1px' }}>
            AETHER OS v2.4 (QUANTUM EDITION)
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '640px', margin: '0 auto' }}>
          A futuristic, high-performance web workstation and developer sandbox inspired by cyberpunk aesthetics, procedural audio synthesis, and interactive algorithms.
        </p>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '6px' }}>
            <Terminal size={18} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>RetroTerm</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Unix shell featuring pipe operations, command history, tab autocomplete, and full Matrix digital rain mode.
          </p>
          <button onClick={() => { sound.playClick(); onLaunchApp('retroterm'); }} className="btn-cyber" style={{ fontSize: '11px', padding: '3px 8px' }}>
            Launch Terminal
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '6px' }}>
            <Cpu size={18} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>AlgoPulse</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Sorting visualizer with harmonic Web Audio pitches, A* & Dijkstra pathfinding, and Conway's Game of Life.
          </p>
          <button onClick={() => { sound.playClick(); onLaunchApp('algopulse'); }} className="btn-cyber" style={{ fontSize: '11px', padding: '3px 8px' }}>
            Launch AlgoPulse
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '6px' }}>
            <Code size={18} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>CodeCraft</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            In-browser code editor and live JavaScript execution sandbox synchronized with the Virtual File System.
          </p>
          <button onClick={() => { sound.playClick(); onLaunchApp('codecraft'); }} className="btn-cyber" style={{ fontSize: '11px', padding: '3px 8px' }}>
            Launch CodeCraft
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff007f', marginBottom: '6px' }}>
            <Music size={18} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>SynthLab</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Polyphonic synthesizer with interactive piano keyboard, ADSR envelope shaping, and real-time FFT oscilloscope.
          </p>
          <button onClick={() => { sound.playClick(); onLaunchApp('synthlab'); }} className="btn-cyber" style={{ fontSize: '11px', padding: '3px 8px' }}>
            Launch SynthLab
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', marginBottom: '6px' }}>
            <Share2 size={18} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>MindCanvas</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Force-directed physics graph and infinite canvas mindmap with dynamic Coulomb/Hooke spring simulations.
          </p>
          <button onClick={() => { sound.playClick(); onLaunchApp('mindcanvas'); }} className="btn-cyber" style={{ fontSize: '11px', padding: '3px 8px' }}>
            Launch MindCanvas
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', marginBottom: '6px' }}>
            <CheckSquare size={18} />
            <strong style={{ fontFamily: 'var(--font-mono)' }}>TaskNexus</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Kanban sprint board with task progression, integrated Pomodoro focus timer, and completion confetti.
          </p>
          <button onClick={() => { sound.playClick(); onLaunchApp('tasknexus'); }} className="btn-cyber" style={{ fontSize: '11px', padding: '3px 8px' }}>
            Launch TaskNexus
          </button>
        </div>
      </div>

      {/* Shortcuts Guide */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '10px' }}>
          <Command size={18} />
          <strong style={{ fontFamily: 'var(--font-mono)' }}>Master Keyboard Shortcuts</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          <div><strong style={{ color: 'var(--accent)' }}>Ctrl + K / Cmd + K</strong> : Global Command Palette</div>
          <div><strong style={{ color: 'var(--accent)' }}>Double Click Titlebar</strong> : Maximize / Restore Window</div>
          <div><strong style={{ color: 'var(--accent)' }}>◧ / ◨ Buttons</strong> : Snap Window Half-Screen</div>
          <div><strong style={{ color: 'var(--accent)' }}>Piano Keys (Q, W, E...)</strong> : Play SynthLab Polyphony</div>
          <div><strong style={{ color: 'var(--accent)' }}>Terminal 'matrix'</strong> : Fullscreen Digital Rain</div>
          <div><strong style={{ color: 'var(--accent)' }}>Terminal 'neofetch'</strong> : ASCII System Telemetry</div>
        </div>
      </div>
    </div>
  );
};
