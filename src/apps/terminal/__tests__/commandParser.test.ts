import { describe, it, expect, beforeEach } from 'vitest';
import { TerminalEngine, CommandContext } from '../commandParser';
import { vfs } from '../../../core/vfs/vfs';

describe('TerminalEngine', () => {
  let engine: TerminalEngine;
  let outputs: string[];
  let cwd: string;

  const createCtx = (): CommandContext => ({
    cwd,
    setCwd: (p) => { cwd = p; },
    output: (text) => { outputs.push(text); },
    clear: () => { outputs = []; },
  });

  beforeEach(() => {
    engine = new TerminalEngine();
    outputs = [];
    cwd = '/home/user';
  });

  it('should correctly tokenize arguments with single and double quotes', () => {
    const tokens = engine.tokenize('echo "hello world" test \'another one\'');
    expect(tokens).toEqual(['echo', 'hello world', 'test', 'another one']);
  });

  it('should evaluate calc expressions accurately', () => {
    const ctx = createCtx();
    engine.execute('calc 12 * 12 + 10', ctx);
    expect(outputs).toContain('154');
  });

  it('should support pipes for output filtering with grep', () => {
    const ctx = createCtx();
    engine.execute('echo "line 1\nline 2 alpha\nline 3 beta" | grep alpha', ctx);
    expect(outputs.some((o) => o.includes('line 2 alpha'))).toBe(true);
    expect(outputs.some((o) => o.includes('line 3 beta'))).toBe(false);
  });

  it('should execute whoami and date commands', () => {
    const ctx = createCtx();
    engine.execute('whoami', ctx);
    expect(outputs[0]).toContain('user@aether-workstation');
  });

  it('should provide tab autocompletions for commands and files', () => {
    const compCmd = engine.getCompletions('neo', '/home/user');
    expect(compCmd).toContain('neofetch');

    const compHelp = engine.getCompletions('hel', '/home/user');
    expect(compHelp).toContain('help');
  });

  it('should interact with VFS creating files with touch', () => {
    const ctx = createCtx();
    engine.execute('touch /home/user/term_test.txt', ctx);
    expect(vfs.exists('/home/user/term_test.txt')).toBe(true);
  });
});
