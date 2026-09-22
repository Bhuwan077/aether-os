import { ThemeColors, ThemeId } from './types';

export const THEMES: Record<ThemeId, ThemeColors> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bgDark: '#080811',
    bgSurface: 'rgba(18, 18, 32, 0.85)',
    bgSurfaceHover: 'rgba(28, 28, 48, 0.9)',
    borderColor: 'rgba(0, 243, 255, 0.25)',
    borderActive: 'rgba(255, 0, 128, 0.8)',
    textPrimary: '#e0f7fa',
    textSecondary: '#80deea',
    textMuted: '#4f727a',
    accent: '#00f3ff',
    accentHover: '#ff007f',
    accentGlow: '0 0 15px rgba(0, 243, 255, 0.6)',
    success: '#00ff88',
    warning: '#ffb700',
    error: '#ff0055',
    scanlines: true,
    wallpaperGradients: 'radial-gradient(ellipse at top, #1a0b2e 0%, #080811 70%)',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    bgDark: '#090a0f',
    bgSurface: 'rgba(17, 19, 26, 0.9)',
    bgSurfaceHover: 'rgba(26, 29, 40, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderActive: 'rgba(99, 102, 241, 0.8)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#475569',
    accent: '#6366f1',
    accentHover: '#818cf8',
    accentGlow: '0 0 15px rgba(99, 102, 241, 0.4)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    scanlines: false,
    wallpaperGradients: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #090a0f 80%)',
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    bgDark: '#242933',
    bgSurface: 'rgba(46, 52, 64, 0.88)',
    bgSurfaceHover: 'rgba(59, 66, 82, 0.92)',
    borderColor: 'rgba(136, 192, 208, 0.25)',
    borderActive: 'rgba(136, 192, 208, 0.9)',
    textPrimary: '#eceff4',
    textSecondary: '#d8dee9',
    textMuted: '#7b88a1',
    accent: '#88c0d0',
    accentHover: '#81a1c1',
    accentGlow: '0 0 15px rgba(136, 192, 208, 0.5)',
    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    scanlines: false,
    wallpaperGradients: 'radial-gradient(ellipse at bottom, #2e3440 0%, #1e222a 100%)',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Terminal',
    bgDark: '#050d06',
    bgSurface: 'rgba(10, 24, 12, 0.9)',
    bgSurfaceHover: 'rgba(16, 38, 20, 0.95)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderActive: 'rgba(34, 197, 94, 0.9)',
    textPrimary: '#4ade80',
    textSecondary: '#22c55e',
    textMuted: '#166534',
    accent: '#22c55e',
    accentHover: '#86efac',
    accentGlow: '0 0 15px rgba(34, 197, 94, 0.7)',
    success: '#4ade80',
    warning: '#eab308',
    error: '#f87171',
    scanlines: true,
    wallpaperGradients: 'radial-gradient(circle at 50% 50%, #0d2812 0%, #030a04 100%)',
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized Dark',
    bgDark: '#002b36',
    bgSurface: 'rgba(7, 54, 66, 0.9)',
    bgSurfaceHover: 'rgba(15, 68, 82, 0.95)',
    borderColor: 'rgba(42, 161, 152, 0.3)',
    borderActive: 'rgba(181, 137, 0, 0.9)',
    textPrimary: '#fdf6e3',
    textSecondary: '#93a1a1',
    textMuted: '#586e75',
    accent: '#2aa198',
    accentHover: '#268bd2',
    accentGlow: '0 0 15px rgba(42, 161, 152, 0.5)',
    success: '#859900',
    warning: '#b58900',
    error: '#dc322f',
    scanlines: false,
    wallpaperGradients: 'radial-gradient(ellipse at 50% 20%, #073642 0%, #001f27 100%)',
  },
  amber: {
    id: 'amber',
    name: 'Cyberpunk Amber',
    bgDark: '#0f0a05',
    bgSurface: 'rgba(32, 20, 10, 0.75)',
    bgSurfaceHover: 'rgba(48, 30, 15, 0.85)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderActive: 'rgba(251, 191, 36, 0.9)',
    textPrimary: '#fffbeb',
    textSecondary: '#fde68a',
    textMuted: '#92400e',
    accent: '#f59e0b',
    accentHover: '#fbbf24',
    accentGlow: '0 0 15px rgba(245, 158, 11, 0.5)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    scanlines: true,
    wallpaperGradients: 'radial-gradient(ellipse at 50% 20%, #2b1808 0%, #0a0502 100%)',
  },
};

export function applyTheme(themeId: ThemeId): void {
  const theme = THEMES[themeId] || THEMES.cyberpunk;
  const root = document.documentElement;

  root.style.setProperty('--bg-dark', theme.bgDark);
  root.style.setProperty('--bg-surface', theme.bgSurface);
  root.style.setProperty('--bg-surface-hover', theme.bgSurfaceHover);
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--border-active', theme.borderActive);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-hover', theme.accentHover);
  root.style.setProperty('--accent-glow', theme.accentGlow);
  root.style.setProperty('--success', theme.success);
  root.style.setProperty('--warning', theme.warning);
  root.style.setProperty('--error', theme.error);
  root.style.setProperty('--wallpaper-gradient', theme.wallpaperGradients);

  if (theme.scanlines) {
    document.body.classList.add('scanlines-enabled');
  } else {
    document.body.classList.remove('scanlines-enabled');
  }
}
