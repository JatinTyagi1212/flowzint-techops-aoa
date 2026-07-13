import os
from dotenv import load_dotenv

# Try to load environment variables from .env file, overriding any existing ones
env_loaded = load_dotenv(override=True)

class Settings:
    PROJECT_NAME: str = "FlowZint TechOps Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    
    def __init__(self):
        # We perform strict validation here so the backend fails gracefully if misconfigured.
        if not env_loaded and not os.getenv("GROQ_API_KEY"):
            print("WARNING: .env file not found or GROQ_API_KEY is not set.")
            print("Please create a .env file based on .env.example with the required keys.")
            # We don't raise an exception here immediately so we can handle it in the routes gracefully 
            # if we want to return a 500 error explaining it, or we could exit.
            # To be strict as requested: "Ensure the backend fails to start cleanly if .env is missing, explaining the requirement."
            raise ValueError(
                "CRITICAL: .env file missing or GROQ_API_KEY not set. "
                "The backend requires an LLM API key to operate. "
                "Please copy .env.example to .env and configure it."
            )

settings = Settings()
