from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional


@dataclass(slots=True)
class Task:
    id: int
    title: str
    importance: int
    completed: bool
    created_at: str
    completed_at: Optional[str]
    due_date: Optional[str]
    reminder_sent: bool = False
    motivation_sent: bool = False

    @property
    def importance_label(self) -> str:
        return {3: 'مهمة جدًا', 2: 'متوسطة', 1: 'منخفضة'}.get(self.importance, 'متوسطة')

    @property
    def importance_color(self) -> str:
        return {3: '#d95c5c', 2: '#d59b32', 1: '#4d9b73'}.get(self.importance, '#d59b32')

    @property
    def due_date_display(self) -> str:
        if not self.due_date:
            return 'بدون تاريخ'
        try:
            return date.fromisoformat(self.due_date).strftime('%d/%m/%Y')
        except ValueError:
            return self.due_date

    @classmethod
    def from_row(cls, row: tuple) -> 'Task':
        return cls(*row)
