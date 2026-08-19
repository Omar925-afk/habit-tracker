import React from 'react';
import { Task } from '../types';
import { TimeUtils, DateUtils } from '../utils/dateUtils';
import '../../styles/task-list.css';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onTaskComplete: (taskId: string) => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function TaskList({
  tasks,
  title,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete
}: TaskListProps) {
  const [filter, setFilter] = React.useState<'all' | 'priority' | 'deadline'>('all');

  const sortedTasks = React.useMemo(() => {
    const sorted = [...tasks];

    if (filter === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    } else if (filter === 'deadline') {
      sorted.sort((a, b) => {
        if (a.deadline && b.deadline) {
          return a.deadline.localeCompare(b.deadline);
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
      });
    }

    return sorted;
  }, [tasks, filter]);

  return (
    <div className="task-list-view">
      <header className="view-header">
        <h1>{title}</h1>
        <p className="task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
      </header>

      {tasks.length > 0 && (
        <div className="list-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'priority' ? 'active' : ''}`}
              onClick={() => setFilter('priority')}
            >
              By Priority
            </button>
            <button
              className={`filter-btn ${filter === 'deadline' ? 'active' : ''}`}
              onClick={() => setFilter('deadline')}
            >
              By Deadline
            </button>
          </div>
        </div>
      )}

      <div className="tasks-container">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks here yet</p>
            <p className="secondary-text">Create one to get started</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {sortedTasks.map((task) => (
              <div key={task.id} className={`task-card status-${task.status}`}>
                <div className="task-card-header">
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => onTaskComplete(task.id)}
                      aria-label={`Complete task: ${task.title}`}
                    />
                  </div>
                  <div className="task-main-info">
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                  </div>
                  <div className="task-card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => onTaskEdit(task.id)}
                      title="Edit task"
                      aria-label={`Edit task: ${task.title}`}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => onTaskDelete(task.id)}
                      title="Delete task"
                      aria-label={`Delete task: ${task.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="task-card-meta">
                  <span className={`priority priority-${task.priority}`}>
                    {task.priority}
                  </span>

                  {task.deadline && (
                    <span className={`deadline ${DateUtils.isOverdue(task.deadline, task.status) ? 'overdue' : ''}`}>
                      📅 {DateUtils.formatDate(task.deadline)}
                    </span>
                  )}

                  <span className="duration">
                    ⏱️ {TimeUtils.formatDuration(task.estimatedDuration)}
                  </span>

                  {task.category && task.category !== 'general' && (
                    <span className="category">{task.category}</span>
                  )}
                </div>

                {task.tags.length > 0 && (
                  <div className="task-tags">
                    {task.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {task.progress > 0 && task.progress < 100 && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                    <span className="progress-text">{task.progress}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
