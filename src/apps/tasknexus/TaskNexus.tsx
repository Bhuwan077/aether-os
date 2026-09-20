import React, { useState, useEffect, useRef } from 'react';
import { TaskItem, TaskColumnId, TaskPriority, PomodoroState } from './types';
import { sound } from '../../core/audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Tag,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Architect AetherOS Virtual Kernel',
    description: 'Implement memory-safe VFS and window compositor state machine',
    column: 'done',
    priority: 'critical',
    tags: ['Architecture', 'Kernel'],
    createdAt: Date.now() - 36000000,
  },
  {
    id: 'task-2',
    title: 'Procedural Web Audio Sound Engine',
    description: 'Build zero-dependency audio synthesizer with ADSR & oscilloscope',
    column: 'done',
    priority: 'high',
    tags: ['Audio', 'DSP'],
    createdAt: Date.now() - 28000000,
  },
  {
    id: 'task-3',
    title: 'AlgoPulse Algorithmic Engine',
    description: 'Add sorting steps generation and A* heuristic pathfinding',
    column: 'in_progress',
    priority: 'high',
    tags: ['Algorithms', 'Math'],
    createdAt: Date.now() - 14000000,
  },
  {
    id: 'task-4',
    title: 'Neural Network Canvas Visualization',
    description: 'Connect dynamic synaptic weight heatmaps to MindCanvas',
    column: 'backlog',
    priority: 'medium',
    tags: ['AI', 'Canvas'],
    createdAt: Date.now() - 5000000,
  },
];

const COLUMNS: { id: TaskColumnId; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--accent)' },
  { id: 'review', label: 'Code Review', color: 'var(--warning)' },
  { id: 'done', label: 'Completed', color: 'var(--success)' },
];

export const TaskNexus: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [selectedColumn, setSelectedColumn] = useState<TaskColumnId>('backlog');

  // Pomodoro Timer State
  const [pomo, setPomo] = useState<PomodoroState>({
    timeLeft: 25 * 60,
    isRunning: false,
    mode: 'work',
    sessionsCompleted: 0,
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (pomo.isRunning) {
      timerRef.current = window.setInterval(() => {
        setPomo((prev) => {
          if (prev.timeLeft <= 1) {
            sound.playSuccess();
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });

            if (prev.mode === 'work') {
              const nextSessions = prev.sessionsCompleted + 1;
              const nextMode = nextSessions % 4 === 0 ? 'long_break' : 'short_break';
              const nextTime = nextMode === 'long_break' ? 15 * 60 : 5 * 60;
              return {
                ...prev,
                timeLeft: nextTime,
                isRunning: false,
                mode: nextMode,
                sessionsCompleted: nextSessions,
              };
            } else {
              return {
                ...prev,
                timeLeft: 25 * 60,
                isRunning: false,
                mode: 'work',
              };
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomo.isRunning]);

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    sound.playSuccess();
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      column: selectedColumn,
      priority: newPriority,
      tags: ['Engineering'],
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
  };

  const moveTask = (id: string, direction: 'prev' | 'next') => {
    sound.playClick();
    const colOrder: TaskColumnId[] = ['backlog', 'in_progress', 'review', 'done'];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const currIdx = colOrder.indexOf(t.column);
        const newIdx = direction === 'next' ? Math.min(3, currIdx + 1) : Math.max(0, currIdx - 1);
        const newCol = colOrder[newIdx];
        if (newCol === 'done' && t.column !== 'done') {
          sound.playSuccess();
          confetti({ particleCount: 50, spread: 50 });
        }
        return { ...t, column: newCol };
      })
    );
  };

  const deleteTask = (id: string) => {
    sound.playClick();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const formatPomoTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    sound.playClick();
    setPomo((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetTimer = (mode: 'work' | 'short_break' | 'long_break') => {
    sound.playClick();
    let time = 25 * 60;
    if (mode === 'short_break') time = 5 * 60;
    if (mode === 'long_break') time = 15 * 60;
    setPomo((prev) => ({ ...prev, timeLeft: time, isRunning: false, mode }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px', gap: '12px', backgroundColor: 'rgba(5, 5, 12, 0.85)' }}>
      {/* Top Banner: Pomodoro Engine & Task Quick Add */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 14px',
          borderRadius: '8px',
        }}
      >
        {/* Quick Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '320px' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            placeholder="New engineering task / milestone..."
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            className="btn-cyber"
            style={{ padding: '5px 8px', outline: 'none' }}
          >
            <option value="low" style={{ background: '#121220' }}>Low</option>
            <option value="medium" style={{ background: '#121220' }}>Medium</option>
            <option value="high" style={{ background: '#121220' }}>High</option>
            <option value="critical" style={{ background: '#121220' }}>Critical</option>
          </select>

          <button onClick={handleCreateTask} className="btn-cyber btn-cyber-primary" style={{ height: '30px' }}>
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {/* Pomodoro Timer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="var(--accent)" />
            <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: pomo.mode === 'work' ? 'var(--accent)' : 'var(--success)' }}>
              {formatPomoTime(pomo.timeLeft)}
            </span>
          </div>

          <button onClick={toggleTimer} className={`btn-cyber ${pomo.isRunning ? 'btn-cyber-primary' : ''}`} style={{ height: '30px', padding: '0 10px' }}>
            {pomo.isRunning ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => resetTimer('work')} className={`btn-cyber ${pomo.mode === 'work' ? 'btn-cyber-primary' : ''}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
              Work
            </button>
            <button onClick={() => resetTimer('short_break')} className={`btn-cyber ${pomo.mode === 'short_break' ? 'btn-cyber-primary' : ''}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
              Break
            </button>
          </div>

          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Cycles: {pomo.sessionsCompleted}
          </span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', overflow: 'hidden' }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id);

          return (
            <div
              key={col.id}
              className="glass-panel"
              style={{
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: 'rgba(8, 8, 18, 0.7)',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {col.label}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {colTasks.map((task) => {
                  let priorityColor = '#94a3b8';
                  if (task.priority === 'medium') priorityColor = 'var(--accent)';
                  if (task.priority === 'high') priorityColor = 'var(--warning)';
                  if (task.priority === 'critical') priorityColor = 'var(--error)';

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(20, 22, 38, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', lineHeight: '1.3' }}>
                          {task.title}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Delete Task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {task.description && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                          {task.description}
                        </span>
                      )}

                      {/* Footer: Priority Badge & Move Arrows */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-mono)',
                            color: priorityColor,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            border: `1px solid ${priorityColor}`,
                          }}
                        >
                          {task.priority}
                        </span>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {col.id !== 'backlog' && (
                            <button
                              onClick={() => moveTask(task.id, 'prev')}
                              className="btn-cyber"
                              style={{ padding: '2px 4px', height: '20px' }}
                              title="Move Left"
                            >
                              <ArrowLeft size={10} />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => moveTask(task.id, 'next')}
                              className="btn-cyber"
                              style={{ padding: '2px 4px', height: '20px' }}
                              title="Advance to Next Stage"
                            >
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
