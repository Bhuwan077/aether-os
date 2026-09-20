import { describe, it, expect, beforeEach } from 'vitest';
import { WindowManager } from '../windowManager';

describe('WindowManager', () => {
  let wm: WindowManager;

  beforeEach(() => {
    wm = new WindowManager();
  });

  it('should open a new window with correct default geometry', () => {
    const win = wm.openWindow({
      id: 'retroterm',
      title: 'Terminal',
      iconName: 'terminal',
      width: 600,
      height: 400,
    });

    expect(win.id).toBe('retroterm');
    expect(win.title).toBe('Terminal');
    expect(win.width).toBe(600);
    expect(win.height).toBe(400);
    expect(win.isMinimized).toBe(false);
    expect(win.isMaximized).toBe(false);
    expect(wm.getActiveWindowId()).toBe('retroterm');
  });

  it('should focus window and update zIndex', () => {
    const win1 = wm.openWindow({ id: 'retroterm', title: 'Term', iconName: 'term' });
    const win2 = wm.openWindow({ id: 'algopulse', title: 'Algo', iconName: 'algo' });

    expect(wm.getActiveWindowId()).toBe('algopulse');
    expect(win2.zIndex).toBeGreaterThan(win1.zIndex);

    wm.focusWindow('retroterm');
    expect(wm.getActiveWindowId()).toBe('retroterm');
    expect(win1.zIndex).toBeGreaterThan(win2.zIndex);
  });

  it('should minimize window and elect next active window', () => {
    wm.openWindow({ id: 'retroterm', title: 'Term', iconName: 'term' });
    wm.openWindow({ id: 'algopulse', title: 'Algo', iconName: 'algo' });

    wm.minimizeWindow('algopulse');
    const algoWin = wm.getWindow('algopulse');
    expect(algoWin?.isMinimized).toBe(true);
    expect(wm.getActiveWindowId()).toBe('retroterm');
  });

  it('should maximize and restore window coordinates', () => {
    const initialWidth = 500;
    const initialHeight = 350;
    const win = wm.openWindow({
      id: 'codecraft',
      title: 'CodeCraft',
      iconName: 'code',
      width: initialWidth,
      height: initialHeight,
    });

    wm.maximizeWindow('codecraft', { width: 1920, height: 1080 });
    expect(win.isMaximized).toBe(true);
    expect(win.width).toBe(1920);
    expect(win.height).toBe(1080 - 48);

    // Restore
    wm.maximizeWindow('codecraft');
    expect(win.isMaximized).toBe(false);
    expect(win.width).toBe(initialWidth);
    expect(win.height).toBe(initialHeight);
  });

  it('should snap window left and right with correct split widths', () => {
    const win = wm.openWindow({
      id: 'synthlab',
      title: 'Synth',
      iconName: 'audio',
      width: 600,
      height: 400,
    });

    const screenW = 1200;
    const screenH = 800;

    wm.snapWindow('synthlab', 'left', screenW, screenH);
    expect(win.snap).toBe('left');
    expect(win.x).toBe(0);
    expect(win.width).toBe(600);

    wm.snapWindow('synthlab', 'right', screenW, screenH);
    expect(win.snap).toBe('right');
    expect(win.x).toBe(600);
    expect(win.width).toBe(600);
  });

  it('should close window and clean up active ID', () => {
    wm.openWindow({ id: 'tasknexus', title: 'Tasks', iconName: 'tasks' });
    expect(wm.getAllWindows().length).toBe(1);

    wm.closeWindow('tasknexus');
    expect(wm.getAllWindows().length).toBe(0);
    expect(wm.getActiveWindowId()).toBeNull();
  });
});
