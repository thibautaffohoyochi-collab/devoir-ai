from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # LLM
    gemini_api_key: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    # Webhooks
    n8n_webhook_url: str = ""
    app_base_url: str = "http://localhost:8000"
    # Email
    resend_api_key: str = ""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "DevoirAI <noreply@devoirai.app>"
    email_enabled: bool = False
    # Auth
    secret_key: str = "changeme_secret_key_32chars_minimum"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # DB
    database_url: str = "sqlite+aiosqlite:///./devoir_ai.db"
    max_file_size_mb: int = 10
    allowed_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    port: int = 8000

    @property
    def origins_list(self):
        origins = [o.strip() for o in self.allowed_origins.split(",")]
        # Toujours accepter * en prod si pas configuré
        return origins

    @property
    def async_database_url(self):
        """Convertit postgres:// en postgresql+asyncpg:// pour Railway."""
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    model_config = {"env_file": ".env"}


@lru_cache()
def get_settings():
    return Settings()


def reload_settings():
    get_settings.cache_clear()
    return get_settings()
