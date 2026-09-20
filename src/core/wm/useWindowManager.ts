import { useState, useEffect } from 'react';
import { wm } from './windowManager';
import { WindowState, WindowId } from './types';

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>(wm.getAllWindows());
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>(wm.getActiveWindowId());

  useEffect(() => {
    const unsub = wm.subscribe((updatedWindows, currentActive) => {
      setWindows([...updatedWindows]);
      setActiveWindowId(currentActive);
    });
    return unsub;
  }, []);

  return {
    windows,
    activeWindowId,
    openWindow: wm.openWindow.bind(wm),
    closeWindow: wm.closeWindow.bind(wm),
    focusWindow: wm.focusWindow.bind(wm),
    minimizeWindow: wm.minimizeWindow.bind(wm),
    maximizeWindow: wm.maximizeWindow.bind(wm),
    snapWindow: wm.snapWindow.bind(wm),
    moveWindow: wm.moveWindow.bind(wm),
    resizeWindow: wm.resizeWindow.bind(wm),
  };
}
