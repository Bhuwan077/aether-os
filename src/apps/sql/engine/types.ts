/**
 * In-browser SQL engine types and AST definitions
 */

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'STRING'
  | 'NUMBER'
  | 'COMMA'
  | 'STAR'
  | 'OPERATOR'
  | 'EQUALS'
  | 'LPAREN'
  | 'RPAREN'
  | 'SEMICOLON'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

export type SqlValue = string | number | boolean | null;
export type Row = Record<string, SqlValue>;

export interface TableSchema {
  name: string;
  columns: string[];
}

export interface Table {
  name: string;
  columns: string[];
  rows: Row[];
}

export type Database = Record<string, Table>;

export type ComparisonOperator = '=' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';

export interface WhereClause {
  column: string;
  operator: ComparisonOperator;
  value: SqlValue;
}

export interface JoinClause {
  table: string;
  leftColumn: string;
  rightColumn: string;
}

export interface OrderByClause {
  column: string;
  ascending: boolean;
}

export interface SelectStatement {
  type: 'SELECT';
  columns: string[]; // ['*'] or list of column names
  from: string;
  join?: JoinClause;
  where?: WhereClause;
  orderBy?: OrderByClause;
  limit?: number;
}

export interface InsertStatement {
  type: 'INSERT';
  table: string;
  columns?: string[];
  values: SqlValue[];
}

export interface CreateTableStatement {
  type: 'CREATE_TABLE';
  table: string;
  columns: string[];
}

export interface DropTableStatement {
  type: 'DROP_TABLE';
  table: string;
}

export type SqlStatement = SelectStatement | InsertStatement | CreateTableStatement | DropTableStatement;

export interface QueryResult {
  columns: string[];
  rows: Row[];
  rowCount: number;
  executionTimeMs: number;
  message?: string;
}
