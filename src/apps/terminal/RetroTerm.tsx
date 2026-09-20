import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TerminalEngine, CommandContext } from './commandParser';
import { sound } from '../../core/audio/soundEngine';

interface HistoryEntry {
  type: 'command' | 'output';
  content: string;
  cwd?: string;
}

interface RetroTermProps {
  onTriggerMatrix?: () => void;
}

export const RetroTerm: React.FC<RetroTermProps> = () => {
  const engine = useMemo(() => new TerminalEngine(), []);
  const [cwd, setCwd] = useState('/home/user');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: 'output', content: '🌌 AetherOS Interactive Terminal v2.4 (x86_64-wasm)' },
    { type: 'output', content: 'Type "help" for a list of built-in commands or "neofetch" for system info.' },
    { type: 'output', content: '' },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const ctx: CommandContext = {
    cwd,
    setCwd,
    output: (text: string) => {
      setHistory((prev) => [...prev, { type: 'output', content: text }]);
    },
    clear: () => {
      setHistory([]);
    },
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input;
      setInput('');
      setHistoryIndex(null);

      setHistory((prev) => [...prev, { type: 'command', content: cmd, cwd }]);
      sound.playClick();

      if (cmd.trim()) {
        engine.execute(cmd, ctx);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const past = engine.getHistory();
      if (past.length === 0) return;

      const nextIdx = historyIndex === null ? past.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(past[nextIdx] || '');
      sound.playClick();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const past = engine.getHistory();
      if (historyIndex === null) return;

      const nextIdx = historyIndex + 1;
      if (nextIdx >= past.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(nextIdx);
        setInput(past[nextIdx]);
      }
      sound.playClick();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const tokens = input.split(' ');
      const lastToken = tokens[tokens.length - 1] || '';
      const completions = engine.getCompletions(lastToken, cwd);

      if (completions.length === 1) {
        tokens[tokens.length - 1] = completions[0];
        setInput(tokens.join(' '));
        sound.playClick();
      } else if (completions.length > 1) {
        setHistory((prev) => [
          ...prev,
          { type: 'command', content: input, cwd },
          { type: 'output', content: completions.join('    ') },
        ]);
        sound.playClick();
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: 'rgba(5, 5, 10, 0.96)',
        color: '#a0f0ff',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: '1.5',
        padding: '12px',
        overflowY: 'auto',
        cursor: 'text',
      }}
    >
      {history.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {item.type === 'command' ? (
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>user@aether</span>
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ color: 'var(--success)' }}>{item.cwd}</span>
              <span style={{ color: 'var(--text-muted)' }}>$ </span>
              <span style={{ color: '#ffffff' }}>{item.content}</span>
            </div>
          ) : (
            <div style={{ color: item.content.includes('error') ? 'var(--error)' : '#c7d5e0' }}>
              {item.content}
            </div>
          )}
        </div>
      ))}

      {/* Live Input Line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>user@aether</span>
        <span style={{ color: 'var(--text-muted)' }}>:</span>
        <span style={{ color: 'var(--success)' }}>{cwd}</span>
        <span style={{ color: 'var(--text-muted)' }}>$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            caretColor: 'var(--accent)',
          }}
        />
      </div>
      <div ref={terminalEndRef} />
    </div>
  );
};
