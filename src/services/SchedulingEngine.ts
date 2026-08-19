import { Task, DailySchedule, ScheduleBlock, ScheduleConflict, UserPreferences } from '../types';
import { DateUtils, TimeUtils } from './dateUtils';
import { TaskPrioritizer } from './TaskPrioritizer';

/**
 * Smart scheduling engine that creates realistic, conflict-free schedules.
 * Considers:
 * - Available working hours
 * - Task priorities and deadlines
 * - Task dependencies
 * - Breaks
 * - Existing scheduled tasks
 */
export class SchedulingEngine {
  private prioritizer: TaskPrioritizer;

  constructor() {
    this.prioritizer = new TaskPrioritizer();
  }

  /**
   * Generate a daily schedule for the specified date
   */
  generateDailySchedule(
    date: string,
    tasks: Task[],
    preferences: UserPreferences
  ): DailySchedule {
    // Get tasks that should be scheduled for this day
    const tasksForDay = this.getTasksForDay(date, tasks, preferences);

    // Rank tasks by priority
    const ranked = this.prioritizer.rankTasks(tasksForDay);

    // Generate schedule blocks
    const blocks: ScheduleBlock[] = [];
    let currentTime = TimeUtils.timeToMinutes(preferences.workdayStart);
    const workdayEnd = TimeUtils.timeToMinutes(preferences.workdayEnd);
    let nextBreakTime =
      currentTime + preferences.breakFrequencyMinutes;
    let taskIndex = 0;

    while (
      taskIndex < ranked.length &&
      currentTime < workdayEnd
    ) {
      const taskScore = ranked[taskIndex];
      const task = tasksForDay.find((t) => t.id === taskScore.taskId)!;

      // Check if task fits in remaining time
      if (currentTime + task.estimatedDuration <= workdayEnd) {
        // Add break if needed
        if (currentTime >= nextBreakTime && currentTime < workdayEnd - 15) {
          blocks.push({
            taskId: 'break',
            startTime: DateUtils.createDateTime(
              date,
              TimeUtils.minutesToTime(currentTime)
            ),
            endTime: DateUtils.createDateTime(
              date,
              TimeUtils.minutesToTime(
                currentTime + preferences.breakDurationMinutes
              )
            ),
            duration: preferences.breakDurationMinutes,
            isBreak: true
          });
          currentTime += preferences.breakDurationMinutes;
          nextBreakTime = currentTime + preferences.breakFrequencyMinutes;
        }

        // Add task
        blocks.push({
          taskId: task.id,
          startTime: DateUtils.createDateTime(
            date,
            TimeUtils.minutesToTime(currentTime)
          ),
          endTime: DateUtils.createDateTime(
            date,
            TimeUtils.minutesToTime(currentTime + task.estimatedDuration)
          ),
          duration: task.estimatedDuration,
          isBreak: false
        });

        currentTime += task.estimatedDuration;
      } else {
        // Task doesn't fit - skip for now (will be rescheduled)
        taskIndex++;
        continue;
      }

      taskIndex++;
    }

    // Calculate summary
    const totalTaskTime = blocks
      .filter((b) => !b.isBreak)
      .reduce((sum, b) => sum + b.duration, 0);
    const totalAvailableTime = workdayEnd - TimeUtils.timeToMinutes(preferences.workdayStart);

    // Detect conflicts
    const conflicts = this.detectConflicts(blocks, totalAvailableTime, totalTaskTime);

    return {
      date,
      blocks,
      totalTaskTime,
      totalAvailableTime,
      conflicts,
      isOptimal: conflicts.length === 0
    };
  }

  /**
   * Get tasks that should be scheduled for a specific day
   */
  private getTasksForDay(
    date: string,
    allTasks: Task[],
    preferences: UserPreferences
  ): Task[] {
    const dayOfWeek = DateUtils.getDayOfWeek(date);

    return allTasks.filter((task) => {
      // Exclude completed tasks
      if (task.status === 'completed') return false;

      // Include if it's already scheduled for this day
      if (task.scheduledStart && DateUtils.extractDate(task.scheduledStart) === date) {
        return true;
      }

      // Include if deadline is today or before
      if (task.deadline && task.deadline <= date) {
        return true;
      }

      // Include if deadline is within 3 days
      if (task.deadline && DateUtils.daysUntil(task.deadline) <= 3) {
        return true;
      }

      // Include overdue tasks
      if (task.deadline && DateUtils.isOverdue(task.deadline, task.status)) {
        return true;
      }

      // Respect user's preferred working days
      if (!preferences.preferredWorkTimes[dayOfWeek]) {
        return false;
      }

      return false;
    });
  }

  /**
   * Detect scheduling conflicts and issues
   */
  private detectConflicts(
    blocks: ScheduleBlock[],
    totalAvailableTime: number,
    totalTaskTime: number
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    if (totalTaskTime > totalAvailableTime) {
      conflicts.push({
        message: `Too much work scheduled (${TimeUtils.formatDuration(
          totalTaskTime
        )}) for available time (${TimeUtils.formatDuration(
          totalAvailableTime
        )}). Some tasks will need to be rescheduled.`,
        taskIds: blocks
          .filter((b) => !b.isBreak)
          .map((b) => b.taskId)
          .slice(-3), // Last 3 tasks are likely to be rescheduled
        severity: 'warning'
      });
    }

    // Check for overlapping tasks
    const taskBlocks = blocks.filter((b) => !b.isBreak);
    for (let i = 0; i < taskBlocks.length - 1; i++) {
      const current = taskBlocks[i];
      const next = taskBlocks[i + 1];

      if (current.endTime > next.startTime) {
        conflicts.push({
          message: 'Task overlap detected',
          taskIds: [current.taskId, next.taskId],
          severity: 'error'
        });
      }
    }

    return conflicts;
  }

  /**
   * Reschedule a task to the next available time slot
   */
  rescheduleTask(
    task: Task,
    allTasks: Task[],
    startDate: string,
    preferences: UserPreferences
  ): string | null {
    let currentDate = startDate;
    const maxDaysToCheck = 30;

    for (let i = 0; i < maxDaysToCheck; i++) {
      const schedule = this.generateDailySchedule(
        currentDate,
        allTasks,
        preferences
      );

      // Check if task fits in this day's schedule
      const availableTime = schedule.totalAvailableTime - schedule.totalTaskTime;
      if (availableTime >= task.estimatedDuration) {
        // Find the last block time
        const lastBlock = schedule.blocks[schedule.blocks.length - 1];
        if (lastBlock) {
          const lastBlockEnd = new Date(lastBlock.endTime).getTime();
          const newStart = new Date(lastBlockEnd + preferences.breakDurationMinutes * 60 * 1000);
          return newStart.toISOString();
        }
      }

      // Try next day
      currentDate = DateUtils.daysFromNow(i + 1);
    }

    return null;
  }

  /**
   * Check if a schedule is feasible (all tasks can be scheduled)
   */
  isScheduleFeasible(
    tasks: Task[],
    dateRange: { start: string; end: string },
    preferences: UserPreferences
  ): { feasible: boolean; unscheduledTasks: string[] } {
    const unscheduledTasks: string[] = [];
    let currentDate = dateRange.start;

    const tasksCopy = JSON.parse(JSON.stringify(tasks));

    while (currentDate <= dateRange.end) {
      const schedule = this.generateDailySchedule(
        currentDate,
        tasksCopy,
        preferences
      );

      // Check if there were scheduling conflicts
      if (!schedule.isOptimal) {
        // Some tasks couldn't fit
        const scheduledIds = schedule.blocks
          .filter((b) => !b.isBreak)
          .map((b) => b.taskId);
        const dayTasks = tasksCopy.filter(
          (t) =>
            t.deadline <= currentDate ||
            (t.deadline && DateUtils.daysUntil(t.deadline) <= 3)
        );

        dayTasks.forEach((t) => {
          if (!scheduledIds.includes(t.id)) {
            unscheduledTasks.push(t.id);
          }
        });
      }

      currentDate = DateUtils.daysFromNow(
        DateUtils.daysUntil(currentDate) + 1
      );
    }

    return {
      feasible: unscheduledTasks.length === 0,
      unscheduledTasks
    };
  }
}
