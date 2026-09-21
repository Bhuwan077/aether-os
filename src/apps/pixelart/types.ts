export type PixelTool = 'pencil' | 'eraser' | 'bucket' | 'dropper';

export interface PixelFrame {
  id: string;
  pixels: string[][]; // 2D hex colors
}

export const CYBER_PALETTE: string[] = [
  '#000000',
  '#ffffff',
  '#00f3ff', // cyan
  '#ff007f', // magenta
  '#ffe600', // yellow
  '#00ff66', // green
  '#a855f7', // purple
  '#ff5500', // orange
  '#1e293b', // dark slate
  '#64748b', // light slate
  '#ef4444', // red
  '#3b82f6', // blue
];
