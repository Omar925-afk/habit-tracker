# Quick Start Guide - Smart Task Manager

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
cd c:\Users\dell\project.py\hh.py
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app opens automatically at `http://localhost:5173`

### 3. Start Using It

#### Create Your First Task
1. Click the **"+ Add Task"** button in the top right
2. Enter: "Learn React basics"
3. Set Priority: **High**
4. Set Deadline: **Tomorrow**
5. Set Duration: **60 minutes**
6. Click **"Create Task"**

#### See It in Action
- The task appears in **Dashboard** → **Next Task** section
- It's also visible in **Today** and **Upcoming** views
- Notice the intelligent ranking and reasoning

#### Complete a Task
- Click the **checkmark** next to any task
- It moves to **Completed** view
- Progress updates in summary cards

#### Edit a Task
- Click the **pencil icon** on any task
- Modify details
- Click **"Save Changes"**

#### Delete a Task
- Click the **trash icon**
- Task is removed

---

## 📱 UI Navigation

### Left Sidebar
- **Dashboard** 📊 - Overview & recommendations
- **Today** 📅 - Today's tasks only
- **Upcoming** 🔜 - Future tasks
- **All Tasks** ✓ - Complete task list
- **Completed** ✅ - Finished tasks
- **Settings** ⚙️ - (Coming soon)

### Main Content Area
- **Top Right**: Add Task button (+)
- **Floating Button**: Quick add task
- **Task Cards**: Click to edit, checkmark to complete

---

## 🎯 Understanding the Dashboard

### Summary Cards
```
Active Tasks: 5        → Number of incomplete tasks
Completed Today: 2     → Tasks finished today
Overdue: 1             → Tasks past deadline
Completion Rate: 28%   → Progress percentage
```

### What Should I Do Now?
Shows the most important next task with:
- **Priority badge** (color-coded)
- **Task title & description**
- **Duration & deadline**
- **Reasoning** (why it's recommended)
- **Start** button (to begin working)
- **Done** button (to mark complete)

### Today's Schedule
Shows your time allocation:
- **Task Time**: How long tasks take
- **Available**: Your working hours
- **Remaining**: Time left for new work
- **Time blocks**: Visual schedule with breaks

---

## 💡 Task Prioritization Explained

The system ranks tasks automatically based on:

1. **Priority Level**
   - Critical (🔴) - Highest
   - High (🟠)
   - Medium (🔵)
   - Low (🟢)

2. **Deadline**
   - Overdue tasks get top priority
   - Due today: Very urgent
   - Due soon (3 days): Somewhat urgent
   - No deadline: Lower priority

3. **Task Age**
   - Old pending tasks get small boost
   - Encourages completing stale tasks

4. **Duration**
   - Very long tasks slightly de-prioritized
   - Encourages task decomposition

### Example Rankings
```
RANK 1: Critical task due today → 1150 score
RANK 2: Overdue high task → 920 score
RANK 3: Medium priority due tomorrow → 580 score
RANK 4: Low priority no deadline → 100 score
```

---

## 📅 Scheduling Explained

The app creates an intelligent daily schedule:

- **Respects your work hours** (default: 9 AM - 5 PM)
- **Includes breaks** automatically (15 min every 90 min)
- **Prioritizes urgent tasks** (due today/overdue)
- **Detects conflicts** (too much work for available time)
- **Respects dependencies** (doesn't schedule tasks before prerequisites)

### Example Schedule
```
09:00 - 10:15  | Task: Finish report (75 min)
10:15 - 10:30  | Break (15 min)
10:30 - 11:30  | Task: Code review (60 min)
11:30 - 11:45  | Break (15 min)
11:45 - 13:00  | Task: Team meeting (75 min)
13:00 - 14:00  | Lunch break
14:00 - 15:00  | Task: Email response (60 min)
15:00 - 15:15  | Break (15 min)
15:15 - 17:00  | Free time (105 min available)
```

---

## 🔧 Common Tasks

### Change Working Hours
1. Settings ⚙️ (coming soon)
2. For now, edit: `src/services/storage.ts`
3. Search for: `workdayStart` and `workdayEnd`

### Archive Old Tasks
1. Go to **Completed** view
2. Completed tasks accumulate there
3. Delete when no longer needed

### View Different Perspectives
- **Dashboard**: Big picture overview
- **Today**: Focus on today only
- **Upcoming**: Plan ahead
- **All Tasks**: Comprehensive view
- **Completed**: Track achievements

### Organize with Categories
1. When creating tasks, set category
2. Use meaningful names: "Work", "Personal", "Learning"
3. Filter later if category feature is added

### Use Tags for Flexibility
1. Add multiple tags per task
2. Examples: #urgent, #project-x, #team
3. Helps find related tasks

---

## 📊 Tips for Maximum Effectiveness

### 1. **Be Realistic with Duration Estimates**
- Apps work best with accurate time estimates
- Include context switching time
- Round up slightly (tasks often take longer)

### 2. **Set Clear Deadlines**
- Deadlines drive prioritization
- Even rough dates help
- Overdue tasks get attention

### 3. **Use Priority Wisely**
- Not everything is "critical"
- Save critical for truly urgent items
- Allows system to distinguish properly

### 4. **Break Down Large Tasks**
- System slightly de-prioritizes tasks > 2 hours
- Breaks improve focus
- Easier to estimate smaller chunks

### 5. **Complete Tasks Regularly**
- Checking off items is motivating
- Tracks your productivity
- Helps understand your pace

### 6. **Review Schedule Daily**
- Check dashboard each morning
- Adjust if circumstances change
- Stay aware of what's coming

---

## ⚠️ Things to Know

### Data Storage
- All data stored in browser (localStorage)
- Persists across sessions
- Clear browser data = lose tasks
- No cloud sync (yet)

### Browser Compatibility
- Works on Chrome, Firefox, Safari, Edge
- Not on very old browsers
- Mobile-friendly (but optimized for desktop)

### Performance
- Fast with 100+ tasks
- Smooth on modern computers
- May slow on older machines with 1000+ tasks

### Limitations (Current)
- No desktop notifications
- No calendar drag-and-drop (coming soon)
- No time tracking timer (coming soon)
- No cloud sync (coming soon)
- No collaboration (coming soon)

---

## 🐛 Troubleshooting

### "Tasks disappeared!"
- Check if you cleared browser data
- Check incognito mode (data is separate)
- Try different browser

### "Schedule seems wrong"
- Check your working hours setting
- Verify task durations are realistic
- Too many long tasks can cause conflicts

### "Tasks not ranked right"
- Remember: system is intentional about ranking
- Priority + deadline + urgency = final score
- Set accurate deadlines for better results

### "App is slow"
- Works best with 100-500 active tasks
- Archive or delete old completed tasks
- Refresh the page (cache reset)

---

## 📚 Learning More

For detailed information, see:
- **[README.md](README.md)** - Full documentation
- **[BUILD_SUMMARY.md](BUILD_SUMMARY.md)** - Implementation details
- Code comments in `src/` files

---

## 🎯 Your First Day Checklist

- [ ] Create 5-10 tasks you need to do
- [ ] Review dashboard and next task
- [ ] Complete at least 1 task
- [ ] Try different views (Today, Upcoming, All)
- [ ] Edit a task
- [ ] Check the schedule for conflicts

---

## 🚀 Next Steps

Once you're comfortable:
1. Explore customization options
2. Review the codebase
3. Suggest improvements
4. Contribute new features
5. Deploy your own version

---

**Happy task managing! 🎉**

The app is designed to get out of your way and let you focus on actual work.

*"The user adds tasks. The application organizes the work intelligently."*
