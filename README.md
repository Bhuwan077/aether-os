# 🌌 AETHER OS — Futuristic Cyberpunk Web Workstation

```text
   █████╗ ███████╗████████╗██╗  ██╗███████╗██████╗     OS: AetherOS Quantum v2.4
  ██╔══██╗██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗    Kernel: WebAssembly 64-bit
  ███████║█████╗     ██║   ███████║█████╗  ██████╔╝    UI: Glassmorphism Compositor
  ██╔══██║██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗    Audio: Procedural Web Audio Synth
  ██║  ██║███████╗   ██║   ██║  ██║███████╗██║  ██║    Status: Production Ready
  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    FPS: 60-120 Native
```

> **AetherOS** is a next-generation web desktop environment and developer workstation engineered with React 19, TypeScript, and Vite. Designed with cyberpunk aesthetics, high-performance rendering, zero-asset procedural audio synthesis, a complete in-memory & persistent Virtual File System (VFS), and a suite of powerful creative engineering tools.

---

## ⚡ Key Highlights & Architecture

### 🪟 1. Advanced Multi-Window Desktop Compositor
- **Window Management**: Draggable, resizable, minimizable, maximizable, and snap-to-edge layout engine.
- **Z-Index Layering**: Dynamic stacking context with automatic active window election and focus tracking.
- **Snap Shortcuts**: Split-screen left (`◧`) and right (`◨`) layout docking.
- **Glassmorphism & CRT Shaders**: Frosted glass panels with real-time blur, glowing neon borders, and CRT scanlines toggle.

### 💾 2. Virtual File System (VFS)
- Hierarchical Unix-style virtual filesystem with `localStorage` persistent synchronization.
- Full CRUD capabilities: `mkdir`, `readFile`, `writeFile`, `rm`, `readDir`, `stat`, and `tree` generator.
- Pre-seeded system directories: `/home/user/desktop`, `/home/user/projects`, `/etc`, `/var/log`.

### 🔊 3. Procedural Web Audio Engine
- **100% Asset-Free**: No external audio files or network requests needed. Procedural real-time synthesis using the Web Audio API.
- **Tactile UI Audio**: Synthesized clicks, window power-on chords, close tones, and success chimes.
- **Harmonic Algorithmic Sound**: Dynamic pitch generation synchronized with algorithm comparisons and swaps.

---

## 🚀 Built-in Applications Suite

| Application | Description |
| :--- | :--- |
| **📟 RetroTerm** | Authentic Unix terminal with command tokenizer, pipes (`\|`), grep filters, command history (`↑`/`↓`), tab autocomplete, `neofetch`, and fullscreen **Matrix digital rain**. |
| **⚡ AlgoPulse** | Algorithm studio featuring **Sorting Visualizer** (QuickSort, BubbleSort, InsertionSort with musical pitches), **Pathfinding Visualizer** (A* & Dijkstra with interactive wall drawing), and **Conway's Game of Life** with presets. |
| **💻 CodeCraft** | In-browser JavaScript code editor and execution sandbox with line numbers, console logger, execution duration benchmarks, and VFS file synchronization. |
| **🎹 SynthLab** | Polyphonic synthesizer with 2-octave piano keyboard, ADSR envelope shaping (Attack, Decay, Sustain, Release), oscillator waveforms (sawtooth, square, sine, triangle), and real-time FFT oscilloscope. |
| **🕸️ MindCanvas** | Force-directed physics knowledge graph on HTML5 canvas with dynamic Coulomb repulsion, Hooke spring attraction, velocity damping, node creation, and PNG export. |
| **📋 TaskNexus** | Kanban sprint board with drag-and-drop / column advancement, priority tags, integrated Pomodoro focus timer, and confetti milestones. |
| **📊 System Monitor** | Real-time CPU telemetry chart (moving-average SVG), RAM heap simulator, active window thread manager, and theme switcher. |

---

## 🎨 Theme Matrix

AetherOS includes 5 custom built-in cyberpunk and developer themes:
- **Cyberpunk Neon**: High-contrast cyan/magenta neon with CRT scanlines overlay.
- **Obsidian Minimal**: Sleek slate-dark palette with indigo accent lights.
- **Nord Frost**: Arctic pastel hues with glacier blue highlights.
- **Matrix Terminal**: Phosphor green monochromatic CRT terminal experience.
- **Solarized Dark**: Warm teal and amber balanced contrast theme.

---

## ⌨️ Master Keyboard Shortcuts

| Keybinding | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Summon Global Spotlight Command Palette |
| `Double Click Titlebar` | Maximize / Restore Window |
| `Tab` (in RetroTerm) | Autocomplete command names and file paths |
| `↑` / `↓` (in RetroTerm) | Traverse previous command history |
| `Q`, `W`, `E`, `R`, `T`... | Play piano keys in SynthLab |
| `matrix` (in RetroTerm) | Launch fullscreen Matrix digital glyph rain |
| `neofetch` (in RetroTerm) | Display ASCII art system telemetry |

---

## 🛠️ Development & Testing

### Prerequisites
- Node.js `v18+` or higher
- npm `v9+`

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd practice

# Install dependencies
npm install

# Launch development server
npm run dev
```

### Running Test Suite
```bash
# Run Vitest unit tests (covering VFS, WM, Terminal, Audio, Algorithms, Themes)
npm test
```

### Production Build
```bash
# Compile TypeScript and bundle with Vite
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Test Coverage Summary
- Virtual File System (VFS CRUD, tree, path normalization, error resilience)
- Window Manager (z-index layering, snapping, maximizing, restore bounds, focus)
- Terminal Engine (tokenization, quotes, pipe evaluation, autocomplete, math calc)
- Audio Engine (volume clamping, mute state toggling, procedural synthesis)
- Sorting Algorithms (QuickSort, BubbleSort, InsertionSort correctness)
- Pathfinding Algorithms (A* search, Dijkstra shortest path, obstacle avoidance)
- Cellular Automaton (Conway's Game of Life B3/S23 rules, glider presets)
- Theme Configuration (contrast validation, color tokens)

---

## 📜 License
MIT License. Built for high-performance creative engineering.
