import { describe, it, expect, beforeEach } from 'vitest';
import { vfs } from '../../../core/vfs/vfs';

describe('FileFlow Data Operations', () => {
  beforeEach(() => {
    vfs.mkdir('/test_flow/nested', true);
    vfs.writeFile('/test_flow/document.md', '# Title\nSome content');
  });

  it('should list directory entries for FileFlow', () => {
    const entries = vfs.readDir('/test_flow');
    expect(entries.length).toBe(2);
    expect(entries.some((e) => e.name === 'nested' && e.type === 'directory')).toBe(true);
    expect(entries.some((e) => e.name === 'document.md' && e.type === 'file')).toBe(true);
  });

  it('should edit and update file contents', () => {
    const updated = '# Updated Title\nNew body';
    vfs.writeFile('/test_flow/document.md', updated);
    expect(vfs.readFile('/test_flow/document.md')).toBe(updated);
  });

  it('should delete file and reflect in directory listing', () => {
    vfs.rm('/test_flow/document.md');
    expect(vfs.exists('/test_flow/document.md')).toBe(false);
    const entries = vfs.readDir('/test_flow');
    expect(entries.length).toBe(1);
  });

  it('should handle nested breadcrumb paths', () => {
    const path = '/home/user/projects/react';
    const breadcrumbs = path.split('/').filter(Boolean);
    expect(breadcrumbs).toEqual(['home', 'user', 'projects', 'react']);
  });
});
