# FlowZint TechOps Agent

An Autonomous Operational Agent (AOA) for enterprise engineering support, demonstrating cognitive routing via LangGraph, tool execution, and a responsive developer-focused terminal UI.

## Project Structure
- `backend/`: FastAPI application integrating LangChain/LangGraph.
- `frontend/`: React.js + Tailwind CSS application showcasing a terminal-like interface with an execution log.

## Features
1. **Semantic Routing**: Distinguishes between documentation requests and live infrastructure diagnostics.
2. **Tool Execution**: Simulates retrieving Qdrant docs or querying a server metrics API.
3. **Execution Transparency**: The React frontend displays the real-time thought process of the LangGraph agent in the sidebar.
4. **Resilience**: Enforces `.env` presence and provides structured error handling.

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ (with npm)
- OpenAI API Key

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up the Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Environment Variables:
   - Copy `.env.example` to `.env`.
   - Add your `OPENAI_API_KEY`.
   ```bash
   cp .env.example .env
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will be available at `http://localhost:8000`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   npm install react-markdown
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## 🛡️ Edge Case Mitigations
The architecture implements several mitigations for production readiness:
- **Strict Environment Checks**: The application `core.config.py` forcefully validates the presence of `.env` and `OPENAI_API_KEY`, failing gracefully with explicit instructions rather than cryptic tracebacks during LLM invocation.
- **Graceful Tool Error Handling**: If a tool crashes, the LangGraph node captures the exception and routes it as an `error` observation rather than crashing the execution chain, allowing the LLM to apologize and self-correct.
- **Global Exception Handlers**: FastAPI is configured with custom `Exception` handlers that return clean 500 JSON responses.
- **LLM Context Anchoring**: The agent is bound with strict system prompts anchoring it as a TechOps agent, reducing vulnerability to prompt injection that attempts to break character.

---
*Created for the FAIC Open Innovation Track.*
