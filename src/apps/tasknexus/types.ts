export type TaskColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  column: TaskColumnId;
  priority: TaskPriority;
  tags: string[];
  createdAt: number;
}

export interface PomodoroState {
  timeLeft: number; // seconds
  isRunning: boolean;
  mode: 'work' | 'short_break' | 'long_break';
  sessionsCompleted: number;
}
