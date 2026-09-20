import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Palette, Activity, ShieldCheck } from 'lucide-react';
import { sound } from '../core/audio/soundEngine';
import { ThemeId } from '../core/theme/types';
import { THEMES, applyTheme } from '../core/theme/themes';

interface SystemTrayProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onOpenSysMon: () => void;
}

export const SystemTray: React.FC<SystemTrayProps> = ({ currentTheme, onThemeChange, onOpenSysMon }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simple FPS monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measure);
    };
    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
      {/* Theme Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            sound.playClick();
            setThemeMenuOpen(!themeMenuOpen);
          }}
          className="btn-cyber"
          title="Switch Color Theme"
          style={{ padding: '4px 8px', height: '28px' }}
        >
          <Palette size={14} />
          <span style={{ fontSize: '11px', textTransform: 'capitalize' }}>{currentTheme}</span>
        </button>

        {themeMenuOpen && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '36px',
              right: '0',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '150px',
              zIndex: 9999,
            }}
          >
            {(Object.keys(THEMES) as ThemeId[]).map((tId) => (
              <button
                key={tId}
                onClick={() => {
                  onThemeChange(tId);
                  applyTheme(tId);
                  setThemeMenuOpen(false);
                  sound.playClick();
                }}
                className="btn-cyber"
                style={{
                  justifyContent: 'flex-start',
                  fontSize: '11px',
                  background: currentTheme === tId ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: THEMES[tId].accent,
                  }}
                />
                {THEMES[tId].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Mute Toggle */}
      <button
        onClick={handleToggleAudio}
        className="btn-cyber"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        style={{ padding: '4px 8px', height: '28px' }}
      >
        {isMuted ? <VolumeX size={14} color="var(--error)" /> : <Volume2 size={14} color="var(--accent)" />}
      </button>

      {/* FPS Performance Indicator */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenSysMon();
        }}
        className="btn-cyber"
        title="FPS / System Performance"
        style={{ padding: '4px 8px', height: '28px', gap: '4px' }}
      >
        <Activity size={13} color="var(--success)" />
        <span style={{ fontSize: '11px', color: 'var(--success)' }}>{fps} FPS</span>
      </button>

      {/* Security Status */}
      <div title="Quantum Kernel Sandbox Active" style={{ display: 'flex', alignItems: 'center' }}>
        <ShieldCheck size={14} color="var(--accent)" />
      </div>

      {/* Clock */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          lineHeight: '1.1',
          paddingLeft: '4px',
          borderLeft: '1px solid var(--border-color)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{timeStr}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dateStr}</span>
      </div>
    </div>
  );
};
