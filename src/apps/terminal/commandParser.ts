import { vfs } from '../../core/vfs/vfs';
import { sound } from '../../core/audio/soundEngine';

export interface CommandContext {
  cwd: string;
  setCwd: (path: string) => void;
  output: (line: string) => void;
  clear: () => void;
  setMatrixMode?: (active: boolean) => void;
}

export interface ParsedCommand {
  cmd: string;
  args: string[];
  raw: string;
}

export class TerminalEngine {
  private history: string[] = [];

  public tokenize(line: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if ((ch === '"' || ch === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = ch;
      } else if (ch === quoteChar && inQuotes) {
        inQuotes = false;
      } else if (ch === ' ' && !inQuotes) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += ch;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  public parsePipes(line: string): ParsedCommand[] {
    const segments = line.split('|').map((s) => s.trim()).filter(Boolean);
    return segments.map((seg) => {
      const tokens = this.tokenize(seg);
      return {
        cmd: tokens[0]?.toLowerCase() || '',
        args: tokens.slice(1),
        raw: seg,
      };
    });
  }

  public execute(commandLine: string, ctx: CommandContext): string | void {
    const trimmed = commandLine.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    const pipeStages = this.parsePipes(trimmed);

    let pipeInput: string | null = null;

    for (const stage of pipeStages) {
      pipeInput = this.executeSingle(stage.cmd, stage.args, pipeInput, ctx);
      if (pipeInput === '__CLEAR__') return;
    }

    if (pipeInput !== null && pipeInput !== '') {
      ctx.output(pipeInput);
    }
  }

  private executeSingle(
    cmd: string,
    args: string[],
    input: string | null,
    ctx: CommandContext
  ): string {
    switch (cmd) {
      case 'help':
        return [
          '⚡ AetherOS Terminal Shell — Available Commands:',
          '  help               Show this list of commands',
          '  clear              Clear the terminal screen',
          '  matrix             Toggle full Matrix digital rain mode',
          '  neofetch           Display system telemetry and ASCII banner',
          '  ls [-l] [path]     List directory contents',
          '  cd [path]          Change current working directory',
          '  pwd                Print current working directory',
          '  cat <file>         Print file contents (supports pipes)',
          '  echo [text]        Print text (supports pipes: echo "hi" | grep hi)',
          '  mkdir <path>       Create directory',
          '  touch <file>       Create empty file',
          '  rm [-r] <path>     Remove file or directory',
          '  tree [path]        Print directory tree structure',
          '  grep <pattern>     Filter lines matching pattern (via pipe)',
          '  calc <expr>        Evaluate mathematical expression (e.g. calc 2^8 + 14)',
          '  whoami             Display current user',
          '  date               Print current date and time',
          '  fortune            Display a random cyberpunk wisdom quote',
        ].join('\n');

      case 'clear':
        ctx.clear();
        return '__CLEAR__';

      case 'pwd':
        return ctx.cwd;

      case 'cd': {
        const target = args[0] || '/home/user';
        const resolved = vfs.resolvePath(ctx.cwd, target);
        if (!vfs.exists(resolved)) {
          return `cd: no such directory: ${target}`;
        }
        if (!vfs.isDirectory(resolved)) {
          return `cd: not a directory: ${target}`;
        }
        ctx.setCwd(resolved);
        return '';
      }

      case 'ls': {
        const isLong = args.includes('-l');
        const targetArg = args.find((a) => !a.startsWith('-')) || '.';
        const target = vfs.resolvePath(ctx.cwd, targetArg);

        if (!vfs.exists(target)) {
          return `ls: cannot access '${targetArg}': No such file or directory`;
        }

        if (vfs.isFile(target)) {
          return targetArg;
        }

        const entries = vfs.readDir(target);
        if (!isLong) {
          return entries
            .map((e) => (e.type === 'directory' ? `\x1b[36m${e.name}/\x1b[0m` : e.name))
            .join('    ');
        }

        return entries
          .map((e) => {
            const size = e.type === 'file' ? `${e.size}B` : '<DIR>';
            const date = new Date(e.metadata.modifiedAt).toLocaleTimeString();
            return `${e.type === 'directory' ? 'd' : '-'}rwxr-xr-x  ${size.padEnd(8)}  ${date}  ${e.name}${e.type === 'directory' ? '/' : ''}`;
          })
          .join('\n');
      }

      case 'cat': {
        if (input !== null) {
          return input;
        }
        if (args.length === 0) {
          return 'cat: missing file argument';
        }
        const target = vfs.resolvePath(ctx.cwd, args[0]);
        if (!vfs.exists(target)) {
          return `cat: ${args[0]}: No such file or directory`;
        }
        if (vfs.isDirectory(target)) {
          return `cat: ${args[0]}: Is a directory`;
        }
        return vfs.readFile(target);
      }

      case 'echo': {
        return args.join(' ');
      }

      case 'grep': {
        const pattern = args[0];
        if (!pattern) return 'grep: missing search pattern';
        const sourceText = input !== null ? input : (args[1] ? vfs.readFile(vfs.resolvePath(ctx.cwd, args[1])) : '');
        const lines = sourceText.split('\n');
        const matched = lines.filter((l) => l.toLowerCase().includes(pattern.toLowerCase()));
        return matched.join('\n');
      }

      case 'mkdir': {
        if (args.length === 0) return 'mkdir: missing operand';
        const target = vfs.resolvePath(ctx.cwd, args[0]);
        vfs.mkdir(target, true);
        return '';
      }

      case 'touch': {
        if (args.length === 0) return 'touch: missing file operand';
        const target = vfs.resolvePath(ctx.cwd, args[0]);
        if (!vfs.exists(target)) {
          vfs.writeFile(target, '');
        }
        return '';
      }

      case 'rm': {
        const recursive = args.includes('-r') || args.includes('-rf');
        const targetArg = args.find((a) => !a.startsWith('-'));
        if (!targetArg) return 'rm: missing operand';

        const target = vfs.resolvePath(ctx.cwd, targetArg);
        try {
          vfs.rm(target, recursive);
          return '';
        } catch (e: unknown) {
          return `rm: ${(e as Error).message}`;
        }
      }

      case 'tree': {
        const targetArg = args[0] || ctx.cwd;
        const target = vfs.resolvePath(ctx.cwd, targetArg);
        return vfs.tree(target);
      }

      case 'calc': {
        const expr = args.join('').replace(/\^/g, '**');
        try {
          // Safe evaluation for basic math tokens
          if (/[^0-9+\-*/().\s*]/.test(expr)) {
            return 'calc: expression contains disallowed characters';
          }
          const res = Function(`"use strict"; return (${expr});`)();
          return String(res);
        } catch {
          return 'calc: syntax error in expression';
        }
      }

      case 'whoami':
        return 'user@aether-workstation (uid=1000, gid=1000, roles=[developer, architect, admin])';

      case 'date':
        return new Date().toString();

      case 'fortune': {
        const quotes = [
          '“The street finds its own uses for things.” — William Gibson',
          '“Any sufficiently advanced technology is indistinguishable from magic.” — Arthur C. Clarke',
          '“Talk is cheap. Show me the code.” — Linus Torvalds',
          '“First, solve the problem. Then, write the code.” — John Johnson',
          '“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra',
          '“Code never lies, comments sometimes do.” — Ron Jeffries',
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
      }

      default:
        sound.playError();
        return `aether-sh: command not found: ${cmd}. Type 'help' for available commands.`;
    }
  }

  public getCompletions(currentWord: string, cwd: string): string[] {
    const knownCommands = [
      'help', 'clear', 'matrix', 'neofetch', 'ls', 'cd', 'pwd', 'cat',
      'echo', 'mkdir', 'touch', 'rm', 'tree', 'grep', 'calc', 'whoami',
      'date', 'fortune'
    ];

    if (!currentWord.includes('/')) {
      const matchingCmds = knownCommands.filter((c) => c.startsWith(currentWord.toLowerCase()));
      if (matchingCmds.length > 0) return matchingCmds;
    }

    try {
      const files = vfs.readDir(cwd).map((f) => f.name);
      return files.filter((f) => f.startsWith(currentWord));
    } catch {
      return [];
    }
  }

  public getHistory(): string[] {
    return [...this.history];
  }
}
