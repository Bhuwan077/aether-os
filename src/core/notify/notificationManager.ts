import { sound } from '../audio/soundEngine';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

export class NotificationManager {
  private notifications: SystemNotification[] = [];
  private listeners: Set<(notifications: SystemNotification[]) => void> = new Set();

  public subscribe(fn: (notifications: SystemNotification[]) => void): () => void {
    this.listeners.add(fn);
    fn([...this.notifications]);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(): void {
    const copy = [...this.notifications];
    for (const fn of this.listeners) {
      fn(copy);
    }
  }

  public notify(title: string, message: string, type: NotificationType = 'info'): string {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const notif: SystemNotification = {
      id,
      title,
      message,
      type,
      timestamp: Date.now(),
    };

    this.notifications.unshift(notif);
    // Limit to latest 5
    if (this.notifications.length > 5) {
      this.notifications.pop();
    }

    if (type === 'success') sound.playSuccess();
    else if (type === 'error') sound.playError();
    else sound.playNotification();

    this.emit();

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      this.dismiss(id);
    }, 4000);

    return id;
  }

  public dismiss(id: string): void {
    const initialLen = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    if (this.notifications.length !== initialLen) {
      this.emit();
    }
  }

  public clearAll(): void {
    this.notifications = [];
    this.emit();
  }
}

export const notificationManager = new NotificationManager();
