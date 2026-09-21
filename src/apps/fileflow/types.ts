import { VFSNode } from '../../core/vfs/types';

export type FileViewMode = 'grid' | 'list';

export interface FileFlowState {
  currentPath: string;
  selectedNode: VFSNode | null;
  viewMode: FileViewMode;
  searchQuery: string;
  isEditing: boolean;
  editContent: string;
}
