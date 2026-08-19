import React from 'react';
import { AppState, Task } from '../types';
import { TaskPrioritizer } from '../services/TaskPrioritizer';
import { SchedulingEngine } from '../services/SchedulingEngine';
import { DateUtils, TimeUtils } from '../utils/dateUtils';
import '../../styles/dashboard.css';

interface DashboardProps {
  state: AppState;
  onAddTask: () => void;
  onTaskClick: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export default function Dashboard({
  state,
  onAddTask,
  onTaskClick,
  onCompleteTask
}: DashboardProps) {
  const prioritizer = new TaskPrioritizer();
  const scheduler = new SchedulingEngine();

  // Get today's tasks
  const activeTasks = state.tasks.filter((t) => t.status !== 'completed');
  const todaysTasks = state.tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      (t.deadline === DateUtils.today() || !t.deadline)
  );

  // Get completed tasks today
  const completedToday = state.tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completedAt &&
      DateUtils.extractDate(t.completedAt) === DateUtils.today()
  );

  // Get next recommended task
  const nextTask = prioritizer.getNextTask(activeTasks);
  const nextTaskScore = nextTask
    ? prioritizer.calculateTaskScore(nextTask)
    : null;

  // Get overdue tasks
  const overdueTasks = activeTasks.filter(
    (t) =>
      t.deadline && DateUtils.isOverdue(t.deadline, t.status)
  );

  // Generate today's schedule
  const todaySchedule = scheduler.generateDailySchedule(
    DateUtils.today(),
    activeTasks,
    state.preferences
  );

  // Calculate completion percentage
  const completionPercentage =
    activeTasks.length === 0
      ? 0
      : Math.round((completedToday.length / (completedToday.length + activeTasks.length)) * 100);

  // Calculate time remaining
  const workdayEndMinutes = TimeUtils.timeToMinutes(state.preferences.workdayEnd);
  const workdayStartMinutes = TimeUtils.timeToMinutes(state.preferences.workdayStart);
  const totalAvailableMinutes = workdayEndMinutes - workdayStartMinutes;
  const timeRemainingMinutes = Math.max(0, totalAvailableMinutes - todaySchedule.totalTaskTime);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="date">{DateUtils.formatDate(DateUtils.today())}</p>
        </div>
        <button className="btn-primary" onClick={onAddTask}>
          + Add Task
        </button>
      </header>

      {/* Summary cards */}
      <section className="summary-cards">
        <div className="summary-card">
          <div className="card-value">{activeTasks.length}</div>
          <div className="card-label">Active Tasks</div>
        </div>
        <div className="summary-card">
          <div className="card-value">{completedToday.length}</div>
          <div className="card-label">Completed Today</div>
        </div>
        <div className="summary-card">
          <div className="card-value">{overdueTasks.length}</div>
          <div className="card-label">Overdue</div>
          {overdueTasks.length > 0 && (
            <div className="card-alert">⚠️ Action needed</div>
          )}
        </div>
        <div className="summary-card">
          <div className="card-value">{completionPercentage}%</div>
          <div className="card-label">Completion Rate</div>
        </div>
      </section>

      {/* Next task recommendation */}
      <section className="next-task-section">
        <h2>What Should I Do Now?</h2>
        {nextTask && nextTaskScore ? (
          <div className="next-task-card">
            <div className="next-task-priority" data-priority={nextTask.priority}>
              {nextTask.priority.toUpperCase()}
            </div>
            <div className="next-task-content">
              <h3>{nextTask.title}</h3>
              {nextTask.description && (
                <p className="next-task-description">{nextTask.description}</p>
              )}
              <div className="next-task-meta">
                <span className="duration">⏱️ {TimeUtils.formatDuration(nextTask.estimatedDuration)}</span>
                {nextTask.deadline && (
                  <span className="deadline">
                    📅 {DateUtils.formatDate(nextTask.deadline)}
                  </span>
                )}
              </div>
              <div className="next-task-reason">
                {nextTaskScore.reason}
              </div>
            </div>
            <button
              className="btn-start-task"
              onClick={() => onTaskClick(nextTask.id)}
            >
              Start
            </button>
            <button
              className="btn-complete"
              onClick={() => onCompleteTask(nextTask.id)}
            >
              ✓ Done
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <p>No tasks to do. Great job!</p>
            <button className="btn-secondary" onClick={onAddTask}>
              Add a task
            </button>
          </div>
        )}
      </section>

      {/* Today's schedule */}
      <section className="schedule-section">
        <h2>Today's Schedule</h2>
        <div className="schedule-info">
          <div className="schedule-stat">
            <span className="label">Task Time:</span>
            <span className="value">{TimeUtils.formatDuration(todaySchedule.totalTaskTime)}</span>
          </div>
          <div className="schedule-stat">
            <span className="label">Available:</span>
            <span className="value">{TimeUtils.formatDuration(totalAvailableMinutes)}</span>
          </div>
          <div className="schedule-stat">
            <span className="label">Remaining:</span>
            <span className="value">{TimeUtils.formatDuration(timeRemainingMinutes)}</span>
          </div>
        </div>

        {todaySchedule.blocks.length > 0 ? (
          <div className="schedule-blocks">
            {todaySchedule.blocks.map((block, idx) => (
              <div
                key={idx}
                className={`schedule-block ${block.isBreak ? 'break' : 'task'}`}
              >
                <div className="block-time">
                  {DateUtils.extractTime(block.startTime)} -{' '}
                  {DateUtils.extractTime(block.endTime)}
                </div>
                <div className="block-content">
                  {block.isBreak ? (
                    <div className="break-label">☕ Break</div>
                  ) : (
                    <div className="task-label">
                      {activeTasks.find((t) => t.id === block.taskId)?.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-schedule">No tasks scheduled for today</p>
        )}

        {todaySchedule.conflicts.length > 0 && (
          <div className="schedule-conflicts">
            {todaySchedule.conflicts.map((conflict, idx) => (
              <div key={idx} className={`conflict conflict-${conflict.severity}`}>
                ⚠️ {conflict.message}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Today's tasks list */}
      {todaysTasks.length > 0 && (
        <section className="todays-tasks-section">
          <h2>Today's Tasks</h2>
          <div className="tasks-list">
            {todaysTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="task-item">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => onCompleteTask(task.id)}
                  aria-label={`Complete task: ${task.title}`}
                />
                <div className="task-info" onClick={() => onTaskClick(task.id)}>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`priority priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="duration">
                      {TimeUtils.formatDuration(task.estimatedDuration)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
