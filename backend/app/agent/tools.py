from langchain_core.tools import tool
import json
import logging

logger = logging.getLogger(__name__)

@tool
def query_architecture_docs(query: str) -> str:
    """
    Query the FlowZint technical architecture documentation (via Qdrant RAG).
    Use this tool for questions about deployment guidelines, infrastructure setup, and architecture.
    """
    logger.info(f"Tool Call: query_architecture_docs with query='{query}'")
    # Simulate a Qdrant RAG search returning fake FlowZint deployment guidelines
    fake_docs = [
        "FlowZint microservices should be deployed using Kubernetes with a replica count of at least 3 for high availability.",
        "The cognitive routing layer requires at least 4GB of RAM and uses Redis for state caching.",
        "To configure the API gateway, update the flowzint-gateway.yaml file and ensure rate limiting is enabled."
    ]
    
    return "Retrieved Documentation Fragments:\n" + "\n".join(f"- {doc}" for doc in fake_docs)

@tool
def check_server_health(server_id: str) -> str:
    """
    Check the live infrastructure health metrics for a given server ID.
    Use this tool when the user asks about server status, load, performance, or diagnostics.
    """
    logger.info(f"Tool Call: check_server_health with server_id='{server_id}'")
    # Simulate querying a server infrastructure API
    health_metrics = {
        "server_id": server_id,
        "status": "degraded" if "prod" in server_id.lower() else "healthy",
        "cpu_load": "94%" if "prod" in server_id.lower() else "42%",
        "memory_usage": "14GB/16GB" if "prod" in server_id.lower() else "4GB/16GB",
        "active_connections": 1024 if "prod" in server_id.lower() else 150
    }
    
    return json.dumps(health_metrics, indent=2)

# List of tools to pass to the agent
agent_tools = [query_architecture_docs, check_server_health]
