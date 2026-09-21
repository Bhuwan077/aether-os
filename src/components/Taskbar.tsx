import React from 'react';
import { WindowState, WindowId } from '../core/wm/types';
import { SystemTray } from './SystemTray';
import { ThemeId } from '../core/theme/types';
import { Terminal, Cpu, Code, Music, Share2, CheckSquare, Sparkles } from 'lucide-react';
import { sound } from '../core/audio/soundEngine';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: WindowId | null;
  onFocusWindow: (id: WindowId) => void;
  onMinimizeWindow: (id: WindowId) => void;
  onOpenAppLauncher: () => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onOpenSysMon: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onFocusWindow,
  onMinimizeWindow,
  onOpenAppLauncher,
  currentTheme,
  onThemeChange,
  onOpenSysMon,
}) => {
  const getAppIcon = (id: WindowId) => {
    switch (id) {
      case 'retroterm': return <Terminal size={14} />;
      case 'algopulse': return <Cpu size={14} />;
      case 'neural': return <Activity size={14} />;
      case 'quantum': return <Sparkles size={14} />;
      case 'shaders': return <Sparkles size={14} />;
      case 'codecraft': return <Code size={14} />;
      case 'fileflow': return <Folder size={14} />;
      case 'mindcanvas': return <Share2 size={14} />;
      case 'synthlab': return <Music size={14} />;
      case 'tasknexus': return <CheckSquare size={14} />;
      case 'pixelart': return <Palette size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const handleTaskClick = (win: WindowState) => {
    sound.playClick();
    if (activeWindowId === win.id && !win.isMinimized) {
      onMinimizeWindow(win.id);
    } else {
      onFocusWindow(win.id);
    }
  };

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        backgroundColor: 'rgba(8, 8, 17, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 9000,
      }}
    >
      {/* Left: Start / Command Palette Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => {
            sound.playClick();
            onOpenAppLauncher();
          }}
          className="btn-cyber btn-cyber-primary"
          style={{ height: '32px', padding: '0 12px', gap: '8px' }}
          title="Open Launcher / Command Palette (Ctrl+K)"
        >
          <Sparkles size={16} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '1px' }}>
            AETHER
          </span>
        </button>

        {/* Running Windows Task Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
          {windows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => handleTaskClick(win)}
                className={`btn-cyber ${isActive ? 'btn-cyber-primary' : ''}`}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  opacity: win.isMinimized ? 0.6 : 1,
                  borderBottom: isActive ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                }}
                title={win.title}
              >
                {getAppIcon(win.id)}
                <span
                  style={{
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                  }}
                >
                  {win.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: System Tray */}
      <SystemTray
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        onOpenSysMon={onOpenSysMon}
      />
    </footer>
  );
};
