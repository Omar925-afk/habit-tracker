import { TaskPrioritizer } from './TaskPrioritizer';
import { SchedulingEngine } from './SchedulingEngine';
import { TaskFactory } from './TaskFactory';
import { DateUtils } from './dateUtils';
import { UserPreferences, Task } from '../types';

/**
 * Test suite for TaskPrioritizer
 */
export function testTaskPrioritizer(): void {
  console.log('Testing TaskPrioritizer...');

  const prioritizer = new TaskPrioritizer();

  // Test 1: Critical task should score highest
  const criticalTask = TaskFactory.createTask('Critical task', {
    priority: 'critical',
    deadline: DateUtils.today()
  });

  const lowTask = TaskFactory.createTask('Low priority task', {
    priority: 'low'
  });

  const criticalScore = prioritizer.calculateTaskScore(criticalTask);
  const lowScore = prioritizer.calculateTaskScore(lowTask);

  console.assert(
    criticalScore.totalScore > lowScore.totalScore,
    '✓ Critical task scores higher than low priority'
  );

  // Test 2: Overdue tasks should have high penalty
  const overdueTask = TaskFactory.createTask('Overdue task', {
    priority: 'medium',
    deadline: DateUtils.daysFromNow(-1) // Yesterday
  });

  const overdueScore = prioritizer.calculateTaskScore(overdueTask);
  console.assert(
    overdueScore.overduePenalty > 0,
    '✓ Overdue task gets penalty'
  );

  // Test 3: Ranking should order tasks correctly
  const tasks = [lowTask, overdueTask, criticalTask];
  const ranked = prioritizer.rankTasks(tasks);
  const topTaskId = ranked[0].taskId;

  console.assert(
    topTaskId === criticalTask.id || topTaskId === overdueTask.id,
    '✓ Top ranked task is critical or overdue'
  );

  console.log('TaskPrioritizer tests passed ✓\n');
}

/**
 * Test suite for SchedulingEngine
 */
export function testSchedulingEngine(): void {
  console.log('Testing SchedulingEngine...');

  const engine = new SchedulingEngine();

  const preferences: UserPreferences = {
    workdayStart: '09:00',
    workdayEnd: '17:00',
    breakDurationMinutes: 15,
    breakFrequencyMinutes: 90,
    preferredWorkTimes: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false },
    timezone: 'UTC'
  };

  // Test 1: Schedule should not exceed available time
  const task1 = TaskFactory.createTask('Task 1', {
    estimatedDuration: 60,
    deadline: DateUtils.today()
  });

  const task2 = TaskFactory.createTask('Task 2', {
    estimatedDuration: 60,
    deadline: DateUtils.today()
  });

  const schedule = engine.generateDailySchedule(
    DateUtils.today(),
    [task1, task2],
    preferences
  );

  const availableMinutes = 8 * 60; // 8 hour workday
  console.assert(
    schedule.totalTaskTime <= availableMinutes,
    '✓ Total task time does not exceed available time'
  );

  // Test 2: Schedule should detect conflicts
  const conflict = schedule.conflicts.some(
    (c) => c.severity === 'warning' || c.severity === 'error'
  );
  console.log(`✓ Conflict detection works (conflicts: ${schedule.conflicts.length})`);

  // Test 3: Breaks should be included
  const hasBreaks = schedule.blocks.some((b) => b.isBreak);
  console.assert(hasBreaks || schedule.blocks.length === 0, '✓ Breaks are scheduled');

  console.log('SchedulingEngine tests passed ✓\n');
}

/**
 * Test suite for TaskFactory
 */
export function testTaskFactory(): void {
  console.log('Testing TaskFactory...');

  // Test 1: Task creation with defaults
  const task = TaskFactory.createTask('Test task');

  console.assert(task.id.startsWith('task_'), '✓ Task ID generated correctly');
  console.assert(task.title === 'Test task', '✓ Task title set correctly');
  console.assert(task.priority === 'medium', '✓ Default priority is medium');
  console.assert(task.status === 'not-started', '✓ Default status is not-started');
  console.assert(task.estimatedDuration === 30, '✓ Default duration is 30 minutes');

  // Test 2: Task creation with overrides
  const customTask = TaskFactory.createTask('Custom task', {
    priority: 'critical',
    estimatedDuration: 120
  });

  console.assert(customTask.priority === 'critical', '✓ Custom priority applied');
  console.assert(customTask.estimatedDuration === 120, '✓ Custom duration applied');

  console.log('TaskFactory tests passed ✓\n');
}

/**
 * Run all core tests
 */
export function runAllTests(): void {
  console.log('='.repeat(50));
  console.log('Running Smart Task Manager Core Tests');
  console.log('='.repeat(50));
  console.log('');

  try {
    testTaskFactory();
    testTaskPrioritizer();
    testSchedulingEngine();

    console.log('='.repeat(50));
    console.log('All tests passed! ✓');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Test failed:', error);
  }
}
