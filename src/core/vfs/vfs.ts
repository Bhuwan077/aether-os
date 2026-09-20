import { VFSFileNode, VFSDirectoryNode, VFSNode, VFSStat, VFSNodeType } from './types';

const STORAGE_KEY = 'aether_vfs_v1';

export class VirtualFileSystem {
  private root: VFSDirectoryNode;
  private subscribers: Array<() => void> = [];

  constructor(autoLoad = true) {
    this.root = this.createDefaultRoot();
    if (autoLoad && typeof window !== 'undefined' && window.localStorage) {
      this.loadFromStorage();
    }
  }

  private createDefaultRoot(): VFSDirectoryNode {
    const now = Date.now();
    const defaultRoot: VFSDirectoryNode = {
      type: 'directory',
      name: '',
      path: '/',
      children: {},
      metadata: { createdAt: now, modifiedAt: now },
    };

    return defaultRoot;
  }

  public seedDefaults(): void {
    const now = Date.now();
    this.mkdir('/home/user/desktop', true);
    this.mkdir('/home/user/projects', true);
    this.mkdir('/home/user/notes', true);
    this.mkdir('/etc', true);
    this.mkdir('/var/log', true);

    this.writeFile(
      '/home/user/desktop/welcome.md',
      `# 🌌 Welcome to AetherOS v2.4 (Quantum Build)

AetherOS is a next-generation web workstation and developer sandbox inspired by cyberpunk aesthetics and high-performance computing.

### ⚡ Key Capabilities:
- **Interactive Window Manager**: Draggable, resizable windows, snapping, minimizing, maximizing, stacking.
- **AlgoPulse Studio**: Sorting algorithms, graph pathfinding (A*, Dijkstra), Conway's Game of Life.
- **CodeCraft REPL**: Multi-tab code sandbox with real-time evaluation and performance profiler.
- **MindCanvas**: Force-directed physics knowledge graph and mind-mapping canvas.
- **RetroTerm**: Unix shell with autocomplete, pipe operations, matrix digital rain, and command history.
- **SynthLab**: Web Audio polyphonic synthesizer with ADSR envelopes and live oscilloscope.
- **TaskNexus**: Kanban board with task matrix and integrated Pomodoro timer.
- **System Monitor**: Live simulated CPU/RAM usage meters, audio visualizer, theme switcher.

Use **Ctrl + K** anytime to summon the **Command Palette**!
`
    );

    this.writeFile(
      '/home/user/desktop/manifesto.txt',
      `// THE CYBERPUNK DEVELOPER MANIFESTO
1. Tools must be beautiful, fast, and tactile.
2. High latency is the ultimate failure mode.
3. Every algorithm tells a visual story.
4. Synth soundscapes fuel 10x deep work.
5. Never fear pushing to production on Fridays if your tests pass.
`
    );

    this.writeFile(
      '/home/user/projects/demo.js',
      `// Interactive Sandbox Demo
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

console.log("=== AetherOS Sandbox Benchmark ===");
const start = performance.now();
const result = fibonacci(35);
const duration = (performance.now() - start).toFixed(2);

console.log(\`Result of fibonacci(35): \${result}\`);
console.log(\`Execution time: \${duration} ms\`);
`
    );

    this.writeFile(
      '/home/user/projects/algorithms.ts',
      `// Binary Search Tree Implementation
export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(val: T) {
    this.value = val;
  }
}

export function insert<T>(root: TreeNode<T> | null, val: T): TreeNode<T> {
  if (!root) return new TreeNode(val);
  if (val < root.value) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}
`
    );

    this.writeFile(
      '/home/user/notes/ideas.md',
      `# 💡 Project Roadmap & Brainstorm
- [x] Implement glassmorphism window manager
- [x] Build Web Audio procedural sound synthesizer
- [x] Create AlgoPulse visualizer for sorting & A* pathfinding
- [x] Embed multi-tab live JavaScript/TypeScript REPL
- [ ] Connect neural network visualizer weights to WebGL
- [ ] Add multiplayer collaborative WebRTC canvas
`
    );

    this.writeFile(
      '/etc/motd',
      `AetherOS v2.4-quantum (x86_64-wasm-web)
Authorized user access only. Terminal session established.
Type 'help' for available system commands.
`
    );

    this.writeFile(
      '/etc/sysconfig.json',
      JSON.stringify(
        {
          hostname: 'aether-workstation',
          version: '2.4.0',
          audioEngine: 'WebAudio Polyphonic 48kHz',
          theme: 'cyberpunk-neon',
          animations: true,
          soundEffects: true,
        },
        null,
        2
      )
    );

    this.writeFile(
      '/var/log/syslog',
      `[${new Date(now - 3600000).toISOString()}] SYSTEM_INIT: Core kernel loaded.
[${new Date(now - 2400000).toISOString()}] VFS: Virtual file system mounted on root /.
[${new Date(now - 1200000).toISOString()}] AUDIO_ENGINE: AudioContext initialized at 48000Hz.
[${new Date(now - 50000).toISOString()}] WM_READY: Window compositor started successfully.
`
    );
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify(): void {
    this.subscribers.forEach((cb) => cb());
    this.saveToStorage();
  }

  public normalizePath(path: string): string {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const parts = path.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  public resolvePath(cwd: string, path: string): string {
    if (path.startsWith('/')) {
      return this.normalizePath(path);
    }
    return this.normalizePath(`${cwd}/${path}`);
  }

  private getNode(path: string): VFSNode | null {
    const norm = this.normalizePath(path);
    if (norm === '/') return this.root;

    const parts = norm.split('/').filter(Boolean);
    let curr: VFSNode = this.root;

    for (const part of parts) {
      if (curr.type !== 'directory') return null;
      const next: VFSNode | undefined = curr.children[part];
      if (!next) return null;
      curr = next;
    }

    return curr;
  }

  public exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  public isDirectory(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'directory';
  }

  public isFile(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'file';
  }

  public readFile(path: string): string {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    if (node.type !== 'file') {
      throw new Error(`Path is a directory: ${path}`);
    }
    return node.content;
  }

  public writeFile(path: string, content: string): void {
    const norm = this.normalizePath(path);
    if (norm === '/') {
      throw new Error('Cannot write to root directory as a file');
    }

    const parts = norm.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    let parentNode = this.getNode(parentPath);
    if (!parentNode) {
      this.mkdir(parentPath, true);
      parentNode = this.getNode(parentPath);
    }

    if (!parentNode || parentNode.type !== 'directory') {
      throw new Error(`Invalid parent path: ${parentPath}`);
    }

    const now = Date.now();
    const mime = this.guessMimeType(fileName);

    const existing = parentNode.children[fileName];
    if (existing && existing.type === 'directory') {
      throw new Error(`Cannot overwrite directory with file: ${norm}`);
    }

    const fileNode: VFSFileNode = {
      type: 'file',
      name: fileName,
      path: norm,
      content,
      size: new TextEncoder().encode(content).length,
      mimeType: mime,
      metadata: {
        createdAt: existing ? existing.metadata.createdAt : now,
        modifiedAt: now,
      },
    };

    parentNode.children[fileName] = fileNode;
    this.notify();
  }

  public mkdir(path: string, recursive = false): void {
    const norm = this.normalizePath(path);
    if (norm === '/') return;

    const parts = norm.split('/').filter(Boolean);
    let curr = this.root;
    let accumulated = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulated += '/' + part;
      let next = curr.children[part];

      if (!next) {
        if (!recursive && i < parts.length - 1) {
          throw new Error(`Parent directory does not exist: ${accumulated}`);
        }
        const now = Date.now();
        const newDir: VFSDirectoryNode = {
          type: 'directory',
          name: part,
          path: accumulated,
          children: {},
          metadata: { createdAt: now, modifiedAt: now },
        };
        curr.children[part] = newDir;
        next = newDir;
      } else if (next.type !== 'directory') {
        throw new Error(`Path component is not a directory: ${accumulated}`);
      }

      curr = next as VFSDirectoryNode;
    }

    this.notify();
  }

  public readDir(path: string): VFSNode[] {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }
    if (node.type !== 'directory') {
      throw new Error(`Path is not a directory: ${path}`);
    }

    return Object.values(node.children);
  }

  public stat(path: string): VFSStat {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    return {
      name: node.name,
      path: node.path,
      type: node.type,
      size: node.type === 'file' ? node.size : Object.keys(node.children).length,
      modifiedAt: node.metadata.modifiedAt,
      createdAt: node.metadata.createdAt,
      isDirectory: node.type === 'directory',
      isFile: node.type === 'file',
      childrenCount: node.type === 'directory' ? Object.keys(node.children).length : undefined,
    };
  }

  public rm(path: string, recursive = false): void {
    const norm = this.normalizePath(path);
    if (norm === '/') {
      throw new Error('Cannot remove root directory');
    }

    const parts = norm.split('/').filter(Boolean);
    const targetName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== 'directory') {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    const target = parent.children[targetName];
    if (!target) {
      throw new Error(`No such file or directory: ${norm}`);
    }

    if (target.type === 'directory') {
      const hasChildren = Object.keys(target.children).length > 0;
      if (hasChildren && !recursive) {
        throw new Error(`Directory not empty: ${norm} (use recursive flag)`);
      }
    }

    delete parent.children[targetName];
    this.notify();
  }

  public tree(startPath = '/'): string {
    const rootNode = this.getNode(startPath);
    if (!rootNode) return `Path not found: ${startPath}`;
    if (rootNode.type === 'file') return rootNode.name;

    const lines: string[] = [startPath];

    const buildTree = (dir: VFSDirectoryNode, prefix = '') => {
      const keys = Object.keys(dir.children).sort();
      keys.forEach((key, index) => {
        const isLast = index === keys.length - 1;
        const child = dir.children[key];
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        lines.push(`${prefix}${connector}${child.name}${child.type === 'directory' ? '/' : ''}`);
        if (child.type === 'directory') {
          buildTree(child, prefix + childPrefix);
        }
      });
    };

    buildTree(rootNode as VFSDirectoryNode);
    return lines.join('\n');
  }

  private guessMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': return 'text/plain';
      case 'md': return 'text/markdown';
      case 'js': return 'application/javascript';
      case 'ts': return 'application/typescript';
      case 'json': return 'application/json';
      case 'html': return 'text/html';
      case 'css': return 'text/css';
      default: return 'application/octet-stream';
    }
  }

  public saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const serialized = JSON.stringify(this.root);
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('Failed to persist VFS to localStorage', e);
    }
  }

  public loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.type === 'directory') {
          this.root = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse VFS from localStorage, resetting to defaults', e);
    }
    this.seedDefaults();
  }

  public resetToDefaults(): void {
    this.root = this.createDefaultRoot();
    this.seedDefaults();
    this.notify();
  }
}

// Global Singleton Instance
export const vfs = new VirtualFileSystem();
if (vfs.readDir('/').length === 0) {
  vfs.seedDefaults();
}
