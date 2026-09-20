import React, { useState } from 'react';
import { Play, RotateCcw, Save, Trash2, Code2, Terminal as TermIcon, FileText } from 'lucide-react';
import { sound } from '../../core/audio/soundEngine';
import { vfs } from '../../core/vfs/vfs';

interface CodeSnippet {
  id: string;
  name: string;
  vfsPath?: string;
  code: string;
}

const DEFAULT_SNIPPETS: CodeSnippet[] = [
  {
    id: 'benchmark',
    name: 'fibonacci.js',
    vfsPath: '/home/user/projects/demo.js',
    code: `// High-Performance Fibonacci Memoization Benchmark
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

console.log("⚡ Initiating benchmark compute on Aether VM...");
const n = 40;
const t0 = performance.now();
const result = fibonacci(n);
const t1 = performance.now();

console.log(\`Computed Fib(\${n}) = \${result}\`);
console.log(\`Execution time: \${(t1 - t0).toFixed(3)} ms\`);
`,
  },
  {
    id: 'emitter',
    name: 'event_emitter.js',
    code: `// Cyber Event Emitter Implementation
class CyberEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return;
    for (const listener of this.events.get(event)) {
      listener(...args);
    }
  }
}

const bus = new CyberEmitter();
bus.on('quantum:pulse', (val) => console.log(\`[PULSE] Frequency locked: \${val} THz\`));
bus.on('quantum:pulse', (val) => console.log(\`[PULSE] Flux variance: \${(val * 0.05).toFixed(2)}\`));

bus.emit('quantum:pulse', 142.85);
`,
  },
  {
    id: 'matrix',
    name: 'matrix_transform.js',
    code: `// 2D Rotation Matrix Transformation
function rotatePoint(x, y, angleRad) {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: Number((x * cos - y * sin).toFixed(4)),
    y: Number((x * sin + y * cos).toFixed(4)),
  };
}

console.log("Rotating vector [1, 0] by 90 degrees (PI/2):");
console.log(rotatePoint(1, 0, Math.PI / 2));

console.log("Rotating vector [1, 1] by 45 degrees (PI/4):");
console.log(rotatePoint(1, 1, Math.PI / 4));
`,
  },
];

interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  time: string;
}

export const CodeCraft: React.FC = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(DEFAULT_SNIPPETS);
  const [activeSnippetId, setActiveSnippetId] = useState<string>('benchmark');
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'info', message: 'Aether CodeCraft JavaScript V8 Sandbox ready.', time: '00:00:00' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const currentSnippet = snippets.find((s) => s.id === activeSnippetId) || snippets[0];

  const updateCode = (newCode: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === activeSnippetId ? { ...s, code: newCode } : s))
    );
  };

  const handleRun = () => {
    sound.playClick();
    setIsRunning(true);
    const output: LogEntry[] = [];
    const getTime = () => new Date().toLocaleTimeString();

    const customConsole = {
      log: (...args: unknown[]) => {
        output.push({
          type: 'log',
          message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          time: getTime(),
        });
      },
      warn: (...args: unknown[]) => {
        output.push({
          type: 'warn',
          message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          time: getTime(),
        });
      },
      error: (...args: unknown[]) => {
        output.push({
          type: 'error',
          message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          time: getTime(),
        });
      },
      info: (...args: unknown[]) => {
        output.push({
          type: 'info',
          message: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          time: getTime(),
        });
      },
    };

    try {
      const runner = new Function('console', 'performance', currentSnippet.code);
      runner(customConsole, performance);
      sound.playSuccess();
    } catch (err: unknown) {
      sound.playError();
      output.push({
        type: 'error',
        message: `Runtime Error: ${(err as Error).message}`,
        time: getTime(),
      });
    }

    setLogs((prev) => [...prev, ...output]);
    setIsRunning(false);
  };

  const handleSaveToVfs = () => {
    if (currentSnippet.vfsPath) {
      vfs.writeFile(currentSnippet.vfsPath, currentSnippet.code);
      sound.playSuccess();
      setLogs((prev) => [
        ...prev,
        {
          type: 'info',
          message: `Saved '${currentSnippet.name}' to VFS at ${currentSnippet.vfsPath}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      const newPath = `/home/user/projects/${currentSnippet.name}`;
      vfs.writeFile(newPath, currentSnippet.code);
      sound.playSuccess();
      setLogs((prev) => [
        ...prev,
        {
          type: 'info',
          message: `Saved '${currentSnippet.name}' to VFS at ${newPath}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleResetSnippet = () => {
    const original = DEFAULT_SNIPPETS.find((s) => s.id === activeSnippetId);
    if (original) {
      updateCode(original.code);
      sound.playClick();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgba(5, 5, 12, 0.9)' }}>
      {/* Top Header: Tabs & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {snippets.map((snip) => {
            const isActive = snip.id === activeSnippetId;
            return (
              <button
                key={snip.id}
                onClick={() => {
                  sound.playClick();
                  setActiveSnippetId(snip.id);
                }}
                className={`btn-cyber ${isActive ? 'btn-cyber-primary' : ''}`}
                style={{ height: '28px', padding: '0 10px', fontSize: '12px' }}
              >
                <FileText size={12} />
                <span>{snip.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleRun} disabled={isRunning} className="btn-cyber btn-cyber-primary" style={{ height: '28px' }}>
            <Play size={13} />
            <span>Execute</span>
          </button>

          <button onClick={handleSaveToVfs} className="btn-cyber" title="Save to Virtual File System" style={{ height: '28px' }}>
            <Save size={13} />
            <span>Save to VFS</span>
          </button>

          <button onClick={handleResetSnippet} className="btn-cyber" title="Reset Code" style={{ height: '28px' }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Editor & Console Split View */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Code Editor Deck */}
        <div style={{ flex: 3, display: 'flex', position: 'relative', borderRight: '1px solid var(--border-color)' }}>
          {/* Line Numbers */}
          <div
            style={{
              width: '42px',
              padding: '12px 6px',
              textAlign: 'right',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '20px',
              userSelect: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {currentSnippet.code.split('\n').map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          {/* Textarea Code Input */}
          <textarea
            value={currentSnippet.code}
            onChange={(e) => updateCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#d1e4e8',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '20px',
              padding: '12px',
              resize: 'none',
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto',
            }}
          />
        </div>

        {/* Output Console Deck */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(3, 3, 8, 0.95)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              <TermIcon size={12} />
              <span>OUTPUT LOG</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setLogs([]);
              }}
              className="btn-cyber"
              style={{ padding: '2px 6px', height: '22px', fontSize: '10px' }}
              title="Clear Logs"
            >
              <Trash2 size={11} />
              <span>Clear</span>
            </button>
          </div>

          {/* Log List */}
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.4' }}>
            {logs.map((log, idx) => {
              let color = '#a0f0ff';
              if (log.type === 'error') color = 'var(--error)';
              if (log.type === 'warn') color = 'var(--warning)';
              if (log.type === 'info') color = 'var(--text-muted)';

              return (
                <div key={idx} style={{ marginBottom: '6px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>[{log.time}]</span>
                  <span style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}>
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
