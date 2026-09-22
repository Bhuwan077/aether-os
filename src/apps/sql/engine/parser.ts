import { Token, SqlStatement, SelectStatement, InsertStatement, CreateTableStatement, DropTableStatement, SqlValue, ComparisonOperator } from './types';
import { tokenize } from './lexer';

export class SqlParser {
  private tokens: Token[];
  private current = 0;

  constructor(sql: string) {
    this.tokens = tokenize(sql);
  }

  public parse(): SqlStatement {
    const token = this.peek();

    if (token.type === 'KEYWORD') {
      if (token.value === 'SELECT') {
        return this.parseSelect();
      }
      if (token.value === 'INSERT') {
        return this.parseInsert();
      }
      if (token.value === 'CREATE') {
        return this.parseCreate();
      }
      if (token.value === 'DROP') {
        return this.parseDrop();
      }
    }

    throw new Error(`Syntax Error: Expected SELECT, INSERT, CREATE, or DROP statement, but found "${token.value}"`);
  }

  private parseDrop(): DropTableStatement {
    this.consume('KEYWORD', 'DROP');
    this.consume('KEYWORD', 'TABLE');
    const table = this.consumeIdentifierOrKeyword().value;
    return {
      type: 'DROP_TABLE',
      table
    };
  }

  private parseSelect(): SelectStatement {
    this.consume('KEYWORD', 'SELECT');

    // Parse columns
    const columns: string[] = [];
    if (this.peek().type === 'STAR') {
      this.consume('STAR');
      columns.push('*');
    } else {
      while (!this.isAtEnd()) {
        const colToken = this.consumeIdentifierOrKeyword();
        columns.push(colToken.value);

        if (this.peek().type === 'COMMA') {
          this.consume('COMMA');
        } else {
          break;
        }
      }
    }

    // FROM
    this.consume('KEYWORD', 'FROM');
    const fromTable = this.consumeIdentifierOrKeyword().value;

    let join: SelectStatement['join'];
    let where: SelectStatement['where'];
    let orderBy: SelectStatement['orderBy'];
    let limit: number | undefined;

    // Optional JOIN (INNER JOIN or JOIN)
    if (this.peek().type === 'KEYWORD' && (this.peek().value === 'JOIN' || this.peek().value === 'INNER')) {
      if (this.peek().value === 'INNER') {
        this.consume('KEYWORD', 'INNER');
      }
      this.consume('KEYWORD', 'JOIN');
      const joinTable = this.consumeIdentifierOrKeyword().value;
      this.consume('KEYWORD', 'ON');
      const leftCol = this.consumeIdentifierOrKeyword().value;
      this.consume('EQUALS', '=');
      const rightCol = this.consumeIdentifierOrKeyword().value;

      join = {
        table: joinTable,
        leftColumn: leftCol,
        rightColumn: rightCol
      };
    }

    // Optional WHERE
    if (this.peek().type === 'KEYWORD' && this.peek().value === 'WHERE') {
      this.consume('KEYWORD', 'WHERE');
      const col = this.consumeIdentifierOrKeyword().value;

      const opToken = this.peek();
      let op: ComparisonOperator;
      if (opToken.type === 'EQUALS') {
        this.consume('EQUALS');
        op = '=';
      } else if (opToken.type === 'OPERATOR') {
        this.advance();
        op = opToken.value as ComparisonOperator;
      } else if (opToken.type === 'KEYWORD' && opToken.value === 'LIKE') {
        this.consume('KEYWORD', 'LIKE');
        op = 'LIKE';
      } else {
        throw new Error(`Expected comparison operator in WHERE clause, got "${opToken.value}"`);
      }

      const val = this.parseLiteralValue();
      where = { column: col, operator: op, value: val };
    }

    // Optional ORDER BY
    if (this.peek().type === 'KEYWORD' && this.peek().value === 'ORDER') {
      this.consume('KEYWORD', 'ORDER');
      this.consume('KEYWORD', 'BY');
      const orderCol = this.consumeIdentifierOrKeyword().value;
      let ascending = true;

      if (this.peek().type === 'KEYWORD') {
        if (this.peek().value === 'DESC') {
          this.consume('KEYWORD', 'DESC');
          ascending = false;
        } else if (this.peek().value === 'ASC') {
          this.consume('KEYWORD', 'ASC');
          ascending = true;
        }
      }

      orderBy = { column: orderCol, ascending };
    }

    // Optional LIMIT
    if (this.peek().type === 'KEYWORD' && this.peek().value === 'LIMIT') {
      this.consume('KEYWORD', 'LIMIT');
      const limitToken = this.consume('NUMBER');
      limit = parseInt(limitToken.value, 10);
    }

    return {
      type: 'SELECT',
      columns,
      from: fromTable,
      join,
      where,
      orderBy,
      limit
    };
  }

  private parseInsert(): InsertStatement {
    this.consume('KEYWORD', 'INSERT');
    this.consume('KEYWORD', 'INTO');
    const table = this.consumeIdentifierOrKeyword().value;

    let columns: string[] | undefined;

    // Optional column list: (col1, col2)
    if (this.peek().type === 'LPAREN') {
      this.consume('LPAREN');
      columns = [];
      while (!this.isAtEnd() && this.peek().type !== 'RPAREN') {
        columns.push(this.consumeIdentifierOrKeyword().value);
        if (this.peek().type === 'COMMA') {
          this.consume('COMMA');
        } else {
          break;
        }
      }
      this.consume('RPAREN');
    }

    this.consume('KEYWORD', 'VALUES');
    this.consume('LPAREN');

    const values: SqlValue[] = [];
    while (!this.isAtEnd() && this.peek().type !== 'RPAREN') {
      values.push(this.parseLiteralValue());
      if (this.peek().type === 'COMMA') {
        this.consume('COMMA');
      } else {
        break;
      }
    }
    this.consume('RPAREN');

    return {
      type: 'INSERT',
      table,
      columns,
      values
    };
  }

  private parseCreate(): CreateTableStatement {
    this.consume('KEYWORD', 'CREATE');
    this.consume('KEYWORD', 'TABLE');
    const table = this.consumeIdentifierOrKeyword().value;

    this.consume('LPAREN');
    const columns: string[] = [];

    while (!this.isAtEnd() && this.peek().type !== 'RPAREN') {
      const colName = this.consumeIdentifierOrKeyword().value;
      columns.push(colName);

      // Optional column type (e.g. TEXT, INT, VARCHAR) if provided
      if (this.peek().type === 'KEYWORD' || this.peek().type === 'IDENTIFIER') {
        this.advance();
      }

      if (this.peek().type === 'COMMA') {
        this.consume('COMMA');
      } else {
        break;
      }
    }

    this.consume('RPAREN');

    return {
      type: 'CREATE_TABLE',
      table,
      columns
    };
  }

  private parseLiteralValue(): SqlValue {
    const token = this.peek();
    if (token.type === 'STRING') {
      this.advance();
      return token.value;
    }
    if (token.type === 'NUMBER') {
      this.advance();
      return Number(token.value);
    }
    if (token.type === 'KEYWORD') {
      if (token.value === 'TRUE') {
        this.advance();
        return true;
      }
      if (token.value === 'FALSE') {
        this.advance();
        return false;
      }
      if (token.value === 'NULL') {
        this.advance();
        return null;
      }
    }

    throw new Error(`Expected literal value at position ${token.pos}, got "${token.value}"`);
  }

  private consumeIdentifierOrKeyword(): Token {
    const t = this.peek();
    if (t.type === 'IDENTIFIER' || t.type === 'KEYWORD') {
      return this.advance();
    }
    throw new Error(`Expected identifier or column name, got "${t.value}"`);
  }

  private consume(type: Token['type'], value?: string): Token {
    const token = this.peek();
    if (token.type !== type || (value !== undefined && token.value.toUpperCase() !== value.toUpperCase())) {
      throw new Error(`Syntax Error: Expected ${value ? `"${value}"` : type}, but received "${token.value}"`);
    }
    return this.advance();
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: 'EOF', value: '', pos: -1 };
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }
}

export function parseSql(sql: string): SqlStatement {
  const parser = new SqlParser(sql);
  return parser.parse();
}
