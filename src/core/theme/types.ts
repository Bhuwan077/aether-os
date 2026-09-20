export type ThemeId = 'cyberpunk' | 'obsidian' | 'nord' | 'matrix' | 'solarized';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  bgDark: string;
  bgSurface: string;
  bgSurfaceHover: string;
  borderColor: string;
  borderActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentGlow: string;
  success: string;
  warning: string;
  error: string;
  scanlines: boolean;
  wallpaperGradients: string;
}
