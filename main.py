from pathlib import Path
import logging

from nicegui import ui

from database.db import init_db
from services.auth_service import AuthService
from ui.dashboard import build_dashboard

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
init_db()

ui.add_css(Path(__file__).parent.joinpath('styles', 'habit_tracker.css').read_text(encoding='utf-8'), shared=True)


@ui.page('/')
def index() -> None:
	auth = AuthService()
	content = ui.column().classes('auth-shell')

	def show_auth() -> None:
		content.clear()
		with content:
			ui.label('متتبع عاداتي').classes('app-title')
			ui.label('أنشئ حسابك لتحتفظ بمهامك بشكل مستقل').classes('subtitle')
			mode = {'value': 'login'}
			title = ui.label('تسجيل الدخول').classes('dialog-title')
			username = ui.input('اسم المستخدم').props('outlined autofocus').classes('w-full')
			password = ui.input('كلمة المرور', password=True, password_toggle_button=True).props('outlined').classes('w-full')
			message = ui.label('').classes('auth-error')

			def submit() -> None:
				try:
					if mode['value'] == 'login':
						user_id, display_name = auth.login(username.value or '', password.value or '')
					else:
						user_id = auth.register(username.value or '', password.value or '')
						display_name = username.value.strip()
					content.clear()
					build_dashboard(user_id, display_name, show_auth)
				except ValueError as error:
					message.set_text(str(error))

			def switch_mode() -> None:
				mode['value'] = 'register' if mode['value'] == 'login' else 'login'
				title.set_text('إنشاء حساب جديد' if mode['value'] == 'register' else 'تسجيل الدخول')
				action.set_text('إنشاء الحساب' if mode['value'] == 'register' else 'دخول')
				switch.set_text('لديك حساب؟ تسجيل الدخول' if mode['value'] == 'register' else 'ليس لديك حساب؟ إنشاء حساب')
				message.set_text('')

			action = ui.button('دخول', icon='login', on_click=submit).props('unelevated').classes('auth-action')
			switch = ui.button('ليس لديك حساب؟ إنشاء حساب', on_click=switch_mode).props('flat')

	show_auth()


import os

if __name__ in {"__main__", "__mp_main__"}:
	ui.run(
		host="0.0.0.0",
		port=int(os.environ.get("PORT", "8080")),
		title="متتبع عاداتي",
		reload=False,
	)
