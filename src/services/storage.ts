import { Task, UserPreferences } from '../types';
import { DateUtils } from '../utils/dateUtils';

/**
 * Storage layer for persisting tasks and preferences.
 * Currently uses localStorage but can be swapped for IndexedDB or backend API.
 */
export class StorageService {
  private readonly TASKS_KEY = 'smart-tasks';
  private readonly PREFERENCES_KEY = 'smart-preferences';
  private readonly DEFAULT_PREFERENCES: UserPreferences = {
    workdayStart: '09:00',
    workdayEnd: '17:00',
    breakDurationMinutes: 15,
    breakFrequencyMinutes: 90,
    preferredWorkTimes: {
      0: false, // Sunday
      1: true, // Monday
      2: true, // Tuesday
      3: true, // Wednesday
      4: true, // Thursday
      5: true, // Friday
      6: false // Saturday
    },
    timezone: 'UTC'
  };

  /**
   * Load all tasks from storage
   */
  loadTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  }

  /**
   * Save all tasks to storage
   */
  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  /**
   * Load user preferences from storage
   */
  loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      return stored ? { ...this.DEFAULT_PREFERENCES, ...JSON.parse(stored) } : this.DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return this.DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save user preferences to storage
   */
  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Add a single task
   */
  addTask(task: Task): void {
    const tasks = this.loadTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  }

  /**
   * Update a single task
   */
  updateTask(taskId: string, updates: Partial<Task>): void {
    const tasks = this.loadTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveTasks(tasks);
    }
  }

  /**
   * Delete a single task
   */
  deleteTask(taskId: string): void {
    const tasks = this.loadTasks();
    this.saveTasks(tasks.filter((t) => t.id !== taskId));
  }

  /**
   * Get a single task by ID
   */
  getTask(taskId: string): Task | null {
    const tasks = this.loadTasks();
    return tasks.find((t) => t.id === taskId) || null;
  }

  /**
   * Clear all data (useful for testing/reset)
   */
  clearAll(): void {
    localStorage.removeItem(this.TASKS_KEY);
    localStorage.removeItem(this.PREFERENCES_KEY);
  }

  /**
   * Export all data as JSON
   */
  exportData(): { tasks: Task[]; preferences: UserPreferences } {
    return {
      tasks: this.loadTasks(),
      preferences: this.loadPreferences()
    };
  }

  /**
   * Import data from JSON (useful for backup/restore)
   */
  importData(data: { tasks: Task[]; preferences: UserPreferences }): void {
    this.saveTasks(data.tasks);
    this.savePreferences(data.preferences);
  }
}

/**
 * Application state management using localStorage as the source of truth
 */
export class AppStateManager {
  private storage: StorageService;
  private listeners: ((state: AppState) => void)[] = [];

  constructor(storage?: StorageService) {
    this.storage = storage || new StorageService();
  }

  /**
   * Get current app state
   */
  getState(): AppState {
    return {
      tasks: this.storage.loadTasks(),
      preferences: this.storage.loadPreferences()
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Add a task
   */
  addTask(task: Task): void {
    this.storage.addTask(task);
    this.notifyListeners();
  }

  /**
   * Update a task
   */
  updateTask(taskId: string, updates: Partial<Task>): void {
    this.storage.updateTask(taskId, updates);
    this.notifyListeners();
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: string): void {
    this.storage.deleteTask(taskId);
    this.notifyListeners();
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string): void {
    this.updateTask(taskId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration: Date.now() // This should be set when task starts/ends
    });
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    const current = this.storage.loadPreferences();
    this.storage.savePreferences({ ...current, ...preferences });
    this.notifyListeners();
  }
}

export interface AppState {
  tasks: Task[];
  preferences: UserPreferences;
}
