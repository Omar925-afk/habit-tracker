import React, { useState, useEffect } from 'react';
import { AppStateManager, AppState } from './services/storage';
import { TaskPrioritizer } from './services/TaskPrioritizer';
import { SchedulingEngine } from './services/SchedulingEngine';
import { DateUtils } from './utils/dateUtils';
import { TaskFactory } from './services/TaskFactory';
import '../styles/app.css';

// Import components (will create these next)
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Navigation from './components/Navigation';

type View = 'dashboard' | 'today' | 'upcoming' | 'all-tasks' | 'completed' | 'calendar';

export default function App() {
  const [state, setState] = useState<AppState>({
    tasks: [],
    preferences: {
      workdayStart: '09:00',
      workdayEnd: '17:00',
      breakDurationMinutes: 15,
      breakFrequencyMinutes: 90,
      preferredWorkTimes: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false },
      timezone: 'UTC'
    }
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const stateManager = React.useRef(new AppStateManager());

  // Initialize state on mount
  useEffect(() => {
    const initialState = stateManager.current.getState();
    setState(initialState);

    // Subscribe to state changes
    const unsubscribe = stateManager.current.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const handleAddTask = (taskData: any) => {
    const task = TaskFactory.createTask(taskData.title, {
      description: taskData.description,
      priority: taskData.priority,
      deadline: taskData.deadline,
      estimatedDuration: taskData.estimatedDuration,
      category: taskData.category,
      tags: taskData.tags
    });

    stateManager.current.addTask(task);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (taskId: string, updates: any) => {
    stateManager.current.updateTask(taskId, updates);
    setEditingTaskId(null);
  };

  const handleCompleteTask = (taskId: string) => {
    stateManager.current.completeTask(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    stateManager.current.deleteTask(taskId);
  };

  return (
    <div className="app">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard
            state={state}
            onAddTask={() => setShowTaskForm(true)}
            onTaskClick={(taskId) => {
              setEditingTaskId(taskId);
              setShowTaskForm(true);
            }}
            onCompleteTask={handleCompleteTask}
          />
        )}

        {currentView === 'today' && (
          <TaskList
            tasks={state.tasks.filter((t) => {
              if (t.status === 'completed') return false;
              return t.deadline === DateUtils.today() || !t.deadline;
            })}
            title="Today's Tasks"
            onTaskComplete={handleCompleteTask}
            onTaskEdit={(taskId) => {
              setEditingTaskId(taskId);
              setShowTaskForm(true);
            }}
            onTaskDelete={handleDeleteTask}
          />
        )}

        {currentView === 'upcoming' && (
          <TaskList
            tasks={state.tasks.filter(
              (t) =>
                t.status !== 'completed' &&
                t.deadline &&
                t.deadline > DateUtils.today()
            )}
            title="Upcoming Tasks"
            onTaskComplete={handleCompleteTask}
            onTaskEdit={(taskId) => {
              setEditingTaskId(taskId);
              setShowTaskForm(true);
            }}
            onTaskDelete={handleDeleteTask}
          />
        )}

        {currentView === 'all-tasks' && (
          <TaskList
            tasks={state.tasks.filter((t) => t.status !== 'completed')}
            title="All Tasks"
            onTaskComplete={handleCompleteTask}
            onTaskEdit={(taskId) => {
              setEditingTaskId(taskId);
              setShowTaskForm(true);
            }}
            onTaskDelete={handleDeleteTask}
          />
        )}

        {currentView === 'completed' && (
          <TaskList
            tasks={state.tasks.filter((t) => t.status === 'completed')}
            title="Completed Tasks"
            onTaskComplete={() => {}}
            onTaskEdit={() => {}}
            onTaskDelete={handleDeleteTask}
          />
        )}
      </main>

      {showTaskForm && (
        <TaskForm
          onSubmit={editingTaskId ? (data) => handleUpdateTask(editingTaskId, data) : handleAddTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTaskId(null);
          }}
          initialTask={editingTaskId ? state.tasks.find((t) => t.id === editingTaskId) : undefined}
        />
      )}

      <button className="fab" onClick={() => setShowTaskForm(true)}>
        +
      </button>
    </div>
  );
}
