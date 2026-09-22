import {
  Database,
  Table,
  SqlStatement,
  SelectStatement,
  InsertStatement,
  CreateTableStatement,
  QueryResult,
  Row,
  SqlValue,
  WhereClause
} from './types';
import { parseSql } from './parser';

export class SqlEngine {
  private db: Database = {};

  constructor(initialDb?: Database) {
    if (initialDb) {
      this.db = initialDb;
    } else {
      this.seedDefaultDatabase();
    }
  }

  public getDatabase(): Database {
    return this.db;
  }

  public getTableNames(): string[] {
    return Object.keys(this.db);
  }

  public getTable(name: string): Table | undefined {
    return this.db[name.toLowerCase()];
  }

  public execute(sql: string): QueryResult {
    const startTime = performance.now();
    const cleanSql = sql.trim().replace(/;+$/, '');

    if (!cleanSql) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        message: 'Empty query'
      };
    }

    try {
      const stmt = parseSql(cleanSql);
      let result: QueryResult;

      switch (stmt.type) {
        case 'CREATE_TABLE':
          result = this.executeCreate(stmt);
          break;
        case 'INSERT':
          result = this.executeInsert(stmt);
          break;
        case 'SELECT':
          result = this.executeSelect(stmt);
          break;
        default:
          throw new Error('Unsupported statement type');
      }

      result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return result;
    } catch (err: any) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
        message: `Error: ${err.message}`
      };
    }
  }

  private executeCreate(stmt: CreateTableStatement): QueryResult {
    const tableName = stmt.table.toLowerCase();
    if (this.db[tableName]) {
      throw new Error(`Table "${stmt.table}" already exists`);
    }

    this.db[tableName] = {
      name: stmt.table,
      columns: stmt.columns,
      rows: []
    };

    return {
      columns: ['status'],
      rows: [{ status: `Table "${stmt.table}" created with columns (${stmt.columns.join(', ')})` }],
      rowCount: 0,
      executionTimeMs: 0,
      message: `Table ${stmt.table} created successfully.`
    };
  }

  private executeInsert(stmt: InsertStatement): QueryResult {
    const tableName = stmt.table.toLowerCase();
    const table = this.db[tableName];
    if (!table) {
      throw new Error(`Table "${stmt.table}" does not exist`);
    }

    const newRow: Row = {};
    const cols = stmt.columns && stmt.columns.length > 0 ? stmt.columns : table.columns;

    if (cols.length !== stmt.values.length) {
      throw new Error(`Column count (${cols.length}) does not match value count (${stmt.values.length})`);
    }

    // Initialize row with nulls
    for (const c of table.columns) {
      newRow[c] = null;
    }

    // Assign specified column values
    for (let i = 0; i < cols.length; i++) {
      const colName = cols[i];
      const matchCol = table.columns.find((c) => c.toLowerCase() === colName.toLowerCase());
      if (!matchCol) {
        throw new Error(`Column "${colName}" not found in table "${stmt.table}"`);
      }
      newRow[matchCol] = stmt.values[i];
    }

    table.rows.push(newRow);

    return {
      columns: ['affected_rows'],
      rows: [{ affected_rows: 1 }],
      rowCount: 1,
      executionTimeMs: 0,
      message: `Inserted 1 row into ${stmt.table}.`
    };
  }

  private executeSelect(stmt: SelectStatement): QueryResult {
    const tableName = stmt.from.toLowerCase();
    const table = this.db[tableName];
    if (!table) {
      throw new Error(`Table "${stmt.from}" not found`);
    }

    let sourceRows: Row[] = table.rows.map((r) => ({ ...r }));
    let availableColumns = [...table.columns];

    // Handle INNER JOIN
    if (stmt.join) {
      const joinTable = this.db[stmt.join.table.toLowerCase()];
      if (!joinTable) {
        throw new Error(`Join table "${stmt.join.table}" not found`);
      }

      const joinedRows: Row[] = [];
      const leftCol = this.resolveColumnName(stmt.join.leftColumn, table);
      const rightCol = this.resolveColumnName(stmt.join.rightColumn, joinTable);

      for (const lRow of sourceRows) {
        for (const rRow of joinTable.rows) {
          if (lRow[leftCol] !== null && lRow[leftCol] !== undefined && lRow[leftCol] === rRow[rightCol]) {
            const combined: Row = { ...lRow };
            for (const col of joinTable.columns) {
              const targetKey = combined[col] !== undefined ? `${joinTable.name}_${col}` : col;
              combined[targetKey] = rRow[col];
              if (!availableColumns.includes(targetKey)) {
                availableColumns.push(targetKey);
              }
            }
            joinedRows.push(combined);
          }
        }
      }
      sourceRows = joinedRows;
    }

    // Handle WHERE filter
    if (stmt.where) {
      sourceRows = sourceRows.filter((row) => this.evaluateWhere(row, stmt.where!));
    }

    // Handle ORDER BY
    if (stmt.orderBy) {
      const col = stmt.orderBy.column;
      const asc = stmt.orderBy.ascending;
      sourceRows.sort((a, b) => {
        const valA = a[col];
        const valB = b[b[col] !== undefined ? col : Object.keys(b).find((k) => k.toLowerCase() === col.toLowerCase()) || col];
        const vA = a[col] ?? valA;
        const vB = b[col] ?? valB;

        if (vA === vB) return 0;
        if (vA === null || vA === undefined) return 1;
        if (vB === null || vB === undefined) return -1;

        let cmp = 0;
        if (typeof vA === 'number' && typeof vB === 'number') {
          cmp = vA - vB;
        } else {
          cmp = String(vA).localeCompare(String(vB));
        }
        return asc ? cmp : -cmp;
      });
    }

    // Handle LIMIT
    if (stmt.limit !== undefined && stmt.limit >= 0) {
      sourceRows = sourceRows.slice(0, stmt.limit);
    }

    // Project columns
    let resultColumns: string[] = [];
    if (stmt.columns.length === 1 && stmt.columns[0] === '*') {
      resultColumns = availableColumns;
    } else {
      resultColumns = stmt.columns;
    }

    const projectedRows: Row[] = sourceRows.map((row) => {
      const projected: Row = {};
      for (const col of resultColumns) {
        if (row[col] !== undefined) {
          projected[col] = row[col];
        } else {
          // Check case-insensitive match
          const foundKey = Object.keys(row).find((k) => k.toLowerCase() === col.toLowerCase());
          projected[col] = foundKey ? row[foundKey] : null;
        }
      }
      return projected;
    });

    return {
      columns: resultColumns,
      rows: projectedRows,
      rowCount: projectedRows.length,
      executionTimeMs: 0
    };
  }

  private evaluateWhere(row: Row, where: WhereClause): boolean {
    const colKey = Object.keys(row).find((k) => k.toLowerCase() === where.column.toLowerCase()) || where.column;
    const rowVal = row[colKey];
    const targetVal = where.value;

    switch (where.operator) {
      case '=':
        return String(rowVal).toLowerCase() === String(targetVal).toLowerCase();
      case '!=':
      case '<>':
        return String(rowVal).toLowerCase() !== String(targetVal).toLowerCase();
      case '>':
        return Number(rowVal) > Number(targetVal);
      case '<':
        return Number(rowVal) < Number(targetVal);
      case '>=':
        return Number(rowVal) >= Number(targetVal);
      case '<=':
        return Number(rowVal) <= Number(targetVal);
      case 'LIKE': {
        if (rowVal === null || rowVal === undefined) return false;
        const pattern = String(targetVal)
          .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
          .replace(/%/g, '.*')
          .replace(/_/g, '.');
        const regex = new RegExp(`^${pattern}$`, 'i');
        return regex.test(String(rowVal));
      }
      default:
        return false;
    }
  }

  private resolveColumnName(colStr: string, table: Table): string {
    // If format is table.column
    const parts = colStr.split('.');
    const col = parts.length > 1 ? parts[1] : parts[0];
    const found = table.columns.find((c) => c.toLowerCase() === col.toLowerCase());
    return found || col;
  }

  private seedDefaultDatabase(): void {
    this.db = {
      users: {
        name: 'users',
        columns: ['id', 'username', 'role', 'clearance', 'department'],
        rows: [
          { id: 1, username: 'cyber_admin', role: 'SuperUser', clearance: 5, department: 'Security' },
          { id: 2, username: 'neuro_analyst', role: 'Researcher', clearance: 3, department: 'AI Lab' },
          { id: 3, username: 'vector_pilot', role: 'Operator', clearance: 4, department: 'Flight' },
          { id: 4, username: 'echo_node', role: 'Sentry', clearance: 2, department: 'Defense' },
          { id: 5, username: 'phantom_zero', role: 'Infiltrator', clearance: 5, department: 'BlackOps' }
        ]
      },
      audit_logs: {
        name: 'audit_logs',
        columns: ['id', 'user_id', 'action', 'severity', 'timestamp'],
        rows: [
          { id: 101, user_id: 1, action: 'KERNEL_RELOAD', severity: 'CRITICAL', timestamp: '2026-09-21 04:00' },
          { id: 102, user_id: 2, action: 'WEIGHT_SYNCHRONIZE', severity: 'INFO', timestamp: '2026-09-21 07:15' },
          { id: 103, user_id: 1, action: 'VFS_CHMOD_ROOT', severity: 'HIGH', timestamp: '2026-09-21 08:30' },
          { id: 104, user_id: 3, action: 'ORBITAL_CORRECTION', severity: 'MEDIUM', timestamp: '2026-09-21 11:20' },
          { id: 105, user_id: 5, action: 'KEY_EXCHANGE_RSA', severity: 'HIGH', timestamp: '2026-09-21 14:45' }
        ]
      }
    };
  }
}
