import React, { useState, useEffect } from 'react';
import { vfs } from '../../core/vfs/vfs';
import { wm } from '../../core/wm/windowManager';
import { sound } from '../../core/audio/soundEngine';
import { ThemeId } from '../../core/theme/types';
import { THEMES, applyTheme } from '../../core/theme/themes';
import { Cpu, HardDrive, Layers, Activity, Volume2, Trash2 } from 'lucide-react';

interface SysMonProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export const SysMon: React.FC<SysMonProps> = ({ currentTheme, onThemeChange }) => {
  const [cpuHistory, setCpuHistory] = useState<number[]>([35, 42, 28, 65, 40, 50, 45, 60, 38, 48]);
  const [cpuUsage, setCpuUsage] = useState(48);
  const [ramUsage, setRamUsage] = useState(1420);
  const [vfsStats, setVfsStats] = useState({ count: 0, bytes: 0 });
  const [windows, setWindows] = useState(wm.getAllWindows());

  // Periodically sample CPU/RAM simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 12;
      const nextCpu = Math.max(10, Math.min(95, Math.round(cpuUsage + delta)));
      setCpuUsage(nextCpu);
      setCpuHistory((prev) => [...prev.slice(1), nextCpu]);

      const ramDelta = (Math.random() - 0.5) * 20;
      setRamUsage((r) => Math.max(1024, Math.min(3000, Math.round(r + ramDelta))));

      setWindows(wm.getAllWindows());
    }, 1200);
    return () => clearInterval(interval);
  }, [cpuUsage]);

  useEffect(() => {
    try {
      const files = vfs.readDir('/home/user/desktop').length +
                    vfs.readDir('/home/user/projects').length +
                    vfs.readDir('/home/user/notes').length +
                    vfs.readDir('/etc').length;
      setVfsStats({ count: files, bytes: JSON.stringify(vfs).length });
    } catch {
      // Ignored
    }
  }, []);

  const handleResetVfs = () => {
    sound.playClick();
    if (window.confirm('Reset Virtual File System to default factory state?')) {
      vfs.resetToDefaults();
      sound.playSuccess();
    }
  };

  const handleTestChime = () => {
    sound.playSuccess();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '14px', backgroundColor: 'rgba(5, 5, 12, 0.9)' }}>
      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {/* CPU Card */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>CPU LOAD</span>
            <Cpu size={15} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {cpuUsage}%
          </span>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${cpuUsage}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* RAM Card */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--success)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>MEMORY HEAP</span>
            <Activity size={15} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {ramUsage} MB
          </span>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${(ramUsage / 4096) * 100}%`, height: '100%', backgroundColor: 'var(--success)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* VFS Card */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--warning)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>VFS STORAGE</span>
            <HardDrive size={15} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {vfsStats.count} Files
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Mounted on /
          </span>
        </div>

        {/* Active Windows Card */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>ACTIVE THREADS</span>
            <Layers size={15} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {windows.length} Windows
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Compositor at 60 FPS
          </span>
        </div>
      </div>

      {/* Middle Deck: CPU History SVG Chart + Theme Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', flex: 1 }}>
        {/* CPU Chart */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            CPU Telemetry Activity (10-Sample Moving Average)
          </span>

          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                points={`0,120 ${cpuHistory.map((val, idx) => `${idx * (400 / (cpuHistory.length - 1))},${120 - (val / 100) * 110}`).join(' ')} 400,120`}
                fill="url(#cpuGrad)"
              />

              {/* Line graph */}
              <polyline
                fill="none"
                stroke="#00f3ff"
                strokeWidth="2.5"
                points={cpuHistory.map((val, idx) => `${idx * (400 / (cpuHistory.length - 1))},${120 - (val / 100) * 110}`).join(' ')}
              />

              {/* Dots */}
              {cpuHistory.map((val, idx) => (
                <circle
                  key={idx}
                  cx={idx * (400 / (cpuHistory.length - 1))}
                  cy={120 - (val / 100) * 110}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#00f3ff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* System Settings & Actions */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            System Controls
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Theme:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => (
                <button
                  key={tId}
                  onClick={() => {
                    sound.playClick();
                    onThemeChange(tId);
                    applyTheme(tId);
                  }}
                  className={`btn-cyber ${currentTheme === tId ? 'btn-cyber-primary' : ''}`}
                  style={{ fontSize: '10px', padding: '4px' }}
                >
                  {THEMES[tId].name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={handleTestChime} className="btn-cyber" style={{ width: '100%', justifyContent: 'center' }}>
              <Volume2 size={13} />
              <span>Test Audio Chime</span>
            </button>

            <button onClick={handleResetVfs} className="btn-cyber" style={{ width: '100%', justifyContent: 'center', color: 'var(--error)', borderColor: 'rgba(255,0,85,0.3)' }}>
              <Trash2 size={13} />
              <span>Reset VFS Storage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Running Windows Process Table */}
      <div className="glass-panel" style={{ borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          RUNNING WINDOW PROCESSES
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {windows.map((w) => (
            <div
              key={w.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ color: '#ffffff' }}>{w.title}</span>
              <span style={{ color: 'var(--text-muted)' }}>Bounds: {w.width}x{w.height}</span>
              <span style={{ color: w.isMinimized ? 'var(--warning)' : 'var(--success)' }}>
                {w.isMinimized ? 'SUSPENDED' : 'RENDERING'}
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  wm.closeWindow(w.id);
                }}
                className="btn-cyber"
                style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--error)' }}
              >
                Kill
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
