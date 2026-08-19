# Smart Task Manager

An intelligent task management and scheduling application built with React, TypeScript, and modern web technologies.

## Features

- **Intelligent Task Prioritization**: Dynamic scoring system based on priority, deadline, age, and urgency
- **Smart Scheduling Engine**: Automatically generates realistic daily schedules considering available time and dependencies
- **Real-time Recommendations**: "What should I do now?" feature with reasoning
- **Task Management**: Create, edit, delete, and complete tasks with full customization
- **Multiple Views**: Dashboard, Today, Upcoming, All Tasks, Completed tasks
- **Persistent Storage**: All data stored locally in browser (localStorage)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Project Structure

```
src/
├── components/          # React UI components
│   ├── Dashboard.tsx
│   ├── TaskList.tsx
│   ├── TaskForm.tsx
│   └── Navigation.tsx
├── services/            # Business logic
│   ├── TaskPrioritizer.ts   # Priority scoring
│   ├── SchedulingEngine.ts  # Schedule generation
│   ├── TaskFactory.ts       # Task creation and recurrence
│   ├── storage.ts           # Persistence layer
│   └── tests.ts             # Core logic tests
├── utils/               # Utility functions
│   └── dateUtils.ts     # Date/time calculations
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main application component
└── main.tsx             # Entry point
styles/
├── globals.css          # Global styles and variables
├── app.css              # App layout
├── navigation.css       # Navigation styling
├── dashboard.css        # Dashboard styling
├── task-list.css        # Task list styling
└── task-form.css        # Form styling
```

## Architecture

### UI Layer
React components for the user interface:
- Dashboard: Main view with summary and recommendations
- TaskForm: Modal for creating/editing tasks
- TaskList: Grid view of tasks with filtering
- Navigation: Sidebar navigation

### State Layer
React state management with localStorage persistence:
- AppStateManager: Centralized state management
- StorageService: localStorage wrapper

### Business Logic
Independent services for core functionality:
- **TaskPrioritizer**: Calculates dynamic task scores based on:
  - Priority level (critical, high, medium, low)
  - Deadline urgency (overdue, due today, due soon)
  - Task age (bonus for old pending tasks)
  - Effort penalty (slight reduction for very long tasks)
  - Dependencies (tasks block dependent tasks)

- **SchedulingEngine**: Generates realistic daily schedules:
  - Respects available working hours
  - Includes automatic breaks
  - Detects scheduling conflicts
  - Respects task dependencies
  - Can reschedule tasks intelligently

- **TaskFactory**: Creates tasks with defaults and handles recurrence
- **RecurrenceService**: Generates recurring task instances

### Data Layer
- LocalStorage persistence for all data
- Structured task model with full metadata
- User preferences storage

### Utilities
- Date/time calculations
- Input validation
- Duration formatting
- Time parsing and conversion

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

The app will open in your default browser at `http://localhost:5173`

## Usage

### Creating a Task
1. Click the "+" button or "Add Task" in the dashboard
2. Enter task details (only title is required)
3. Set priority, deadline, duration, category, and tags
4. Click "Create Task"

### Prioritization
The system automatically ranks tasks by:
- Critical/Overdue: Highest priority
- Due Today: Very urgent
- Due Soon (3 days): Somewhat urgent
- Age: Old tasks get slightly boosted
- Dependencies: Tasks are only recommended when prerequisites are done

### Scheduling
- Dashboard shows today's recommended schedule
- System considers:
  - Available working hours (default 9 AM - 5 PM)
  - Break frequency and duration
  - Task priorities and deadlines
  - Task dependencies

### Views
- **Dashboard**: Summary, next task recommendation, today's schedule
- **Today**: Tasks due today or without deadline
- **Upcoming**: Tasks with future deadlines
- **All Tasks**: Complete view of active tasks
- **Completed**: Archive of finished tasks

## Customization

### Change Working Hours
Edit the default preferences in `src/services/storage.ts`:
```typescript
workdayStart: '09:00',
workdayEnd: '17:00'
```

### Adjust Priority Weights
Modify `TaskPrioritizer` in `src/services/TaskPrioritizer.ts`:
```typescript
private readonly priorityWeights = {
  critical: 1000,
  high: 600,
  medium: 300,
  low: 100
}
```

### Tune Scheduling Algorithm
Edit the scheduling logic in `src/services/SchedulingEngine.ts` to adjust:
- Break frequency and duration
- Conflict detection rules
- Rescheduling strategy

## Data Model

### Task
```typescript
{
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed' | 'paused'
  deadline: string | null  // ISO date
  estimatedDuration: number  // minutes
  actualDuration: number  // minutes
  createdAt: string  // ISO datetime
  updatedAt: string  // ISO datetime
  scheduledStart: string | null  // ISO datetime
  scheduledEnd: string | null  // ISO datetime
  category: string
  tags: string[]
  dependencies: string[]  // task IDs
  recurrence: RecurrenceRule
  progress: number  // 0-100
  completedAt: string | null
  parentTaskId: string | null
  subtasks: string[]
}
```

## Testing

Core business logic includes tests for:
- Task prioritization and ranking
- Schedule generation and conflict detection
- Task factory and recurrence
- Date/time utilities

Run tests:
```bash
npm run test
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance Considerations

- Efficient task filtering and ranking
- Memoized schedule generation
- Lazy-loaded components
- Minimal re-renders with React optimization

## Accessibility

- Full keyboard navigation
- Semantic HTML
- ARIA labels and roles
- Sufficient color contrast
- Focus indicators
- Screen reader support

## Future Enhancements

- [ ] Cloud synchronization (sync across devices)
- [ ] Calendar view with drag-and-drop scheduling
- [ ] Time tracking integration
- [ ] Analytics dashboard
- [ ] Recurring task auto-generation
- [ ] Task templates
- [ ] Collaboration features
- [ ] Desktop notifications
- [ ] Mobile app version
- [ ] Export/import functionality

## License

MIT

## Author

Smart Task Manager - Built as a demonstration of intelligent task management architecture.
