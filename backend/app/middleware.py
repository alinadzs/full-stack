from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging
import time

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Добавляет заголовки безопасности к каждому ответу"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Заголовки безопасности
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Логирует все запросы и ответы"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Получаем информацию о пользователе из токена если есть
        user_info = "anonymous"
        if "authorization" in request.headers:
            auth = request.headers.get("authorization", "").split(" ")
            if len(auth) > 1:
                user_info = f"token_user"
        
        # Логируем запрос
        logger.info(f"[{user_info}] {request.method} {request.url.path} - {request.client.host if request.client else 'unknown'}")
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Логируем ответ
        logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
        
        # Добавляем заголовок с временем обработки
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Базовое ограничение частоты запросов (заглушка)"""
    
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_history = {}

    async def dispatch(self, request: Request, call_next):
        # Получаем IP адрес
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Инициализируем историю для этого IP если её нет
        if client_ip not in self.request_history:
            self.request_history[client_ip] = []
        
        # Удаляем старые запросы (старше минуты)
        self.request_history[client_ip] = [
            req_time for req_time in self.request_history[client_ip]
            if current_time - req_time < 60
        ]
        
        # Проверяем лимит
        if len(self.request_history[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"}
            )
        
        # Добавляем текущий запрос
        self.request_history[client_ip].append(current_time)
        
        response = await call_next(request)
        return response