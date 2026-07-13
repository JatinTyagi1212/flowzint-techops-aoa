from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from app.agent.graph import process_query
from app.core.exceptions import AgentExecutionError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class QueryRequest(BaseModel):
    query: str = Field(..., description="The user's query for the TechOps agent", example="Check health for prod-server-01")

class QueryResponse(BaseModel):
    response: str
    execution_log: list[dict]

@router.post("/triage", response_model=QueryResponse)
async def triage_query(request: QueryRequest):
    """
    Semantic Router Endpoint:
    Takes a user query, processes it through the LangGraph cognitive router,
    invokes appropriate tools, and returns the synthesized response along with
    an execution log detailing the LLM's thought process.
    """
    logger.info(f"Received query: {request.query}")
    try:
        result = process_query(request.query)
        return QueryResponse(
            response=result["response"],
            execution_log=result["execution_log"]
        )
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}", exc_info=True)
        # Raise our custom exception which will be caught by the exception handler
        raise AgentExecutionError(
            message=f"Failed to process the query: {str(e)}"
        )
