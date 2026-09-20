import React, { useState } from 'react';
import { Terminal, Cpu, Code, Music, Share2, CheckSquare, Activity, LucideIcon } from 'lucide-react';
import { WindowId } from '../core/wm/types';
import { sound } from '../core/audio/soundEngine';

export interface DockItem {
  id: WindowId;
  label: string;
  icon: LucideIcon;
  shortcut: string;
}

export const DOCK_ITEMS: DockItem[] = [
  { id: 'retroterm', label: 'RetroTerm', icon: Terminal, shortcut: 'T' },
  { id: 'algopulse', label: 'AlgoPulse', icon: Cpu, shortcut: 'A' },
  { id: 'codecraft', label: 'CodeCraft', icon: Code, shortcut: 'C' },
  { id: 'mindcanvas', label: 'MindCanvas', icon: Share2, shortcut: 'M' },
  { id: 'synthlab', label: 'SynthLab', icon: Music, shortcut: 'S' },
  { id: 'tasknexus', label: 'TaskNexus', icon: CheckSquare, shortcut: 'K' },
  { id: 'sysmon', label: 'System Monitor', icon: Activity, shortcut: 'P' },
];

interface DockProps {
  runningAppIds: WindowId[];
  onLaunch: (id: WindowId) => void;
}

export const Dock: React.FC<DockProps> = ({ runningAppIds, onLaunch }) => {
  const [hoveredId, setHoveredId] = useState<WindowId | null>(null);

  const handleClick = (id: WindowId) => {
    sound.playClick();
    onLaunch(id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '56px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '16px',
        backgroundColor: 'rgba(15, 15, 28, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 243, 255, 0.1)',
        zIndex: 8000,
        transition: 'all 0.3s ease',
      }}
    >
      {DOCK_ITEMS.map((item) => {
        const Icon = item.icon;
        const isRunning = runningAppIds.includes(item.id);
        const isHovered = hoveredId === item.id;

        return (
          <div
            key={item.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '52px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(8, 8, 16, 0.95)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  zIndex: 9999,
                }}
              >
                {item.label}
              </div>
            )}

            <button
              onClick={() => handleClick(item.id)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: isHovered ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isHovered
                  ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.3), rgba(255, 0, 128, 0.3))'
                  : 'rgba(255, 255, 255, 0.05)',
                color: isHovered ? '#ffffff' : 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: isHovered ? 'translateY(-6px) scale(1.15)' : 'translateY(0) scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isHovered ? '0 8px 16px rgba(0, 243, 255, 0.3)' : 'none',
              }}
              title={item.label}
            >
              <Icon size={20} />
              {/* Running Dot Indicator */}
              {isRunning && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    boxShadow: '0 0 6px var(--accent)',
                  }}
                />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};
