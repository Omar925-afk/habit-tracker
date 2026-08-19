from __future__ import annotations

import sqlite3
from pathlib import Path
from contextlib import closing
from datetime import datetime
from typing import Optional

from models.task import Task

DB_PATH = Path(__file__).resolve().parent.parent / 'habit_tracker.db'


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with closing(connect()) as connection, connection:
        connection.execute(
            '''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )'''
        )
        connection.execute(
            '''CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL CHECK(length(trim(title)) > 0),
                importance INTEGER NOT NULL CHECK(importance BETWEEN 1 AND 3),
                completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
                created_at TEXT NOT NULL,
                completed_at TEXT,
                due_date TEXT
            )'''
        )
        task_columns = {row['name'] for row in connection.execute('PRAGMA table_info(tasks)').fetchall()}
        if 'user_id' not in task_columns:
            connection.execute('ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)')
        if 'reminder_sent' not in task_columns:
            connection.execute('ALTER TABLE tasks ADD COLUMN reminder_sent INTEGER NOT NULL DEFAULT 0')
        if 'motivation_sent' not in task_columns:
            connection.execute('ALTER TABLE tasks ADD COLUMN motivation_sent INTEGER NOT NULL DEFAULT 0')
        connection.commit()


def _task_from_row(row: sqlite3.Row) -> Task:
    return Task(
        id=row['id'], title=row['title'], importance=row['importance'],
        completed=bool(row['completed']), created_at=row['created_at'],
        completed_at=row['completed_at'], due_date=row['due_date'],
        reminder_sent=bool(row['reminder_sent']), motivation_sent=bool(row['motivation_sent'])
    )


def list_tasks(user_id: int) -> list[Task]:
    with closing(connect()) as connection, connection:
        rows = connection.execute(
            '''SELECT id, title, importance, completed, created_at, completed_at, due_date, reminder_sent, motivation_sent
               FROM tasks WHERE user_id = ?
               ORDER BY completed ASC, importance DESC, due_date IS NULL ASC, due_date ASC, id DESC''',
            (user_id,),
        ).fetchall()
    return [_task_from_row(row) for row in rows]


def get_task(task_id: int, user_id: int) -> Optional[Task]:
    with closing(connect()) as connection, connection:
        row = connection.execute(
            'SELECT id, title, importance, completed, created_at, completed_at, due_date, reminder_sent, motivation_sent FROM tasks WHERE id = ? AND user_id = ?',
            (task_id, user_id),
        ).fetchone()
    return _task_from_row(row) if row else None


def add_task(user_id: int, title: str, importance: int, due_date: Optional[str]) -> Task:
    now = datetime.now().isoformat(timespec='seconds')
    with closing(connect()) as connection, connection:
        cursor = connection.execute(
            'INSERT INTO tasks (user_id, title, importance, created_at, due_date) VALUES (?, ?, ?, ?, ?)',
            (user_id, title.strip(), importance, now, due_date or None),
        )
        task_id = cursor.lastrowid
        connection.commit()
    return get_task(int(task_id), user_id)  # type: ignore[arg-type]


def update_task(user_id: int, task_id: int, title: str, importance: int, due_date: Optional[str]) -> None:
    with closing(connect()) as connection, connection:
        connection.execute(
            'UPDATE tasks SET title = ?, importance = ?, due_date = ? WHERE id = ? AND user_id = ?',
            (title.strip(), importance, due_date or None, task_id, user_id),
        )
        connection.commit()


def set_completed(user_id: int, task_id: int, completed: bool) -> None:
    completed_at = datetime.now().isoformat(timespec='seconds') if completed else None
    with closing(connect()) as connection, connection:
        connection.execute(
            'UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
            (int(completed), completed_at, task_id, user_id),
        )
        connection.commit()


def delete_task(user_id: int, task_id: int) -> None:
    with closing(connect()) as connection, connection:
        connection.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', (task_id, user_id))
        connection.commit()


def mark_reminder_sent(user_id: int, task_id: int, motivation: bool = False) -> None:
    column = 'motivation_sent' if motivation else 'reminder_sent'
    with closing(connect()) as connection, connection:
        connection.execute(f'UPDATE tasks SET {column} = 1 WHERE id = ? AND user_id = ?', (task_id, user_id))
        connection.commit()


def count_users() -> int:
    with closing(connect()) as connection, connection:
        return int(connection.execute('SELECT COUNT(*) FROM users').fetchone()[0])


def create_user(username: str, password_hash: str) -> int:
    now = datetime.now().isoformat(timespec='seconds')
    with closing(connect()) as connection, connection:
        cursor = connection.execute(
            'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
            (username, password_hash, now),
        )
        user_id = int(cursor.lastrowid)
        connection.execute('UPDATE tasks SET user_id = ? WHERE user_id IS NULL', (user_id,))
        connection.commit()
    return user_id


def get_user(username: str) -> Optional[sqlite3.Row]:
    with closing(connect()) as connection, connection:
        return connection.execute(
            'SELECT id, username, password_hash FROM users WHERE username = ?', (username,)
        ).fetchone()
