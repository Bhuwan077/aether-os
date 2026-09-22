import { describe, it, expect } from 'vitest';
import { tokenize } from '../engine/lexer';
import { parseSql } from '../engine/parser';
import { SqlEngine } from '../engine/executor';

describe('SQL Lexer & Parser', () => {
  it('should correctly tokenize SQL query with keywords and strings', () => {
    const tokens = tokenize("SELECT id, username FROM users WHERE role = 'SuperUser'");
    expect(tokens[0].type).toBe('KEYWORD');
    expect(tokens[0].value).toBe('SELECT');
    expect(tokens[1].type).toBe('IDENTIFIER');
    expect(tokens[1].value).toBe('id');
    expect(tokens[2].type).toBe('COMMA');
    expect(tokens.some((t) => t.type === 'STRING' && t.value === 'SuperUser')).toBe(true);
  });

  it('should parse complex SELECT statement with JOIN, WHERE, ORDER BY, LIMIT', () => {
    const ast = parseSql(
      'SELECT users.username, audit_logs.action FROM audit_logs INNER JOIN users ON user_id = id WHERE clearance > 2 ORDER BY clearance DESC LIMIT 5'
    );
    expect(ast.type).toBe('SELECT');
    if (ast.type === 'SELECT') {
      expect(ast.from).toBe('audit_logs');
      expect(ast.join?.table).toBe('users');
      expect(ast.join?.leftColumn).toBe('user_id');
      expect(ast.join?.rightColumn).toBe('id');
      expect(ast.where?.column).toBe('clearance');
      expect(ast.where?.operator).toBe('>');
      expect(ast.where?.value).toBe(2);
      expect(ast.orderBy?.column).toBe('clearance');
      expect(ast.orderBy?.ascending).toBe(false);
      expect(ast.limit).toBe(5);
    }
  });

  it('should parse CREATE TABLE and INSERT INTO statements', () => {
    const createAst = parseSql('CREATE TABLE servers (id INT, host TEXT, port INT)');
    expect(createAst.type).toBe('CREATE_TABLE');
    if (createAst.type === 'CREATE_TABLE') {
      expect(createAst.table).toBe('servers');
      expect(createAst.columns).toEqual(['id', 'host', 'port']);
    }

    const insertAst = parseSql("INSERT INTO servers VALUES (1, 'gateway-01', 8080)");
    expect(insertAst.type).toBe('INSERT');
    if (insertAst.type === 'INSERT') {
      expect(insertAst.table).toBe('servers');
      expect(insertAst.values).toEqual([1, 'gateway-01', 8080]);
    }
  });
});

describe('SQL Execution Engine', () => {
  it('should execute SELECT * from seeded users table', () => {
    const engine = new SqlEngine();
    const result = engine.execute('SELECT * FROM users');
    expect(result.rowCount).toBe(5);
    expect(result.columns).toContain('username');
    expect(result.columns).toContain('clearance');
    expect(result.rows[0].username).toBe('cyber_admin');
  });

  it('should filter with WHERE and sort with ORDER BY', () => {
    const engine = new SqlEngine();
    const result = engine.execute(
      'SELECT username, clearance FROM users WHERE clearance >= 4 ORDER BY clearance DESC'
    );
    expect(result.rowCount).toBe(3);
    expect(result.rows[0].clearance).toBe(5);
    expect(result.rows[result.rowCount - 1].clearance).toBe(4);
  });

  it('should evaluate LIKE queries with wildcards', () => {
    const engine = new SqlEngine();
    const result = engine.execute("SELECT username FROM users WHERE username LIKE '%pilot%'");
    expect(result.rowCount).toBe(1);
    expect(result.rows[0].username).toBe('vector_pilot');
  });

  it('should perform INNER JOIN queries between tables', () => {
    const engine = new SqlEngine();
    const result = engine.execute(
      'SELECT action, username, severity FROM audit_logs INNER JOIN users ON user_id = id WHERE clearance = 5'
    );
    expect(result.rowCount).toBe(3);
    expect(result.rows.every((r) => r.username === 'cyber_admin' || r.username === 'phantom_zero')).toBe(true);
  });

  it('should create dynamic tables and insert rows into them', () => {
    const engine = new SqlEngine();
    const createRes = engine.execute('CREATE TABLE satellites (id, name, altitude)');
    expect(createRes.message).toContain('created');

    const insertRes1 = engine.execute("INSERT INTO satellites VALUES (101, 'Orbital-Alpha', 450)");
    expect(insertRes1.rowCount).toBe(1);

    const insertRes2 = engine.execute("INSERT INTO satellites VALUES (102, 'Sentry-Bravo', 720)");
    expect(insertRes2.rowCount).toBe(1);

    const selectRes = engine.execute('SELECT name, altitude FROM satellites ORDER BY altitude DESC');
    expect(selectRes.rowCount).toBe(2);
    expect(selectRes.rows[0].name).toBe('Sentry-Bravo');
    expect(selectRes.rows[1].name).toBe('Orbital-Alpha');
  });

  it('should handle errors cleanly on non-existent tables or syntax mistakes', () => {
    const engine = new SqlEngine();
    const result = engine.execute('SELECT * FROM non_existing_table');
    expect(result.message).toContain('Error');
    expect(result.rowCount).toBe(0);
  });
});
