import { describe, it, expect } from 'vitest';
import { THEMES } from '../themes';
import { ThemeId } from '../types';

describe('Theme System', () => {
  const themeIds: ThemeId[] = ['cyberpunk', 'obsidian', 'nord', 'matrix', 'solarized'];

  it('should have all predefined themes configured', () => {
    themeIds.forEach((id) => {
      expect(THEMES[id]).toBeDefined();
      expect(THEMES[id].name).toBeTruthy();
      expect(THEMES[id].bgDark).toBeTruthy();
      expect(THEMES[id].accent).toBeTruthy();
      expect(THEMES[id].borderColor).toBeTruthy();
    });
  });

  it('should have valid hex or rgba color properties in Cyberpunk theme', () => {
    const cp = THEMES.cyberpunk;
    expect(cp.bgDark).toMatch(/^#/);
    expect(cp.accent).toMatch(/^#/);
    expect(cp.scanlines).toBe(true);
  });
});
