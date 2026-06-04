from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://akos:akos1234@localhost:5432/akos_mes"
    vector_db_url: str = "postgresql://akos:akos1234@localhost:5433/akos_vector"
    openai_api_key: str = ""
    secret_key: str = "changeme-in-production"
    environment: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
