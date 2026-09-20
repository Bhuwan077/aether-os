import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem } from '../vfs';

describe('VirtualFileSystem', () => {
  let fs: VirtualFileSystem;

  beforeEach(() => {
    fs = new VirtualFileSystem(false);
  });

  it('should normalize paths correctly', () => {
    expect(fs.normalizePath('home/user')).toBe('/home/user');
    expect(fs.normalizePath('/home/user/../other')).toBe('/home/other');
    expect(fs.normalizePath('/a/./b/../../c')).toBe('/c');
    expect(fs.normalizePath('///a///b///')).toBe('/a/b');
  });

  it('should resolve relative paths against cwd', () => {
    expect(fs.resolvePath('/home/user', 'docs')).toBe('/home/user/docs');
    expect(fs.resolvePath('/home/user', '../system')).toBe('/home/system');
    expect(fs.resolvePath('/home/user', '/var/log')).toBe('/var/log');
  });

  it('should create directories and read directory contents', () => {
    fs.mkdir('/test/nested/dir', true);
    expect(fs.exists('/test')).toBe(true);
    expect(fs.exists('/test/nested')).toBe(true);
    expect(fs.exists('/test/nested/dir')).toBe(true);
    expect(fs.isDirectory('/test/nested/dir')).toBe(true);

    const contents = fs.readDir('/test');
    expect(contents.length).toBe(1);
    expect(contents[0].name).toBe('nested');
  });

  it('should write and read files', () => {
    const text = 'Hello AetherOS';
    fs.writeFile('/home/user/test.txt', text);

    expect(fs.exists('/home/user/test.txt')).toBe(true);
    expect(fs.isFile('/home/user/test.txt')).toBe(true);
    expect(fs.readFile('/home/user/test.txt')).toBe(text);
  });

  it('should return correct stat metadata for files and directories', () => {
    fs.writeFile('/data/sample.json', '{"key":"value"}');
    const fileStat = fs.stat('/data/sample.json');
    expect(fileStat.isFile).toBe(true);
    expect(fileStat.isDirectory).toBe(false);
    expect(fileStat.name).toBe('sample.json');
    expect(fileStat.size).toBe(15);

    const dirStat = fs.stat('/data');
    expect(dirStat.isDirectory).toBe(true);
    expect(dirStat.childrenCount).toBe(1);
  });

  it('should delete files and directories recursively', () => {
    fs.mkdir('/temp/sub', true);
    fs.writeFile('/temp/sub/file.txt', 'to be deleted');
    expect(fs.exists('/temp/sub/file.txt')).toBe(true);

    fs.rm('/temp/sub/file.txt');
    expect(fs.exists('/temp/sub/file.txt')).toBe(false);

    fs.writeFile('/temp/sub/another.txt', '123');
    expect(() => fs.rm('/temp', false)).toThrow();
    fs.rm('/temp', true);
    expect(fs.exists('/temp')).toBe(false);
  });

  it('should generate ASCII tree representations', () => {
    fs.mkdir('/app/src', true);
    fs.mkdir('/app/dist', true);
    fs.writeFile('/app/src/index.ts', 'console.log()');

    const tree = fs.tree('/app');
    expect(tree).toContain('/app');
    expect(tree).toContain('src/');
    expect(tree).toContain('index.ts');
  });

  it('should throw error when reading non-existent file', () => {
    expect(() => fs.readFile('/ghost.txt')).toThrow('File not found');
  });
});
