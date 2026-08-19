// Core type definitions for the task management system

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null; // ISO date string
  estimatedDuration: number; // in minutes
  actualDuration: number; // in minutes
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  scheduledStart: string | null; // ISO datetime
  scheduledEnd: string | null; // ISO datetime
  category: string;
  tags: string[];
  dependencies: string[]; // task IDs
  recurrence: RecurrenceRule;
  progress: number; // 0-100
  completedAt: string | null; // ISO datetime
  parentTaskId: string | null; // for subtasks
  subtasks: string[]; // subtask IDs
}

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // every N days/weeks/months
  endDate: string | null; // ISO date string or null for infinite
  daysOfWeek: number[]; // 0-6 for weekly recurrence
}

export interface TaskScore {
  taskId: string;
  totalScore: number;
  priorityScore: number;
  urgencyScore: number;
  overduePenalty: number;
  effortPenalty: number;
  reason: string;
}

export interface ScheduleBlock {
  taskId: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  duration: number; // minutes
  isBreak: boolean;
}

export interface DailySchedule {
  date: string; // ISO date
  blocks: ScheduleBlock[];
  totalTaskTime: number;
  totalAvailableTime: number;
  conflicts: ScheduleConflict[];
  isOptimal: boolean;
}

export interface ScheduleConflict {
  message: string;
  taskIds: string[];
  severity: 'warning' | 'error';
}

export interface UserPreferences {
  workdayStart: string; // HH:MM format
  workdayEnd: string; // HH:MM format
  breakDurationMinutes: number;
  breakFrequencyMinutes: number;
  preferredWorkTimes: { [dayOfWeek: number]: boolean }; // 0-6
  timezone: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
  searchText?: string;
}

export interface DashboardSummary {
  totalTasks: number;
  completedToday: number;
  completionPercentage: number;
  overdueTasks: number;
  todaysTasks: Task[];
  nextRecommendedTask: Task | null;
  timeRemainingToday: number; // minutes
}
