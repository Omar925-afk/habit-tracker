import { Task, RecurrenceType } from '../types';
import { DateUtils } from './dateUtils';

/**
 * Factory for creating new tasks with sensible defaults
 */
export class TaskFactory {
  /**
   * Create a new task with defaults
   */
  static createTask(
    title: string,
    overrides?: Partial<Task>
  ): Task {
    const now = new Date().toISOString();

    return {
      id: this.generateId(),
      title,
      description: overrides?.description || '',
      priority: overrides?.priority || 'medium',
      status: overrides?.status || 'not-started',
      deadline: overrides?.deadline || null,
      estimatedDuration: overrides?.estimatedDuration || 30,
      actualDuration: overrides?.actualDuration || 0,
      createdAt: now,
      updatedAt: now,
      scheduledStart: overrides?.scheduledStart || null,
      scheduledEnd: overrides?.scheduledEnd || null,
      category: overrides?.category || 'general',
      tags: overrides?.tags || [],
      dependencies: overrides?.dependencies || [],
      recurrence: overrides?.recurrence || { type: 'none', interval: 1, endDate: null, daysOfWeek: [] },
      progress: overrides?.progress || 0,
      completedAt: overrides?.completedAt || null,
      parentTaskId: overrides?.parentTaskId || null,
      subtasks: overrides?.subtasks || []
    };
  }

  /**
   * Generate a unique task ID
   */
  private static generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Service for handling task recurrence
 */
export class RecurrenceService {
  /**
   * Get all instances of a recurring task within a date range
   */
  static getRecurrenceInstances(
    task: Task,
    startDate: string,
    endDate: string
  ): Task[] {
    if (task.recurrence.type === 'none') {
      return [task];
    }

    const instances: Task[] = [];
    let currentDate = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T23:59:59Z');

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      const instance = this.createInstanceForDate(task, dateString);
      instances.push(instance);

      // Move to next occurrence
      currentDate = this.getNextOccurrence(currentDate, task.recurrence);
    }

    return instances;
  }

  /**
   * Get the next occurrence date for a recurring task
   */
  static getNextOccurrence(
    from: Date,
    recurrence: any
  ): Date {
    const next = new Date(from);

    switch (recurrence.type) {
      case 'daily':
        next.setDate(next.getDate() + recurrence.interval);
        break;

      case 'weekly':
        next.setDate(next.getDate() + 7 * recurrence.interval);
        break;

      case 'monthly':
        next.setMonth(next.getMonth() + recurrence.interval);
        break;

      case 'custom':
        // Custom recurrence would be handled by external logic
        break;

      case 'none':
      default:
        break;
    }

    return next;
  }

  /**
   * Create a task instance for a specific date
   */
  private static createInstanceForDate(
    template: Task,
    dateString: string
  ): Task {
    return {
      ...template,
      id: `${template.id}_${dateString}`,
      deadline: dateString,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'not-started',
      progress: 0,
      completedAt: null
    };
  }

  /**
   * Check if a task should recur on a specific date
   */
  static shouldRecurOnDate(task: Task, dateString: string): boolean {
    if (task.recurrence.type === 'none') return false;

    const deadline = task.deadline ? new Date(task.deadline + 'T00:00:00Z') : new Date();
    const targetDate = new Date(dateString + 'T00:00:00Z');

    if (targetDate < deadline) return false;
    if (task.recurrence.endDate && dateString > task.recurrence.endDate) return false;

    const daysDiff = Math.floor(
      (targetDate.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (task.recurrence.type) {
      case 'daily':
        return daysDiff % task.recurrence.interval === 0;

      case 'weekly':
        if (daysDiff % (7 * task.recurrence.interval) === 0) {
          const targetDayOfWeek = targetDate.getDay();
          return task.recurrence.daysOfWeek.includes(targetDayOfWeek);
        }
        return false;

      case 'monthly':
        return (
          daysDiff % (30 * task.recurrence.interval) === 0 &&
          targetDate.getDate() === deadline.getDate()
        );

      default:
        return false;
    }
  }

  /**
   * Generate description of recurrence
   */
  static getRecurrenceDescription(recurrence: any): string {
    if (recurrence.type === 'none') return 'Does not repeat';

    const interval = recurrence.interval > 1 ? `every ${recurrence.interval} ` : '';

    let description = '';
    switch (recurrence.type) {
      case 'daily':
        description = `${interval}day`;
        break;
      case 'weekly':
        description = `${interval}week`;
        if (recurrence.daysOfWeek?.length > 0) {
          const dayNames = recurrence.daysOfWeek.map((d) =>
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
          );
          description += ` on ${dayNames.join(', ')}`;
        }
        break;
      case 'monthly':
        description = `${interval}month`;
        break;
      default:
        description = 'Custom';
    }

    if (recurrence.endDate) {
      description += ` until ${DateUtils.formatDate(recurrence.endDate)}`;
    }

    return description;
  }
}
