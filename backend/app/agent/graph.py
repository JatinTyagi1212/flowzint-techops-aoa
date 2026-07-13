import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.tools import agent_tools
from app.core.config import settings

# Initialize the LLM
# Pass the API key explicitly from the settings which loaded from .env
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, groq_api_key=settings.GROQ_API_KEY)

# Bind tools to the LLM
llm_with_tools = llm.bind_tools(agent_tools)

def should_continue(state: AgentState):
    """Determine if the agent should continue to tools or end."""
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        return "continue"
    return "end"

def call_model(state: AgentState):
    """Call the LLM and capture its reasoning."""
    messages = state["messages"]
    execution_log = state.get("execution_log", [])
    
    response = llm_with_tools.invoke(messages)
    
    # Log the LLM's decision
    if response.tool_calls:
        for tool_call in response.tool_calls:
            execution_log.append({
                "type": "thought",
                "content": f"Decided to route to tool: {tool_call['name']} with args {tool_call['args']}"
            })
    else:
        execution_log.append({
            "type": "thought",
            "content": "Synthesizing final technical response."
        })
        
    return {"messages": [response], "execution_log": execution_log}

def execute_tools(state: AgentState):
    """Execute the tools selected by the LLM."""
    messages = state["messages"]
    execution_log = state.get("execution_log", [])
    
    last_message = messages[-1]
    
    tool_messages = []
    
    # We create a dictionary of tools for easy lookup
    tool_map = {tool.name: tool for tool in agent_tools}
    
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_call_id = tool_call["id"]
        
        execution_log.append({
            "type": "action",
            "content": f"Executing {tool_name}..."
        })
        
        if tool_name in tool_map:
            tool = tool_map[tool_name]
            try:
                result = tool.invoke(tool_args)
                execution_log.append({
                    "type": "observation",
                    "content": f"Result from {tool_name}: {result}"
                })
            except Exception as e:
                result = f"Error executing tool: {str(e)}"
                execution_log.append({
                    "type": "error",
                    "content": result
                })
        else:
            result = f"Tool {tool_name} not found."
            execution_log.append({
                "type": "error",
                "content": result
            })
            
        tool_messages.append(ToolMessage(
            content=str(result),
            tool_call_id=tool_call_id,
            name=tool_name
        ))
        
    return {"messages": tool_messages, "execution_log": execution_log}

# Define the workflow graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("agent", call_model)
workflow.add_node("action", execute_tools)

# Set the entry point
workflow.set_entry_point("agent")

# Add conditional edges
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "action",
        "end": END
    }
)

# Add edge from action back to agent to synthesize the final response
workflow.add_edge("action", "agent")

# Compile the graph
agent_graph = workflow.compile()

def process_query(query: str):
    """Helper function to run the graph and extract the response and log."""
    system_prompt = SystemMessage(
        content=(
            "You are the FlowZint TechOps Agent, an Autonomous Operational Agent (AOA) "
            "designed for enterprise engineering support.\n"
            "You have access to tools to query architecture docs and check server health.\n"
            "Analyze the user's request, decide if you need documentation or live diagnostics, "
            "use the tools accordingly, and then synthesize a strict, professional technical response."
        )
    )
    
    initial_state = {
        "messages": [system_prompt, HumanMessage(content=query)],
        "execution_log": []
    }
    
    # We let exceptions bubble up so FastAPI can handle them via exception handlers
    final_state = agent_graph.invoke(initial_state)
    
    messages = final_state.get("messages", [])
    response_content = messages[-1].content if messages else "No response generated."
    
    return {
        "response": response_content,
        "execution_log": final_state.get("execution_log", [])
    }
