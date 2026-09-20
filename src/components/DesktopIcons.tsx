import React from 'react';
import { WindowId } from '../core/wm/types';
import { DOCK_ITEMS } from './Dock';
import { HelpCircle } from 'lucide-react';
import { sound } from '../core/audio/soundEngine';

interface DesktopIconsProps {
  onLaunch: (id: WindowId) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onLaunch }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 5,
      }}
    >
      {/* Welcome Icon */}
      <button
        onClick={() => {
          sound.playClick();
          onLaunch('welcome');
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          width: '74px',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          transition: 'background 0.2s',
        }}
        className="btn-desktop-icon"
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 243, 255, 0.15)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <HelpCircle size={24} />
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          README.md
        </span>
      </button>

      {/* App Icons on Desktop */}
      {DOCK_ITEMS.slice(0, 5).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              sound.playClick();
              onLaunch(item.id);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              width: '74px',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Icon size={22} />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
