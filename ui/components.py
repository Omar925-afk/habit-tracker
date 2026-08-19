from nicegui import ui

IMPORTANCE_OPTIONS = {
    3: '🔴 مهمة جدًا',
    2: '🟡 متوسطة',
    1: '🟢 منخفضة',
}


def notify_error(message: str) -> None:
    ui.notify(message, type='negative', position='top', timeout=3000)


def notify_success(message: str) -> None:
    ui.notify(message, type='positive', position='top', timeout=2000)
