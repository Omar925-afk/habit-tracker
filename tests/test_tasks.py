import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


class TaskServiceTests(unittest.TestCase):
    def test_priority_order_and_stats(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / 'tasks.db'
            with patch('database.db.DB_PATH', database_path):
                from services.task_service import TaskService
                service = TaskService(1)
                service.create('مهمة منخفضة', 1, None)
                service.create('مهمة مهمة', 3, None)
                service.create('مهمة متوسطة', 2, None)
                tasks = service.all()
                self.assertEqual([task.importance for task in tasks], [3, 2, 1])
                service.toggle(tasks[0].id, True)
                stats = service.stats()
                self.assertEqual(stats['completed'], 1)
                self.assertEqual(stats['percentage'], 33)

    def test_empty_title_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            with patch('database.db.DB_PATH', Path(directory) / 'tasks.db'):
                from services.task_service import TaskService
                service = TaskService(1)
                with self.assertRaises(ValueError):
                    service.create('   ', 2, None)

    def test_edit_completion_delete_and_weekly_score(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            with patch('database.db.DB_PATH', Path(directory) / 'tasks.db'):
                from services.task_service import TaskService
                service = TaskService(1)
                task = service.create('مهمة عالية', 3, '2026-08-19')
                service.update(task.id, 'مهمة معدلة', 2, '2026-08-19')
                service.toggle(task.id, True)
                self.assertTrue(service.all()[0].completed)
                self.assertEqual(service.weekly_score(), 100)
                self.assertEqual(service.high_priority_completed(), 0)
                service.delete(task.id)
                self.assertEqual(service.all(), [])

    def test_progress_messages(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            with patch('database.db.DB_PATH', Path(directory) / 'tasks.db'):
                from services.task_service import TaskService
                service = TaskService(1)
                self.assertIn('ابدأ', service.performance_message(0))
                self.assertIn('استمر', service.performance_message(25))
                self.assertIn('ممتاز', service.performance_message(100))

    def test_users_are_isolated(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            with patch('database.db.DB_PATH', Path(directory) / 'tasks.db'):
                from services.auth_service import AuthService
                from services.task_service import TaskService
                auth = AuthService()
                first_id = auth.register('ahmed', 'secret1')
                second_id = auth.register('sara', 'secret2')
                TaskService(first_id).create('مهمة أحمد', 2, None)
                TaskService(second_id).create('مهمة سارة', 2, None)
                self.assertEqual([task.title for task in TaskService(first_id).all()], ['مهمة أحمد'])
                self.assertEqual([task.title for task in TaskService(second_id).all()], ['مهمة سارة'])
                self.assertEqual(auth.login('ahmed', 'secret1')[0], first_id)
                with self.assertRaises(ValueError):
                    auth.login('ahmed', 'wrong')

    def test_four_hour_reminder_and_motivation(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            with patch('database.db.DB_PATH', Path(directory) / 'tasks.db'):
                from datetime import datetime, timedelta
                from contextlib import closing
                from services.task_service import TaskService
                import database.db as database
                service = TaskService(1)
                task = service.create('مهمة التذكير', 2, None)
                old_time = (datetime.now() - timedelta(hours=5)).isoformat(timespec='seconds')
                with closing(database.connect()) as connection, connection:
                    connection.execute('UPDATE tasks SET created_at = ? WHERE id = ?', (old_time, task.id))
                    connection.commit()
                self.assertEqual(service.reminder_events()[0][1], 'reminder')
                service.toggle(task.id, True)
                self.assertEqual(service.reminder_events()[0][1], 'motivation')
                self.assertEqual(service.reminder_events(), [])


if __name__ == '__main__':
    unittest.main()
