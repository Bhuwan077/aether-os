import React, { useState, useMemo } from 'react';
import {
  Database as DatabaseIcon,
  Play,
  RotateCcw,
  Table as TableIcon,
  Columns,
  Download,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { sound } from '../../core/audio/soundEngine';
import { SqlEngine } from './engine/executor';
import { QueryResult } from './engine/types';

const PRESET_QUERIES = [
  {
    name: 'All Users',
    sql: 'SELECT * FROM users'
  },
  {
    name: 'High Clearance Staff (>= 4)',
    sql: 'SELECT username, role, clearance, department FROM users WHERE clearance >= 4 ORDER BY clearance DESC'
  },
  {
    name: 'Critical Security Audit Logs',
    sql: "SELECT id, user_id, action, severity, timestamp FROM audit_logs WHERE severity = 'CRITICAL'"
  },
  {
    name: 'JOIN: Audit Logs & Operator Identities',
    sql: "SELECT audit_logs.id, users.username, users.department, audit_logs.action, audit_logs.severity FROM audit_logs INNER JOIN users ON user_id = id WHERE clearance >= 3 ORDER BY users.clearance DESC"
  },
  {
    name: 'Insert New User',
    sql: "INSERT INTO users VALUES (6, 'cipher_ghost', 'Cryptographer', 5, 'R&D')"
  },
  {
    name: 'Create & Populate Subsystem Table',
    sql: "CREATE TABLE neural_nodes (node_id, cluster_name, sync_rate)"
  }
];

export const SQLSand: React.FC = () => {
  const [engine, setEngine] = useState<SqlEngine>(() => new SqlEngine());
  const [query, setQuery] = useState<string>('SELECT * FROM users');
  const [result, setResult] = useState<QueryResult | null>(() => engine.execute('SELECT * FROM users'));
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [dbVersion, setDbVersion] = useState(0);

  const tables = useMemo(() => {
    return engine.getDatabase();
  }, [engine, dbVersion]);

  const handleRunQuery = (customSql?: string) => {
    const targetSql = customSql ?? query;
    sound.playTone(650, 0.06, 'triangle', 0.15);
    const res = engine.execute(targetSql);
    setResult(res);
    setDbVersion((v) => v + 1);
  };

  const handleResetDb = () => {
    sound.playTone(400, 0.08, 'sine', 0.2);
    const newEngine = new SqlEngine();
    setEngine(newEngine);
    const res = newEngine.execute('SELECT * FROM users');
    setResult(res);
    setQuery('SELECT * FROM users');
    setSelectedTable('users');
    setDbVersion((v) => v + 1);
  };

  const handleExportJson = () => {
    if (!result || result.rows.length === 0) return;
    sound.playTone(800, 0.05, 'sine', 0.15);
    const blob = new Blob([JSON.stringify(result.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sqlsand_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none font-sans">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold tracking-wide text-cyan-400">SQLSand</span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
            Relational DB Studio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const q = e.target.value;
              if (q) {
                setQuery(q);
                handleRunQuery(q);
              }
            }}
            value=""
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="" disabled>
              Preset Queries...
            </option>
            {PRESET_QUERIES.map((p, idx) => (
              <option key={idx} value={p.sql}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleRunQuery()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow transition font-mono"
            title="Run Query (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Execute (Ctrl+↵)
          </button>

          <button
            onClick={handleResetDb}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
            title="Reset to default seeded database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset DB
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Schema Explorer */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/40 p-3 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
              Tables ({Object.keys(tables).length})
            </span>
          </div>

          <div className="space-y-2">
            {Object.entries(tables).map(([tableName, table]) => (
              <div
                key={tableName}
                className={`rounded-lg border p-2.5 transition cursor-pointer ${
                  selectedTable === tableName
                    ? 'border-cyan-500/80 bg-cyan-950/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
                onClick={() => {
                  setSelectedTable(tableName);
                  const q = `SELECT * FROM ${tableName}`;
                  setQuery(q);
                  handleRunQuery(q);
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-slate-200">{table.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {table.rows.length} rows
                  </span>
                </div>
                <div className="space-y-0.5">
                  {table.columns.map((col) => (
                    <div key={col} className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Columns className="w-2.5 h-2.5 text-slate-500" />
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Editor & Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* SQL Query Editor */}
          <div className="h-44 border-b border-slate-800 p-3 flex flex-col bg-slate-950/90">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SQL Editor
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Supports SELECT, JOIN, WHERE, ORDER BY, LIMIT</span>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 font-mono text-sm text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Enter SQL statement here..."
            />
          </div>

          {/* Results Grid & Status Bar */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Status & Stats */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/40 text-xs font-mono">
              <div className="flex items-center gap-3">
                {result?.message ? (
                  result.message.startsWith('Error') ? (
                    <span className="flex items-center gap-1 text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {result.message}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {result.message}
                    </span>
                  )
                ) : (
                  <span className="text-slate-400">
                    Returned <strong className="text-cyan-400">{result?.rowCount ?? 0}</strong> rows
                  </span>
                )}
                {result && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    {result.executionTimeMs} ms
                  </span>
                )}
              </div>

              {result && result.rows.length > 0 && (
                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              )}
            </div>

            {/* Data Grid Table */}
            <div className="flex-1 overflow-auto p-3">
              {result && result.columns.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-cyan-400 border-b border-slate-800">
                        {result.columns.map((col) => (
                          <th key={col} className="py-2 px-3 font-semibold tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-950/60">
                      {result.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                          {result.columns.map((col) => (
                            <td key={col} className="py-2 px-3 text-slate-300">
                              {row[col] === null ? (
                                <span className="text-slate-600 italic">NULL</span>
                              ) : typeof row[col] === 'boolean' ? (
                                <span className="text-amber-400">{String(row[col])}</span>
                              ) : typeof row[col] === 'number' ? (
                                <span className="text-emerald-400">{row[col]}</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                  No records to display. Run a SELECT query to preview output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
