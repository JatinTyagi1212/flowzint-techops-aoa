import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Activity, ShieldAlert, CheckCircle, Search, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Constants
const API_URL = 'https://flowzint-techops-aoa.onrender.com/api/v1/agent/triage';

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'agent',
      content: 'FlowZint TechOps Agent Initialized.\nSystem systems nominal.\nHow can I assist you with your infrastructure or documentation today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollLogsToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    scrollLogsToBottom();
  }, [executionLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Agent execution failed or server unavailable.');
      }

      const data = await response.json();
      
      const agentMessage = {
        id: Date.now() + 1,
        role: 'agent',
        content: data.response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Append execution logs
      if (data.execution_log && data.execution_log.length > 0) {
        setExecutionLogs(prev => [
          ...prev, 
          { type: 'query_marker', content: `--- Query: ${userMessage.content.substring(0, 20)}... ---` },
          ...data.execution_log
        ]);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'error',
        content: `Error: ${error.message}\nPlease ensure the backend is running and .env is configured properly.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'thought': return <Search className="w-3 h-3 text-terminal-accent" />;
      case 'action': return <Cpu className="w-3 h-3 text-terminal-warning" />;
      case 'observation': return <CheckCircle className="w-3 h-3 text-terminal-success" />;
      case 'error': return <ShieldAlert className="w-3 h-3 text-terminal-error" />;
      default: return <Activity className="w-3 h-3 text-terminal-text" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'thought': return 'text-terminal-accent';
      case 'action': return 'text-terminal-warning';
      case 'observation': return 'text-terminal-success';
      case 'error': return 'text-terminal-error';
      case 'query_marker': return 'text-gray-500 font-bold';
      default: return 'text-terminal-text';
    }
  };

  return (
    <div className="flex h-screen bg-terminal-bg text-terminal-text font-mono overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-terminal-border">
        {/* Header */}
        <header className="h-14 border-b border-terminal-border bg-terminal-surface flex items-center px-4 shrink-0">
          <Terminal className="w-5 h-5 text-terminal-success mr-2" />
          <h1 className="text-lg font-bold tracking-wider">FlowZint TechOps Agent</h1>
          <div className="ml-auto flex items-center">
            <span className="flex h-2 w-2 relative mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-success"></span>
            </span>
            <span className="text-xs text-terminal-success uppercase">System Online</span>
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline mb-1">
                <span className={`text-xs font-bold uppercase ${msg.role === 'user' ? 'text-terminal-accent' : msg.role === 'error' ? 'text-terminal-error' : 'text-terminal-success'}`}>
                  {msg.role}
                </span>
                <span className="text-[10px] text-gray-500 ml-2">[{msg.timestamp}]</span>
              </div>
              <div className={`max-w-[80%] rounded-md p-3 ${
                msg.role === 'user' 
                  ? 'bg-terminal-border border border-gray-600' 
                  : msg.role === 'error'
                    ? 'bg-red-950/30 border border-terminal-error text-terminal-error'
                    : 'bg-terminal-surface border border-terminal-border'
              }`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-terminal-border prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="flex items-baseline mb-1">
                <span className="text-xs font-bold uppercase text-terminal-success">agent</span>
              </div>
              <div className="max-w-[80%] rounded-md p-3 bg-terminal-surface border border-terminal-border flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-terminal-success typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-terminal-success typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-terminal-success typing-dot"></div>
                <span className="ml-2 text-xs text-gray-400">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-terminal-surface border-t border-terminal-border shrink-0">
          <form onSubmit={handleSubmit} className="flex relative items-center">
            <span className="absolute left-3 text-terminal-success font-bold text-lg">{'>'}</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter technical query or diagnostic command..."
              className="w-full bg-terminal-bg border border-terminal-border rounded py-3 pl-8 pr-12 focus:outline-none focus:border-terminal-accent text-terminal-text placeholder-gray-600 transition-colors"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="absolute right-2 p-2 rounded text-gray-400 hover:text-terminal-accent hover:bg-terminal-border disabled:opacity-50 disabled:hover:bg-transparent transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Execution Log Sidebar */}
      <div className="w-80 flex flex-col bg-[#0A0D12] shrink-0 border-l border-terminal-border hidden md:flex">
        <header className="h-14 border-b border-terminal-border bg-terminal-surface flex items-center px-4 shrink-0 justify-between">
          <div className="flex items-center text-xs font-bold uppercase text-gray-400 tracking-wider">
            <Activity className="w-4 h-4 mr-2 text-terminal-accent" />
            Cognitive Routing Log
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {executionLogs.length === 0 ? (
            <div className="text-gray-600 italic">Waiting for agent execution...</div>
          ) : (
            executionLogs.map((log, index) => (
              <div key={index} className={`flex items-start ${getLogColor(log.type)}`}>
                <div className="mt-1 mr-2 shrink-0">
                  {getLogIcon(log.type)}
                </div>
                <div className="break-all whitespace-pre-wrap">
                  <span className="font-bold mr-1 opacity-75">[{log.type.toUpperCase()}]</span>
                  {log.content}
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
