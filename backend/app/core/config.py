from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.10"
    DATABASE_NAME: str = "restaurant_saas"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # App
    APP_NAME: str = "DineFlow"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10485760
    
    # OTP
    OTP_EXPIRE_MINUTES: int = 5
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
