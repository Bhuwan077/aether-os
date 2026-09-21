import React, { useState, useEffect } from 'react';
import { vfs } from '../../core/vfs/vfs';
import { VFSNode } from '../../core/vfs/types';
import { sound } from '../../core/audio/soundEngine';
import { FileViewMode } from './types';
import {
  Folder,
  FileText,
  FileCode,
  HardDrive,
  Home,
  Monitor,
  FolderPlus,
  FilePlus,
  Trash2,
  Save,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowUp,
} from 'lucide-react';

const SIDEBAR_BOOKMARKS = [
  { label: 'Root (/)', path: '/', icon: HardDrive },
  { label: 'Home', path: '/home/user', icon: Home },
  { label: 'Desktop', path: '/home/user/desktop', icon: Monitor },
  { label: 'Projects', path: '/home/user/projects', icon: FileCode },
  { label: 'Notes', path: '/home/user/notes', icon: FileText },
  { label: 'System (/etc)', path: '/etc', icon: Folder },
];

export const FileFlow: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/home/user');
  const [entries, setEntries] = useState<VFSNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VFSNode | null>(null);
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState<'file' | 'folder' | null>(null);

  const loadDirectory = (path: string) => {
    try {
      const items = vfs.readDir(path);
      setEntries(items);
      setCurrentPath(path);
      setSelectedNode(null);
      setIsEditing(false);
    } catch {
      sound.playError();
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
    const unsub = vfs.subscribe(() => {
      try {
        setEntries(vfs.readDir(currentPath));
      } catch {
        // Ignored
      }
    });
    return unsub;
  }, [currentPath]);

  const handleSelectNode = (node: VFSNode) => {
    sound.playClick();
    setSelectedNode(node);
    if (node.type === 'file') {
      setEditContent(node.content);
      setIsEditing(false);
    }
  };

  const handleDoubleClick = (node: VFSNode) => {
    if (node.type === 'directory') {
      sound.playOpen();
      loadDirectory(node.path);
    } else {
      sound.playClick();
      setIsEditing(true);
    }
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    sound.playClick();
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const parent = '/' + parts.join('/');
    loadDirectory(parent || '/');
  };

  const handleSaveEdit = () => {
    if (!selectedNode || selectedNode.type !== 'file') return;
    try {
      vfs.writeFile(selectedNode.path, editContent);
      sound.playSuccess();
      setIsEditing(false);
      setSelectedNode({ ...selectedNode, content: editContent, size: editContent.length });
    } catch {
      sound.playError();
    }
  };

  const handleDelete = (node: VFSNode) => {
    sound.playClick();
    if (window.confirm(`Delete ${node.name}?`)) {
      try {
        vfs.rm(node.path, true);
        sound.playSuccess();
        setSelectedNode(null);
        setIsEditing(false);
        loadDirectory(currentPath);
      } catch {
        sound.playError();
      }
    }
  };

  const handleCreateNew = () => {
    if (showCreateModal === 'folder' && newFolderName.trim()) {
      vfs.mkdir(`${currentPath}/${newFolderName.trim()}`, true);
      sound.playSuccess();
      setNewFolderName('');
      setShowCreateModal(null);
      loadDirectory(currentPath);
    } else if (showCreateModal === 'file' && newFileName.trim()) {
      vfs.writeFile(`${currentPath}/${newFileName.trim()}`, '');
      sound.playSuccess();
      setNewFileName('');
      setShowCreateModal(null);
      loadDirectory(currentPath);
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: 'rgba(6, 7, 14, 0.95)', color: '#e0f7fa' }}>
      {/* Left Bookmarks Sidebar */}
      <div
        className="glass-panel"
        style={{
          width: '180px',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 8px',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingLeft: '8px', marginBottom: '4px' }}>
          FAVORITES
        </span>
        {SIDEBAR_BOOKMARKS.map((b) => {
          const Icon = b.icon;
          const isActive = currentPath === b.path;
          return (
            <button
              key={b.path}
              onClick={() => {
                sound.playClick();
                loadDirectory(b.path);
              }}
              className="btn-cyber"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                backgroundColor: isActive ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
                borderColor: isActive ? 'var(--accent)' : 'transparent',
                fontSize: '11px',
                padding: '6px 8px',
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent)' : 'var(--text-secondary)'} />
              <span style={{ color: isActive ? '#ffffff' : 'var(--text-primary)' }}>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Navigation & Toolbar Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {/* Breadcrumb path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <button
              onClick={handleGoUp}
              disabled={currentPath === '/'}
              className="btn-cyber"
              style={{ padding: '2px 6px', height: '24px' }}
              title="Go to parent directory"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => loadDirectory('/')}
              className="btn-cyber"
              style={{ padding: '2px 6px', height: '24px' }}
            >
              root
            </button>
            {breadcrumbs.map((crumb, idx) => {
              const crumbPath = '/' + breadcrumbs.slice(0, idx + 1).join('/');
              return (
                <React.Fragment key={crumbPath}>
                  <ChevronRight size={12} color="var(--text-muted)" />
                  <button
                    onClick={() => loadDirectory(crumbPath)}
                    className="btn-cyber"
                    style={{ padding: '2px 6px', height: '24px' }}
                  >
                    {crumb}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Search and Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '4px', border: '1px solid var(--border-color)', padding: '2px 8px' }}>
              <Search size={12} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '11px', fontFamily: 'var(--font-mono)', paddingLeft: '6px', width: '100px' }}
              />
            </div>

            <button onClick={() => setShowCreateModal('file')} className="btn-cyber" style={{ padding: '3px 8px' }} title="Create File">
              <FilePlus size={13} />
            </button>

            <button onClick={() => setShowCreateModal('folder')} className="btn-cyber" style={{ padding: '3px 8px' }} title="Create Folder">
              <FolderPlus size={13} />
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn-cyber"
              style={{ padding: '3px 8px' }}
              title="Toggle View Mode"
            >
              {viewMode === 'grid' ? <List size={13} /> : <LayoutGrid size={13} />}
            </button>
          </div>
        </div>

        {/* Create Inline Modal */}
        {showCreateModal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(0, 243, 255, 0.1)', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              Create {showCreateModal === 'folder' ? 'Folder' : 'File'}:
            </span>
            <input
              type="text"
              autoFocus
              placeholder={showCreateModal === 'folder' ? 'folder_name' : 'filename.txt'}
              value={showCreateModal === 'folder' ? newFolderName : newFileName}
              onChange={(e) => showCreateModal === 'folder' ? setNewFolderName(e.target.value) : setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--accent)', background: '#090a14', color: '#fff', fontSize: '11px', fontFamily: 'var(--font-mono)', outline: 'none' }}
            />
            <button onClick={handleCreateNew} className="btn-cyber btn-cyber-primary" style={{ padding: '2px 8px', fontSize: '11px' }}>Create</button>
            <button onClick={() => setShowCreateModal(null)} className="btn-cyber" style={{ padding: '2px 8px', fontSize: '11px' }}>Cancel</button>
          </div>
        )}

        {/* Files Grid / List + Inspector View */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Files Display */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
            {filteredEntries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Empty Directory
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                {filteredEntries.map((node) => {
                  const isSelected = selectedNode?.path === node.path;
                  const isDir = node.type === 'directory';
                  const Icon = isDir ? Folder : (node.name.endsWith('.js') || node.name.endsWith('.ts') ? FileCode : FileText);

                  return (
                    <div
                      key={node.path}
                      onClick={() => handleSelectNode(node)}
                      onDoubleClick={() => handleDoubleClick(node)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 6px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={34} color={isDir ? 'var(--accent)' : 'var(--text-secondary)'} />
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          maxWidth: '80px',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {node.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredEntries.map((node) => {
                  const isSelected = selectedNode?.path === node.path;
                  const isDir = node.type === 'directory';
                  const Icon = isDir ? Folder : FileText;

                  return (
                    <div
                      key={node.path}
                      onClick={() => handleSelectNode(node)}
                      onDoubleClick={() => handleDoubleClick(node)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={14} color={isDir ? 'var(--accent)' : 'var(--text-secondary)'} />
                        <span>{node.name}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {isDir ? '<DIR>' : `${node.size} B`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Inspector & Editor Deck */}
          {selectedNode && (
            <div
              className="glass-panel"
              style={{
                width: '320px',
                borderLeft: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(4, 5, 10, 0.8)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  {selectedNode.name}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {selectedNode.type === 'file' && isEditing && (
                    <button onClick={handleSaveEdit} className="btn-cyber btn-cyber-primary" style={{ padding: '2px 6px', fontSize: '10px' }} title="Save File">
                      <Save size={11} />
                      Save
                    </button>
                  )}
                  <button onClick={() => handleDelete(selectedNode)} className="btn-cyber" style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--error)' }} title="Delete">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Preview or Editor Body */}
              <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                {selectedNode.type === 'directory' ? (
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    <div>Path: <span style={{ color: '#fff' }}>{selectedNode.path}</span></div>
                    <div>Type: <span style={{ color: 'var(--accent)' }}>Directory</span></div>
                    <div>Created: {new Date(selectedNode.metadata.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: '12px' }}>
                      <button onClick={() => loadDirectory(selectedNode.path)} className="btn-cyber" style={{ width: '100%', justifyContent: 'center' }}>
                        Open Directory
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#cbe7ee',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      resize: 'none',
                      lineHeight: '1.5',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Size: {selectedNode.size} bytes • {selectedNode.mimeType}
                    </div>
                    <pre
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        overflowY: 'auto',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: '#a0f0ff',
                      }}
                    >
                      {selectedNode.content || '(Empty file)'}
                    </pre>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-cyber"
                      style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
                    >
                      Edit File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
