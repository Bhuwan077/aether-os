import React, { useState, useEffect } from 'react';
import { useWindowManager } from './core/wm/useWindowManager';
import { WindowId, SnapMode } from './core/wm/types';
import { WindowFrame } from './components/WindowFrame';
import { Taskbar } from './components/Taskbar';
import { Dock } from './components/Dock';
import { DesktopIcons } from './components/DesktopIcons';
import { CommandPalette } from './components/CommandPalette';
import { ThemeId } from './core/theme/types';
import { applyTheme } from './core/theme/themes';

// Built-in Apps
import { WelcomeApp } from './apps/welcome/WelcomeApp';
import { RetroTerm } from './apps/terminal/RetroTerm';
import { AlgoPulse } from './apps/algopulse/AlgoPulse';
import { CodeCraft } from './apps/codecraft/CodeCraft';
import { MindCanvas } from './apps/mindcanvas/MindCanvas';
import { SynthLab } from './apps/synthlab/SynthLab';
import { TaskNexus } from './apps/tasknexus/TaskNexus';
import { SysMon } from './apps/sysmon/SysMon';

export const App: React.FC = () => {
  const {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    snapWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager();

  const [currentTheme, setCurrentTheme] = useState<ThemeId>('cyberpunk');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Initialize theme and initial default windows
  useEffect(() => {
    applyTheme(currentTheme);

    // Initial desktop bootup windows
    openWindow({
      id: 'welcome',
      title: 'AetherOS User Guide & Architecture',
      iconName: 'sparkles',
      width: 820,
      height: 520,
      x: 120,
      y: 70,
    });

    setTimeout(() => {
      openWindow({
        id: 'retroterm',
        title: 'RetroTerm — aether-sh',
        iconName: 'terminal',
        width: 680,
        height: 420,
        x: 200,
        y: 130,
      });
    }, 150);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const launchApp = (id: WindowId) => {
    switch (id) {
      case 'welcome':
        openWindow({ id: 'welcome', title: 'AetherOS User Guide & Architecture', iconName: 'sparkles', width: 800, height: 500 });
        break;
      case 'retroterm':
        openWindow({ id: 'retroterm', title: 'RetroTerm — aether-sh', iconName: 'terminal', width: 700, height: 440 });
        break;
      case 'algopulse':
        openWindow({ id: 'algopulse', title: 'AlgoPulse — Algorithm Studio', iconName: 'cpu', width: 840, height: 540 });
        break;
      case 'codecraft':
        openWindow({ id: 'codecraft', title: 'CodeCraft — JavaScript Sandbox', iconName: 'code', width: 840, height: 540 });
        break;
      case 'mindcanvas':
        openWindow({ id: 'mindcanvas', title: 'MindCanvas — Force Graph', iconName: 'share', width: 820, height: 520 });
        break;
      case 'synthlab':
        openWindow({ id: 'synthlab', title: 'SynthLab — Audio Synthesizer', iconName: 'music', width: 760, height: 480 });
        break;
      case 'tasknexus':
        openWindow({ id: 'tasknexus', title: 'TaskNexus — Kanban & Pomodoro', iconName: 'check', width: 840, height: 540 });
        break;
      case 'sysmon':
        openWindow({ id: 'sysmon', title: 'System Monitor & Telemetry', iconName: 'activity', width: 780, height: 520 });
        break;
    }
  };

  const renderAppContent = (winId: WindowId) => {
    switch (winId) {
      case 'welcome':
        return <WelcomeApp onLaunchApp={launchApp} />;
      case 'retroterm':
        return <RetroTerm />;
      case 'algopulse':
        return <AlgoPulse />;
      case 'codecraft':
        return <CodeCraft />;
      case 'mindcanvas':
        return <MindCanvas />;
      case 'synthlab':
        return <SynthLab />;
      case 'tasknexus':
        return <TaskNexus />;
      case 'sysmon':
        return <SysMon currentTheme={currentTheme} onThemeChange={setCurrentTheme} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--wallpaper-gradient)',
        backgroundColor: 'var(--bg-dark)',
      }}
    >
      {/* Subtle Background Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 243, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          right: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 0, 128, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Desktop Short-cut Icons */}
      <DesktopIcons onLaunch={launchApp} />

      {/* Windows Manager Layer */}
      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          window={win}
          isActive={activeWindowId === win.id}
          onFocus={() => focusWindow(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          onSnap={(mode: SnapMode) => snapWindow(win.id, mode, window.innerWidth, window.innerHeight)}
          onMove={(dx, dy) => moveWindow(win.id, dx, dy)}
          onResize={(w, h) => resizeWindow(win.id, w, h)}
        >
          {renderAppContent(win.id)}
        </WindowFrame>
      ))}

      {/* Floating Bottom Dock */}
      <Dock
        runningAppIds={windows.filter((w) => !w.isMinimized).map((w) => w.id)}
        onLaunch={launchApp}
      />

      {/* Persistent Bottom Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onFocusWindow={focusWindow}
        onMinimizeWindow={minimizeWindow}
        onOpenAppLauncher={() => setIsPaletteOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        onOpenSysMon={() => launchApp('sysmon')}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onLaunchApp={launchApp}
        onThemeChange={setCurrentTheme}
      />
    </div>
  );
};

export default App;
