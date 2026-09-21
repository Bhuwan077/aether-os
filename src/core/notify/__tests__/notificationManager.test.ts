import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationManager } from '../notificationManager';

describe('NotificationManager', () => {
  let nm: NotificationManager;

  beforeEach(() => {
    nm = new NotificationManager();
  });

  it('should dispatch notifications and notify subscribers', () => {
    let received: any[] = [];
    nm.subscribe((list) => {
      received = list;
    });

    const id = nm.notify('System Kernel', 'Quantum module loaded', 'info');
    expect(received.length).toBe(1);
    expect(received[0].id).toBe(id);
    expect(received[0].title).toBe('System Kernel');
    expect(received[0].type).toBe('info');
  });

  it('should dismiss individual notifications', () => {
    let received: any[] = [];
    nm.subscribe((list) => {
      received = list;
    });

    const id = nm.notify('Test Alert', 'Will dismiss', 'warning');
    expect(received.length).toBe(1);

    nm.dismiss(id);
    expect(received.length).toBe(0);
  });
});
