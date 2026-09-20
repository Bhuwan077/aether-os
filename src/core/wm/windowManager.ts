import { WindowId, WindowOpenConfig, WindowState, SnapMode } from './types';
import { sound } from '../audio/soundEngine';

export class WindowManager {
  private windows: Map<WindowId, WindowState> = new Map();
  private activeWindowId: WindowId | null = null;
  private nextZIndex = 10;
  private listeners: Set<(windows: WindowState[], activeId: WindowId | null) => void> = new Set();

  public subscribe(listener: (windows: WindowState[], activeId: WindowId | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.getAllWindows(), this.activeWindowId);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    const wins = this.getAllWindows();
    for (const fn of this.listeners) {
      fn(wins, this.activeWindowId);
    }
  }

  public getAllWindows(): WindowState[] {
    return Array.from(this.windows.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  public getWindow(id: WindowId): WindowState | undefined {
    return this.windows.get(id);
  }

  public getActiveWindowId(): WindowId | null {
    return this.activeWindowId;
  }

  public openWindow(config: WindowOpenConfig): WindowState {
    const existing = this.windows.get(config.id);
    if (existing) {
      if (existing.isMinimized) {
        existing.isMinimized = false;
      }
      this.focusWindow(config.id);
      sound.playOpen();
      return existing;
    }

    // Default positioning with slight offset cascade
    const count = this.windows.size;
    const defaultX = 80 + (count % 8) * 30;
    const defaultY = 60 + (count % 8) * 30;

    const newWin: WindowState = {
      id: config.id,
      title: config.title,
      iconName: config.iconName,
      x: config.x ?? defaultX,
      y: config.y ?? defaultY,
      width: config.width ?? 720,
      height: config.height ?? 500,
      minWidth: config.minWidth ?? 360,
      minHeight: config.minHeight ?? 260,
      isMinimized: false,
      isMaximized: false,
      zIndex: ++this.nextZIndex,
      snap: 'none',
    };

    this.windows.set(config.id, newWin);
    this.activeWindowId = config.id;
    sound.playOpen();
    this.emit();
    return newWin;
  }

  public closeWindow(id: WindowId): void {
    if (this.windows.delete(id)) {
      sound.playClose();
      if (this.activeWindowId === id) {
        const remaining = this.getAllWindows().filter((w) => !w.isMinimized);
        if (remaining.length > 0) {
          const topWin = remaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev));
          this.activeWindowId = topWin.id;
        } else {
          this.activeWindowId = null;
        }
      }
      this.emit();
    }
  }

  public focusWindow(id: WindowId): void {
    const win = this.windows.get(id);
    if (!win) return;

    if (this.activeWindowId !== id || win.isMinimized) {
      win.isMinimized = false;
      win.zIndex = ++this.nextZIndex;
      this.activeWindowId = id;
      this.emit();
    }
  }

  public minimizeWindow(id: WindowId): void {
    const win = this.windows.get(id);
    if (!win) return;

    win.isMinimized = true;
    sound.playClick();
    if (this.activeWindowId === id) {
      const remaining = this.getAllWindows().filter((w) => !w.isMinimized);
      if (remaining.length > 0) {
        const topWin = remaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev));
        this.activeWindowId = topWin.id;
      } else {
        this.activeWindowId = null;
      }
    }
    this.emit();
  }

  public maximizeWindow(id: WindowId, bounds?: { width: number; height: number }): void {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.isMaximized) {
      // Restore
      if (win.prevBounds) {
        win.x = win.prevBounds.x;
        win.y = win.prevBounds.y;
        win.width = win.prevBounds.width;
        win.height = win.prevBounds.height;
      }
      win.isMaximized = false;
      win.snap = 'none';
    } else {
      // Maximize
      win.prevBounds = { x: win.x, y: win.y, width: win.width, height: win.height };
      win.x = 0;
      win.y = 0;
      win.width = bounds?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 1280);
      win.height = (bounds?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 800)) - 48; // minus dock/taskbar
      win.isMaximized = true;
      win.snap = 'full';
    }

    sound.playClick();
    this.focusWindow(id);
  }

  public snapWindow(id: WindowId, mode: SnapMode, screenWidth: number, screenHeight: number): void {
    const win = this.windows.get(id);
    if (!win) return;

    const usableHeight = screenHeight - 48;

    if (mode === 'none') {
      if (win.prevBounds) {
        win.x = win.prevBounds.x;
        win.y = win.prevBounds.y;
        win.width = win.prevBounds.width;
        win.height = win.prevBounds.height;
      }
      win.snap = 'none';
      win.isMaximized = false;
    } else if (mode === 'left') {
      win.prevBounds = { x: win.x, y: win.y, width: win.width, height: win.height };
      win.x = 0;
      win.y = 0;
      win.width = Math.floor(screenWidth / 2);
      win.height = usableHeight;
      win.snap = 'left';
      win.isMaximized = false;
    } else if (mode === 'right') {
      win.prevBounds = { x: win.x, y: win.y, width: win.width, height: win.height };
      win.x = Math.floor(screenWidth / 2);
      win.y = 0;
      win.width = Math.floor(screenWidth / 2);
      win.height = usableHeight;
      win.snap = 'right';
      win.isMaximized = false;
    } else if (mode === 'full') {
      this.maximizeWindow(id, { width: screenWidth, height: screenHeight });
      return;
    }

    this.focusWindow(id);
  }

  public moveWindow(id: WindowId, dx: number, dy: number): void {
    const win = this.windows.get(id);
    if (!win || win.isMaximized) return;

    win.x = Math.max(0, win.x + dx);
    win.y = Math.max(0, win.y + dy);
    this.emit();
  }

  public resizeWindow(id: WindowId, newWidth: number, newHeight: number): void {
    const win = this.windows.get(id);
    if (!win || win.isMaximized) return;

    win.width = Math.max(win.minWidth, newWidth);
    win.height = Math.max(win.minHeight, newHeight);
    this.emit();
  }
}

export const wm = new WindowManager();
