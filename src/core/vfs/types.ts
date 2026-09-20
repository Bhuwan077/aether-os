export type VFSNodeType = 'file' | 'directory';

export interface VFSMetadata {
  createdAt: number;
  modifiedAt: number;
  readonly?: boolean;
  tags?: string[];
}

export interface VFSFileNode {
  type: 'file';
  name: string;
  path: string;
  content: string;
  size: number;
  mimeType: string;
  metadata: VFSMetadata;
}

export interface VFSDirectoryNode {
  type: 'directory';
  name: string;
  path: string;
  children: Record<string, VFSNode>;
  metadata: VFSMetadata;
}

export type VFSNode = VFSFileNode | VFSDirectoryNode;

export interface VFSStat {
  name: string;
  path: string;
  type: VFSNodeType;
  size: number;
  modifiedAt: number;
  createdAt: number;
  isDirectory: boolean;
  isFile: boolean;
  childrenCount?: number;
}
