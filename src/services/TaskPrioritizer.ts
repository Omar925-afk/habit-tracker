import { Task, TaskScore, TaskPriority } from '../types';
import { DateUtils, TimeUtils } from './dateUtils';

/**
 * Intelligent task prioritization engine.
 * Calculates a dynamic task score based on multiple factors:
 * - Priority level
 * - Deadline urgency
 * - Time remaining before deadline
 * - Estimated duration
 * - Task age
 * - Overdue status
 * - Preferred time
 */
export class TaskPrioritizer {
  private readonly priorityWeights: Record<TaskPriority, number> = {
    critical: 1000,
    high: 600,
    medium: 300,
    low: 100
  };

  /**
   * Calculate a comprehensive score for a single task
   */
  calculateTaskScore(task: Task): TaskScore {
    if (task.status === 'completed') {
      return {
        taskId: task.id,
        totalScore: 0,
        priorityScore: 0,
        urgencyScore: 0,
        overduePenalty: 0,
        effortPenalty: 0,
        reason: 'Task is completed'
      };
    }

    const priorityScore = this.calculatePriorityScore(task.priority);
    const urgencyScore = task.deadline
      ? this.calculateUrgencyScore(task.deadline)
      : 0;
    const overduePenalty = task.deadline
      ? this.calculateOverduePenalty(task.deadline, task.status)
      : 0;
    const effortPenalty = this.calculateEffortPenalty(task.estimatedDuration);
    const ageBonus = this.calculateAgeBonus(task.createdAt);

    const totalScore =
      priorityScore + urgencyScore + overduePenalty + ageBonus - effortPenalty;

    const reason = this.generateScoreReason(task, {
      priorityScore,
      urgencyScore,
      overduePenalty,
      effortPenalty
    });

    return {
      taskId: task.id,
      totalScore: Math.max(0, totalScore),
      priorityScore,
      urgencyScore,
      overduePenalty,
      effortPenalty,
      reason
    };
  }

  /**
   * Score all tasks and return sorted list
   */
  rankTasks(tasks: Task[]): TaskScore[] {
    return tasks
      .map((task) => this.calculateTaskScore(task))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Get the next recommended task
   */
  getNextTask(tasks: Task[]): Task | null {
    const availableTasks = tasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'paused'
    );

    if (availableTasks.length === 0) return null;

    const ranked = this.rankTasks(availableTasks);
    const topScore = ranked[0];

    return availableTasks.find((t) => t.id === topScore.taskId) || null;
  }

  /**
   * Check dependencies - a task can only be recommended if all dependencies are completed
   */
  canRecommendTask(task: Task, allTasks: Task[]): boolean {
    if (task.dependencies.length === 0) return true;

    return task.dependencies.every((depId) => {
      const depTask = allTasks.find((t) => t.id === depId);
      return depTask && depTask.status === 'completed';
    });
  }

  private calculatePriorityScore(priority: TaskPriority): number {
    return this.priorityWeights[priority];
  }

  private calculateUrgencyScore(deadline: string): number {
    const daysUntil = DateUtils.daysUntil(deadline);

    if (daysUntil < 0) return 0; // Past deadline handled by overduePenalty
    if (daysUntil === 0) return 500; // Due today - very urgent
    if (daysUntil === 1) return 300; // Due tomorrow - quite urgent
    if (daysUntil <= 3) return 150; // Within 3 days - somewhat urgent
    if (daysUntil <= 7) return 50; // Within a week - mildly urgent
    return 0; // Beyond a week - not urgent yet
  }

  private calculateOverduePenalty(
    deadline: string,
    status: string
  ): number {
    if (DateUtils.isOverdue(deadline, status)) {
      const daysOverdue = Math.abs(DateUtils.daysUntil(deadline));
      return 200 + daysOverdue * 100; // Heavy penalty for overdue tasks
    }
    return 0;
  }

  private calculateEffortPenalty(estimatedDuration: number): number {
    // Slightly reduce score for very long tasks to encourage breaking them down
    // But keep the penalty small so priority still dominates
    if (estimatedDuration > 240) return 50; // > 4 hours
    if (estimatedDuration > 120) return 25; // > 2 hours
    return 0;
  }

  private calculateAgeBonus(createdAt: string): number {
    // Slightly boost tasks that have been pending for a while
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation >= 14) return 100;
    if (daysSinceCreation >= 7) return 50;
    if (daysSinceCreation >= 3) return 20;
    return 0;
  }

  private generateScoreReason(
    task: Task,
    scores: {
      priorityScore: number;
      urgencyScore: number;
      overduePenalty: number;
      effortPenalty: number;
    }
  ): string {
    const reasons = [];

    if (task.priority === 'critical') {
      reasons.push('Critical priority');
    } else if (task.priority === 'high') {
      reasons.push('High priority');
    }

    if (scores.overduePenalty > 0) {
      reasons.push('Overdue');
    } else if (task.deadline) {
      const daysUntil = DateUtils.daysUntil(task.deadline);
      if (daysUntil === 0) {
        reasons.push('Due today');
      } else if (daysUntil === 1) {
        reasons.push('Due tomorrow');
      } else if (daysUntil > 0 && daysUntil <= 7) {
        reasons.push(`Due in ${daysUntil} days`);
      }
    }

    if (scores.effortPenalty > 0) {
      reasons.push('Long task - consider breaking down');
    }

    if (reasons.length === 0) {
      reasons.push('Available for scheduling');
    }

    return reasons.join(' • ');
  }
}
