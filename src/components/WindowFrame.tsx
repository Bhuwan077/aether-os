import React, { useRef, useState } from 'react';
import { WindowState, WindowId, SnapMode } from '../core/wm/types';
import { Minus, Square, X, Maximize2, Move } from 'lucide-react';

interface WindowFrameProps {
  window: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSnap: (mode: SnapMode) => void;
  onMove: (dx: number, dy: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  onMove,
  onResize,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number } | null>(null);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: string;
  } | null>(null);

  if (win.isMinimized) return null;

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || win.isMaximized) return;
    onFocus();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = { startX: e.clientX, startY: e.clientY };
  };

  const handleTitlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    dragStartRef.current = { startX: e.clientX, startY: e.clientY };
    onMove(dx, dy);
  };

  const handleTitlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if pointer capture lost
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent, direction: string) => {
    if (e.button !== 0 || win.isMaximized) return;
    e.stopPropagation();
    onFocus();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: win.width,
      startHeight: win.height,
      direction,
    };
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing || !resizeStartRef.current) return;
    const { startX, startY, startWidth, startHeight, direction } = resizeStartRef.current;
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction.includes('e')) {
      newWidth = startWidth + (e.clientX - startX);
    }
    if (direction.includes('s')) {
      newHeight = startHeight + (e.clientY - startY);
    }

    onResize(newWidth, newHeight);
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return;
    setIsResizing(false);
    resizeStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <div
      onPointerDown={onFocus}
      style={{
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: win.isMaximized ? 0 : '8px',
        overflow: 'hidden',
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      className={`glass-panel ${isActive ? 'glass-panel-active' : ''}`}
    >
      {/* Titlebar */}
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={onMaximize}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.35)',
          borderBottom: '1px solid var(--border-color)',
          cursor: win.isMaximized ? 'default' : 'move',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', filter: 'drop-shadow(0 0 4px var(--accent))' }}>⚡</span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.5px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {win.title}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSnap(win.snap === 'left' ? 'none' : 'left')}
            title="Snap Left"
            className="btn-cyber"
            style={{ padding: '2px 6px', fontSize: '11px', height: '22px' }}
          >
            ◧
          </button>
          <button
            onClick={() => onSnap(win.snap === 'right' ? 'none' : 'right')}
            title="Snap Right"
            className="btn-cyber"
            style={{ padding: '2px 6px', fontSize: '11px', height: '22px' }}
          >
            ◨
          </button>
          <button
            onClick={onMinimize}
            title="Minimize"
            className="btn-cyber"
            style={{ padding: '2px 6px', height: '22px' }}
          >
            <Minus size={12} />
          </button>
          <button
            onClick={onMaximize}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
            className="btn-cyber"
            style={{ padding: '2px 6px', height: '22px' }}
          >
            {win.isMaximized ? <Maximize2 size={12} /> : <Square size={11} />}
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="btn-cyber"
            style={{
              padding: '2px 6px',
              height: '22px',
              color: 'var(--error)',
              borderColor: 'rgba(255, 0, 85, 0.3)',
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(10, 10, 18, 0.7)',
        }}
      >
        {children}
      </div>

      {/* Resize Handles (only when not maximized) */}
      {!win.isMaximized && (
        <>
          <div
            className="resize-handle resize-handle-e"
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="resize-handle resize-handle-s"
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="resize-handle resize-handle-se"
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
        </>
      )}
    </div>
  );
};
