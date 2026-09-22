import React, { useState, useEffect, useRef } from 'react';
import { WindowId } from '../core/wm/types';
import { ThemeId } from '../core/theme/types';
import { THEMES, applyTheme } from '../core/theme/themes';
import { sound } from '../core/audio/soundEngine';
import {
  Search,
  Terminal,
  Cpu,
  Code,
  Share2,
  Music,
  CheckSquare,
  Activity,
  Palette,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Database,
  Orbit,
  Disc,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Applications' | 'Themes' | 'System';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (id: WindowId) => void;
  onThemeChange: (theme: ThemeId) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
  onThemeChange,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Apps
    {
      id: 'app-term',
      title: 'Open RetroTerm (Unix Terminal)',
      category: 'Applications',
      icon: <Terminal size={16} />,
      shortcut: 'T',
      action: () => onLaunchApp('retroterm'),
    },
    {
      id: 'app-algo',
      title: 'Open AlgoPulse (Algorithm Visualizer)',
      category: 'Applications',
      icon: <Cpu size={16} />,
      shortcut: 'A',
      action: () => onLaunchApp('algopulse'),
    },
    {
      id: 'app-code',
      title: 'Open CodeCraft (Code Playground & REPL)',
      category: 'Applications',
      icon: <Code size={16} />,
      shortcut: 'C',
      action: () => onLaunchApp('codecraft'),
    },
    {
      id: 'app-mind',
      title: 'Open MindCanvas (Knowledge Graph)',
      category: 'Applications',
      icon: <Share2 size={16} />,
      shortcut: 'M',
      action: () => onLaunchApp('mindcanvas'),
    },
    {
      id: 'app-synth',
      title: 'Open SynthLab (Synthesizer & Audio FX)',
      category: 'Applications',
      icon: <Music size={16} />,
      shortcut: 'S',
      action: () => onLaunchApp('synthlab'),
    },
    {
      id: 'app-task',
      title: 'Open TaskNexus (Kanban & Pomodoro)',
      category: 'Applications',
      icon: <CheckSquare size={16} />,
      shortcut: 'K',
      action: () => onLaunchApp('tasknexus'),
    },
    {
      id: 'app-neural',
      title: 'Open NeuralPlayground (AI & Deep Learning)',
      category: 'Applications',
      icon: <Cpu size={16} />,
      shortcut: 'N',
      action: () => onLaunchApp('neural'),
    },
    {
      id: 'app-quantum',
      title: 'Open QuantumStudio (Qubits & Circuits)',
      category: 'Applications',
      icon: <Activity size={16} />,
      shortcut: 'Q',
      action: () => onLaunchApp('quantum'),
    },
    {
      id: 'app-shaders',
      title: 'Open ShaderForge (WebGL Shaders)',
      category: 'Applications',
      icon: <Sparkles size={16} />,
      shortcut: 'F',
      action: () => onLaunchApp('shaders'),
    },
    {
      id: 'app-paint',
      title: 'Open CyberPaint (Pixel Art & Sprites)',
      category: 'Applications',
      icon: <Palette size={16} />,
      shortcut: 'P',
      action: () => onLaunchApp('pixelart'),
    },
    {
      id: 'app-files',
      title: 'Open FileFlow (VFS File Manager)',
      category: 'Applications',
      icon: <Code size={16} />,
      shortcut: 'E',
      action: () => onLaunchApp('fileflow'),
    },
    {
      id: 'app-crypto',
      title: 'Open CryptForge (RSA, Ciphers & Steganography)',
      category: 'Applications',
      icon: <ShieldCheck size={16} />,
      shortcut: 'R',
      action: () => onLaunchApp('crypto'),
    },
    {
      id: 'app-sql',
      title: 'Open SQLSand (In-Browser Relational DB)',
      category: 'Applications',
      icon: <Database size={16} />,
      shortcut: 'D',
      action: () => onLaunchApp('sql'),
    },
    {
      id: 'app-physics',
      title: 'Open CelestialOrbits (2D N-Body Physics)',
      category: 'Applications',
      icon: <Orbit size={16} />,
      shortcut: 'O',
      action: () => onLaunchApp('physics'),
    },
    {
      id: 'app-sequencer',
      title: 'Open BeatMatrix (16-Step Drum Machine)',
      category: 'Applications',
      icon: <Disc size={16} />,
      shortcut: 'B',
      action: () => onLaunchApp('sequencer'),
    },
    {
      id: 'app-sys',
      title: 'Open System Monitor & Telemetry',
      category: 'Applications',
      icon: <Activity size={16} />,
      shortcut: 'Y',
      action: () => onLaunchApp('sysmon'),
    },
    {
      id: 'app-help',
      title: 'Open AetherOS Documentation',
      category: 'Applications',
      icon: <HelpCircle size={16} />,
      shortcut: 'H',
      action: () => onLaunchApp('welcome'),
    },

    // Themes
    ...((Object.keys(THEMES) as ThemeId[]).map((tId) => ({
      id: `theme-${tId}`,
      title: `Switch Theme: ${THEMES[tId].name}`,
      category: 'Themes' as const,
      icon: <Palette size={16} />,
      action: () => {
        onThemeChange(tId);
        applyTheme(tId);
      },
    }))),

    // System Commands
    {
      id: 'sys-mute',
      title: sound.isMuted() ? 'Audio: Unmute Synthesizer' : 'Audio: Mute Synthesizer',
      category: 'System',
      icon: sound.isMuted() ? <Volume2 size={16} /> : <VolumeX size={16} />,
      action: () => sound.toggleMute(),
    },
  ];

  const evaluateMath = (expr: string): number | null => {
    const sanitized = expr.trim().replace(/\^/g, '**').replace(/x/g, '*');
    if (!/^[0-9+\-*/().\s*]+$/.test(sanitized) || sanitized.length === 0) return null;
    try {
      const res = Function(`"use strict"; return (${sanitized});`)();
      return typeof res === 'number' && !isNaN(res) ? res : null;
    } catch {
      return null;
    }
  };

  const mathResult = evaluateMath(query);

  const mathCommandItem: CommandItem[] = mathResult !== null
    ? [
        {
          id: 'math-result',
          title: `Calculation Result: ${mathResult}`,
          category: 'System' as const,
          icon: <Activity size={16} color="var(--success)" />,
          shortcut: 'Enter',
          action: () => {
            navigator.clipboard?.writeText(String(mathResult));
          },
        },
      ]
    : [];

  const filtered: CommandItem[] = [
    ...mathCommandItem,
    ...commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    ),
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      sound.playClick();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      sound.playClick();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        sound.playSuccess();
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '580px',
          maxWidth: '92vw',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 243, 255, 0.2)',
          border: '1px solid var(--accent)',
          animation: 'fade-in 0.15s ease-out',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <Search size={18} color="var(--accent)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, launch an app, or search themes..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
            }}
          >
            ESC to exit
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            >
              No matching commands or applications found.
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playSuccess();
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {item.category}
                      </div>
                    </div>
                  </div>

                  {item.shortcut && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent)',
                        background: 'rgba(0, 243, 255, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
