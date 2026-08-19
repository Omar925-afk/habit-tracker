from __future__ import annotations

import hashlib
import hmac
import logging
import secrets

from database import db

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self) -> None:
        db.init_db()

    def register(self, username: str, password: str) -> int:
        username = username.strip()
        if len(username) < 3:
            raise ValueError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
        if len(password) < 6:
            raise ValueError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        if db.get_user(username):
            raise ValueError('اسم المستخدم مستخدم بالفعل')
        user_id = db.create_user(username, self._hash_password(password))
        logger.info('Created user: %s', username)
        return user_id

    def login(self, username: str, password: str) -> tuple[int, str]:
        username = username.strip()
        user = db.get_user(username)
        if not user or not self._verify_password(password, user['password_hash']):
            raise ValueError('اسم المستخدم أو كلمة المرور غير صحيحة')
        return int(user['id']), str(user['username'])

    @staticmethod
    def _hash_password(password: str) -> str:
        salt = secrets.token_bytes(16)
        digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 120_000)
        return f'{salt.hex()}:{digest.hex()}'

    @staticmethod
    def _verify_password(password: str, stored: str) -> bool:
        try:
            salt_hex, digest_hex = stored.split(':', 1)
            expected = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt_hex), 120_000)
            return hmac.compare_digest(expected.hex(), digest_hex)
        except (ValueError, TypeError):
            return False