export type WindowId =
  | 'retroterm'
  | 'algopulse'
  | 'codecraft'
  | 'mindcanvas'
  | 'synthlab'
  | 'tasknexus'
  | 'sysmon'
  | 'welcome'
  | 'neural'
  | 'quantum'
  | 'shaders'
  | 'pixelart'
  | 'fileflow'
  | 'crypto'
  | 'sql'
  | 'physics'
  | 'sequencer';

export type SnapMode = 'none' | 'left' | 'right' | 'full';

export interface WindowState {
  id: WindowId;
  title: string;
  iconName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  snap: SnapMode;
  prevBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WindowOpenConfig {
  id: WindowId;
  title: string;
  iconName: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
}
