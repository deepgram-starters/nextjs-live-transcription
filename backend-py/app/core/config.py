import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = os.environ.get("APP_NAME", "FastAPI App")
    DEBUG: bool = os.getenv("DEBUG", False)
    VERSION: str = "1.0.0"

    # Server settings
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = os.getenv("PORT", 8000)

    # Environment settings
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # LLM settings
    MODEL_NAME: str = "distilbert-base-uncased-finetuned-sst-2-english"

    class Config:
        env_file = ".env"


settings = Settings()
