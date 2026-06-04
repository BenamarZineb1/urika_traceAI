from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ES_URL: str = "http://localhost:9200"
    INDEX_NAME: str = "traces-microservices"
    APP_NAME: str = "Urika AI - Workflow API"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:4200", "http://localhost:8089"]

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

settings = Settings()