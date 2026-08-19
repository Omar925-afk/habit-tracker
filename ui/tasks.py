from nicegui import ui

from models.task import Task
from services.task_service import TaskService
from ui.components import IMPORTANCE_OPTIONS, notify_error, notify_success


def task_dialog(service: TaskService, refresh) -> None:
    with ui.dialog() as dialog, ui.card().classes('task-dialog'):
        ui.label('إضافة مهمة جديدة').classes('dialog-title')
        title = ui.input('اسم المهمة').props('outlined autofocus').classes('w-full')
        importance = ui.select(IMPORTANCE_OPTIONS, value=2, label='الأهمية').props('outlined').classes('w-full')
        due_date = ui.date(value=None).props('outlined').classes('w-full')
        with ui.row().classes('w-full justify-end gap-2'):
            ui.button('إلغاء', on_click=dialog.close).props('flat')
            def save() -> None:
                try:
                    service.create(title.value or '', int(importance.value), due_date.value)
                    dialog.close()
                    refresh()
                    notify_success('تمت إضافة المهمة')
                except (ValueError, TypeError) as error:
                    notify_error(str(error))
            ui.button('إضافة المهمة', icon='add', on_click=save).props('unelevated')
    dialog.open()


def edit_dialog(service: TaskService, task: Task, refresh) -> None:
    with ui.dialog() as dialog, ui.card().classes('task-dialog'):
        ui.label('تعديل المهمة').classes('dialog-title')
        title = ui.input('اسم المهمة', value=task.title).props('outlined autofocus').classes('w-full')
        importance = ui.select(IMPORTANCE_OPTIONS, value=task.importance, label='الأهمية').props('outlined').classes('w-full')
        due_date = ui.date(value=task.due_date).props('outlined').classes('w-full')
        with ui.row().classes('w-full justify-end gap-2'):
            ui.button('إلغاء', on_click=dialog.close).props('flat')
            def save() -> None:
                try:
                    service.update(task.id, title.value or '', int(importance.value), due_date.value)
                    dialog.close()
                    refresh()
                    notify_success('تم تحديث المهمة')
                except (ValueError, TypeError) as error:
                    notify_error(str(error))
            ui.button('حفظ التعديل', icon='save', on_click=save).props('unelevated')
    dialog.open()


def confirm_delete(service: TaskService, task: Task, refresh) -> None:
    with ui.dialog() as dialog, ui.card().classes('confirm-dialog'):
        ui.label('حذف المهمة؟').classes('dialog-title')
        ui.label(f'هل تريد حذف «{task.title}»؟').classes('text-muted')
        with ui.row().classes('w-full justify-end gap-2'):
            ui.button('إلغاء', on_click=dialog.close).props('flat')
            def remove() -> None:
                service.delete(task.id)
                dialog.close()
                refresh()
                notify_success('تم حذف المهمة')
            ui.button('حذف', icon='delete', on_click=remove).props('color=negative unelevated')
    dialog.open()
