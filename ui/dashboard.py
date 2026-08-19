from datetime import date

from nicegui import ui

from services.task_service import TaskService
from ui.components import IMPORTANCE_OPTIONS, notify_error, notify_success
from ui.tasks import confirm_delete, edit_dialog, task_dialog


def build_dashboard(user_id: int, username: str, on_logout) -> None:
    service = TaskService(user_id)
    content = ui.column().classes('page-shell')
    selected_date = {'value': date.today().isoformat()}
    reminder_state = {'signature': None}

    def render() -> None:
        content.clear()
        stats = service.stats()
        tasks = service.for_date(selected_date['value'])
        weekly = service.weekly_stats()
        day_options = {day['date']: f"{day['name']} {day['date']}" for day in weekly}
        with content:
            with ui.row().classes('page-heading items-end justify-between w-full'):
                with ui.column().classes('gap-1'):
                    ui.label('متتبع عاداتي').classes('app-title')
                    ui.label('رتب مهامك وأنجز أهم ما عليك').classes('subtitle')
                with ui.row().classes('items-center gap-2'):
                    ui.label(f'مرحبًا، {username}').classes('user-greeting')
                    ui.button('تسجيل الخروج', icon='logout', on_click=on_logout).props('flat')
                    ui.button('إضافة مهمة', icon='add', on_click=lambda: task_dialog(service, render)).props('unelevated').classes('add-button')

            with ui.element('section').classes('hero-panel'):
                with ui.column().classes('hero-copy'):
                    ui.label('نسبة إنجازك').classes('eyebrow')
                    ui.circular_progress(value=stats['percentage'] / 100, show_value=False).props('size=148px color=primary track-color=grey-3').classes('progress-circle')
                    ui.label(f"{stats['percentage']}%").classes('progress-value')
                    ui.label(service.performance_message()).classes('progress-message')

            with ui.row().classes('stats-grid'):
                stat_card('إجمالي المهام', stats['total'], 'list_alt')
                stat_card('المهام المكتملة', stats['completed'], 'check_circle')
                stat_card('المهام المتبقية', stats['remaining'], 'hourglass_empty')
                stat_card('تقييم الأسبوع', f"{service.weekly_score()}%", 'insights')

            with ui.row().classes('insight-strip w-full'):
                insight_card('أفضل يوم', service.best_day(), 'emoji_events')
                insight_card('أسوأ يوم', service.worst_day(), 'low_priority')
                insight_card('أولوية عالية مكتملة', service.high_priority_completed(), 'priority_high')

            with ui.row().classes('section-heading-row w-full items-center justify-between'):
                ui.label('مهام اليوم').classes('section-title')
                ui.label(f"{stats['remaining']} متبقية").classes('section-count')
            ui.select(day_options, value=selected_date['value'], label='اختر يومًا لعرض مهامه',
                      on_change=lambda event: change_date(event.value, selected_date, render)).props('outlined').classes('day-select')
            ui.label(f"اليوم الحالي: {date.today().strftime('%d/%m/%Y')}").classes('current-day-label')
            if not tasks:
                with ui.column().classes('empty-state w-full items-center'):
                    ui.icon('task_alt', size='42px').classes('empty-icon')
                    ui.label('لا توجد مهام في هذا اليوم').classes('empty-title')
                    ui.label('أضف مهمة لهذا اليوم وابدأ بخطوة واضحة 🚀').classes('text-muted')
            else:
                with ui.column().classes('task-list w-full'):
                    for task in tasks:
                        task_row(service, task, render)

            with ui.row().classes('section-heading-row w-full items-center justify-between'):
                ui.label('ملخص الأسبوع').classes('section-title')
                ui.label(f"تقييم الأسبوع: {service.weekly_score()}% - {weekly_score_label(service.weekly_score())}").classes('section-count')
            weekly_table(service)

    def remind_about_tasks() -> None:
        for task, event_type in service.reminder_events():
            if event_type == 'motivation':
                ui.notify(f'أحسنت! أنجزت مهمة «{task.title}»، استمر بهذا الإنجاز 🎉', type='positive', position='top', timeout=7000)
            else:
                ui.notify(f'تذكير: مرّت 4 ساعات على مهمة «{task.title}»، هل أنجزتها؟', type='warning', position='top', timeout=7000)
        today = date.today().isoformat()
        pending = [task for task in service.all() if not task.completed and task.due_date and task.due_date <= today]
        signature = tuple(task.id for task in pending)
        if pending and signature != reminder_state['signature']:
            reminder_state['signature'] = signature
            titles = '، '.join(task.title for task in pending[:3])
            suffix = f' و{len(pending) - 3} مهام أخرى' if len(pending) > 3 else ''
            ui.notify(f'تذكير: لديك {len(pending)} مهام مستحقة: {titles}{suffix}', type='warning', position='top', timeout=6000)

    render()
    remind_about_tasks()
    ui.timer(60.0, remind_about_tasks)


def stat_card(label: str, value, icon: str) -> None:
    with ui.element('article').classes('stat-card'):
        with ui.row().classes('items-center justify-between w-full'):
            ui.icon(icon).classes('stat-icon')
            ui.label(str(value)).classes('stat-value')
        ui.label(label).classes('stat-label')


def insight_card(label: str, value, icon: str) -> None:
    with ui.element('article').classes('insight-card'):
        ui.icon(icon).classes('insight-icon')
        ui.label(str(value)).classes('insight-value')
        ui.label(label).classes('insight-label')


def change_date(value: str, selected_date: dict, refresh) -> None:
    selected_date['value'] = value
    refresh()


def weekly_score_label(score: int) -> str:
    if score >= 95:
        return 'ممتاز جدًا'
    if score >= 80:
        return 'ممتاز'
    if score >= 60:
        return 'جيد'
    if score >= 40:
        return 'يحتاج تحسين'
    return 'يحتاج إلى تنظيم'


def task_row(service: TaskService, task, refresh) -> None:
    classes = 'task-row completed-task' if task.completed else 'task-row'
    with ui.row().classes(classes + ' w-full items-center'):
        def toggle(event) -> None:
            try:
                service.toggle(task.id, bool(event.value))
                refresh()
                notify_success('تم تحديث حالة المهمة ✓')
            except ValueError as error:
                notify_error(str(error))

        checkbox = ui.checkbox(value=task.completed, on_change=toggle)
        checkbox.props('aria-label="تحديد المهمة كمكتملة"')
        with ui.column().classes('task-main gap-1'):
            ui.label(task.title).classes('task-title')
            with ui.row().classes('items-center gap-3'):
                ui.label(IMPORTANCE_OPTIONS[task.importance]).classes('importance-label')
                ui.label(task.due_date_display).classes('task-date')
        with ui.row().classes('task-actions'):
            ui.button(icon='edit', on_click=lambda: edit_dialog(service, task, refresh)).props('flat round').tooltip('تعديل المهمة')
            ui.button(icon='delete', on_click=lambda: confirm_delete(service, task, refresh)).props('flat round color=negative').tooltip('حذف المهمة')


def weekly_table(service: TaskService) -> None:
    rows = service.weekly_stats()
    columns = [
        {'name': 'name', 'label': 'اليوم', 'field': 'name', 'align': 'right'},
        {'name': 'total', 'label': 'المهام', 'field': 'total', 'align': 'center'},
        {'name': 'completed', 'label': 'المكتمل', 'field': 'completed', 'align': 'center'},
        {'name': 'remaining', 'label': 'المتبقي', 'field': 'remaining', 'align': 'center'},
        {'name': 'percentage', 'label': 'النسبة', 'field': 'percentage', 'align': 'center'},
    ]
    formatted_rows = [{**row, 'percentage': f"{row['percentage']}%"} for row in rows]
    with ui.table(columns=columns, rows=formatted_rows, row_key='date').classes('weekly-table w-full').props('flat bordered'):
        pass
