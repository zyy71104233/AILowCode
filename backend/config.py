import os
# import sys
# print(sys.path)  # 检查输出是否包含 env-backend\Lib\site-packages
from pydantic_settings import BaseSettings

from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    API_PREFIX: str = "/api/v1"
    WS_ENDPOINT: str = "/ws"
    LOG_LEVEL: str = "INFO"
    
class Config:
    env_file = ".env"

settings = Settings()