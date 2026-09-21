import React, { useState, useEffect } from 'react';
import { notificationManager, SystemNotification } from '../core/notify/notificationManager';
import { sound } from '../core/audio/soundEngine';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    return notificationManager.subscribe((list) => {
      setNotifications(list);
    });
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {notifications.map((n) => {
        let borderColor = 'var(--accent)';
        let Icon = Info;
        if (n.type === 'success') {
          borderColor = 'var(--success)';
          Icon = CheckCircle;
        } else if (n.type === 'warning') {
          borderColor = 'var(--warning)';
          Icon = AlertTriangle;
        } else if (n.type === 'error') {
          borderColor = 'var(--error)';
          Icon = AlertCircle;
        }

        return (
          <div
            key={n.id}
            className="glass-panel"
            style={{
              width: '300px',
              padding: '10px 12px',
              borderRadius: '8px',
              borderLeft: `4px solid ${borderColor}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              pointerEvents: 'auto',
              backgroundColor: 'rgba(8, 9, 18, 0.95)',
              animation: 'fade-in 0.2s ease-out',
            }}
          >
            <Icon size={16} color={borderColor} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {n.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-word', lineHeight: '1.3' }}>
                {n.message}
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                notificationManager.dismiss(n.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
