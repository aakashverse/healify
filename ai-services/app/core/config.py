from pydantic_settings import BaseSettings

# load configs from env
class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-3.8-flash"
    CHROMA_DIR: str = "./chroma_db"
    GUIDELINES_DIR: str = "./app/data"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()