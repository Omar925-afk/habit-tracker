from __future__ import annotations

from datetime import date, datetime, timedelta
import logging
from typing import Optional

from database import db
from models.task import Task

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self, user_id: int) -> None:
        if not isinstance(user_id, int) or user_id <= 0:
            raise ValueError('المستخدم غير صحيح')
        self.user_id = user_id
        db.init_db()

    def all(self) -> list[Task]:
        return db.list_tasks(self.user_id)

    def for_date(self, due_date: str) -> list[Task]:
        return [task for task in self.all() if task.due_date == due_date]

    @staticmethod
    def _validate_due_date(due_date: Optional[str]) -> None:
        if due_date:
            try:
                date.fromisoformat(due_date)
            except ValueError as exc:
                raise ValueError('التاريخ غير صحيح') from exc

    def _validate_task_id(self, task_id: int) -> None:
        if not isinstance(task_id, int) or task_id <= 0:
            raise ValueError('رقم المهمة غير صحيح')
        if db.get_task(task_id, self.user_id) is None:
            raise ValueError('المهمة غير موجودة')

    def create(self, title: str, importance: int, due_date: Optional[str]) -> Task:
        title = title.strip()
        if not title:
            raise ValueError('اكتب اسم المهمة أولًا')
        if importance not in (1, 2, 3):
            raise ValueError('اختر أهمية صحيحة')
        self._validate_due_date(due_date)
        logger.info('Creating task: %s', title)
        return db.add_task(self.user_id, title, importance, due_date)

    def update(self, task_id: int, title: str, importance: int, due_date: Optional[str]) -> None:
        if not title.strip():
            raise ValueError('اكتب اسم المهمة أولًا')
        if importance not in (1, 2, 3):
            raise ValueError('اختر أهمية صحيحة')
        self._validate_task_id(task_id)
        self._validate_due_date(due_date)
        db.update_task(self.user_id, task_id, title, importance, due_date)

    def toggle(self, task_id: int, completed: bool) -> None:
        self._validate_task_id(task_id)
        if not isinstance(completed, bool):
            raise ValueError('حالة الإكمال غير صحيحة')
        db.set_completed(self.user_id, task_id, completed)

    def delete(self, task_id: int) -> None:
        self._validate_task_id(task_id)
        logger.info('Deleting task: %s', task_id)
        db.delete_task(self.user_id, task_id)

    def stats(self) -> dict:
        tasks = self.all()
        completed = sum(task.completed for task in tasks)
        return {
            'total': len(tasks),
            'completed': completed,
            'remaining': len(tasks) - completed,
            'percentage': round(completed / len(tasks) * 100) if tasks else 0,
        }

    def weekly_stats(self) -> list[dict]:
        today = date.today()
        saturday = today - timedelta(days=(today.weekday() + 2) % 7)
        tasks = self.all()
        output = []
        names = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
        for offset, name in enumerate(names):
            day = saturday + timedelta(days=offset)
            day_value = day.isoformat()
            day_tasks = [task for task in tasks if task.due_date == day_value]
            done = sum(task.completed for task in day_tasks)
            output.append({'name': name, 'date': day_value, 'total': len(day_tasks), 'completed': done,
                           'remaining': len(day_tasks) - done,
                           'percentage': round(done / len(day_tasks) * 100) if day_tasks else 0,
                           'today': day == today})
        return output

    def best_day(self) -> str:
        days = self.weekly_stats()
        best = max(days, key=lambda item: item['completed'], default=None)
        return best['name'] if best and best['completed'] else 'لا يوجد بعد'

    def worst_day(self) -> str:
        days_with_tasks = [day for day in self.weekly_stats() if day['total']]
        worst = min(days_with_tasks, key=lambda item: item['percentage'], default=None)
        return worst['name'] if worst else 'لا يوجد بعد'

    def weekly_score(self) -> int:
        days = self.weekly_stats()
        total = sum(day['total'] for day in days)
        completed = sum(day['completed'] for day in days)
        return round(completed / total * 100) if total else 0

    def high_priority_completed(self) -> int:
        return sum(task.completed and task.importance == 3 for task in self.all())

    def performance_message(self, percentage: Optional[int] = None) -> str:
        value = self.stats()['percentage'] if percentage is None else percentage
        if value == 0:
            return 'ابدأ أول مهمة لك اليوم 🚀'
        if value < 50:
            return 'استمر، أنت بدأت الطريق 💪'
        if value < 80:
            return 'أداء جيد، كمل! 🔥'
        if value < 100:
            return 'ممتاز جدًا، قربت تخلص! 🔥'
        return '🎉 ممتاز! أنجزت كل مهامك!'

    def reminder_events(self) -> list[tuple[Task, str]]:
        cutoff = datetime.now() - timedelta(hours=4)
        events = []
        for task in self.all():
            try:
                created_at = datetime.fromisoformat(task.created_at)
            except ValueError:
                continue
            if created_at > cutoff:
                continue
            if task.completed and not task.motivation_sent:
                db.mark_reminder_sent(self.user_id, task.id, motivation=True)
                events.append((task, 'motivation'))
            elif not task.completed and not task.reminder_sent:
                db.mark_reminder_sent(self.user_id, task.id)
                events.append((task, 'reminder'))
        return events

    def average_week(self) -> int:
        days = self.weekly_stats()
        return round(sum(day['percentage'] for day in days) / len(days)) if days else 0
