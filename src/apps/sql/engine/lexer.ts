import { Token, TokenType } from './types';

const KEYWORDS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER',
  'LEFT',
  'ON',
  'ORDER',
  'BY',
  'ASC',
  'DESC',
  'LIMIT',
  'INSERT',
  'INTO',
  'VALUES',
  'CREATE',
  'TABLE',
  'AND',
  'OR',
  'LIKE',
  'NULL',
  'TRUE',
  'FALSE'
]);

export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const char = sql[i];

    // Whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Comment --
    if (char === '-' && sql[i + 1] === '-') {
      while (i < len && sql[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Punctuation
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',', pos: i++ });
      continue;
    }
    if (char === ';') {
      tokens.push({ type: 'SEMICOLON', value: ';', pos: i++ });
      continue;
    }
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', pos: i++ });
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', pos: i++ });
      continue;
    }
    if (char === '*') {
      tokens.push({ type: 'STAR', value: '*', pos: i++ });
      continue;
    }
    if (char === '=') {
      tokens.push({ type: 'EQUALS', value: '=', pos: i++ });
      continue;
    }

    // Operators: !=, <>, <=, >=, <, >
    if (char === '!' && sql[i + 1] === '=') {
      tokens.push({ type: 'OPERATOR', value: '!=', pos: i });
      i += 2;
      continue;
    }
    if (char === '<') {
      if (sql[i + 1] === '=') {
        tokens.push({ type: 'OPERATOR', value: '<=', pos: i });
        i += 2;
      } else if (sql[i + 1] === '>') {
        tokens.push({ type: 'OPERATOR', value: '<>', pos: i });
        i += 2;
      } else {
        tokens.push({ type: 'OPERATOR', value: '<', pos: i });
        i++;
      }
      continue;
    }
    if (char === '>') {
      if (sql[i + 1] === '=') {
        tokens.push({ type: 'OPERATOR', value: '>=', pos: i });
        i += 2;
      } else {
        tokens.push({ type: 'OPERATOR', value: '>', pos: i });
        i++;
      }
      continue;
    }

    // String literals ('...' or "...")
    if (char === "'" || char === '"') {
      const quote = char;
      const start = i;
      i++;
      let str = '';
      while (i < len && sql[i] !== quote) {
        if (sql[i] === '\\' && i + 1 < len) {
          i++;
          str += sql[i];
        } else {
          str += sql[i];
        }
        i++;
      }
      if (i < len && sql[i] === quote) {
        i++; // skip closing quote
      }
      tokens.push({ type: 'STRING', value: str, pos: start });
      continue;
    }

    // Numeric literals
    if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(sql[i + 1] || ''))) {
      const start = i;
      let numStr = char;
      i++;
      let hasDot = false;
      while (i < len && (/[0-9]/.test(sql[i]) || (sql[i] === '.' && !hasDot))) {
        if (sql[i] === '.') hasDot = true;
        numStr += sql[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr, pos: start });
      continue;
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      let ident = '';
      while (i < len && /[a-zA-Z0-9_.]/.test(sql[i])) {
        ident += sql[i];
        i++;
      }
      const upper = ident.toUpperCase();
      if (KEYWORDS.has(upper)) {
        tokens.push({ type: 'KEYWORD', value: upper, pos: start });
      } else {
        tokens.push({ type: 'IDENTIFIER', value: ident, pos: start });
      }
      continue;
    }

    // Unrecognized character
    i++;
  }

  tokens.push({ type: 'EOF', value: '', pos: len });
  return tokens;
}
