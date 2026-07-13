from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class AgentExecutionError(Exception):
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}

async def agent_execution_exception_handler(request: Request, exc: AgentExecutionError):
    logger.error(f"AgentExecutionError: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Agent Execution Failed",
            "message": exc.message,
            "details": exc.details
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Server Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during processing."
        }
    )
