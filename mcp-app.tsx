import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, CheckCircle, Settings, Trash2 } from 'lucide-react';
import { useMcp } from 'use-mcp/react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

const MCPAmazonQApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the MCP hook with server URL configuration
  const { state, tools, callTool, error } = useMcp({
    url: 'http://localhost:3000',
    clientName: 'MCP Amazon Q Chat',
    clientUri: 'https://github.com/cloudflare/mcp-amazon-q-chat'
  });

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Use the first available tool or a default search tool
      const toolToUse = tools.find(tool => 
        tool.name.includes('search') || 
        tool.name.includes('confluence') ||
        tool.name.includes('query')
      ) || tools[0];

      let result;
      if (toolToUse) {
        result = await callTool(toolToUse.name, { 
          query: userMessage.content,
          question: userMessage.content,
          text: userMessage.content 
        });
      } else {
        result = { content: "I'm ready to help! Please connect to an MCP server to enable AI assistance." };
      }

      // Format the response
      let responseContent = '';
      if (typeof result === 'string') {
        responseContent = result;
      } else if (result?.content) {
        responseContent = typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
      } else {
        responseContent = JSON.stringify(result, null, 2);
      }

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: responseContent, isLoading: false }
          : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: `Error: ${errorMessage}`, isLoading: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else if (state === 'ready') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <Database className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getConnectionStatus = () => {
    if (error) return 'error';
    if (state === 'ready') return 'connected';
    return state || 'disconnected';
  };

  const getToolIcon = (toolName: string) => {
    // Map common Atlassian MCP server tools to icons
    if (toolName.includes('confluence') || toolName.includes('search')) {
      return <Search className="w-4 h-4" />;
    } else if (toolName.includes('jira') || toolName.includes('issue')) {
      return <MessageSquare className="w-4 h-4" />;
    } else if (toolName.includes('calendar') || toolName.includes('time')) {
      return <Calendar className="w-4 h-4" />;
    } else if (toolName.includes('document') || toolName.includes('file')) {
      return <FileText className="w-4 h-4" />;
    } else if (toolName.includes('user') || toolName.includes('people')) {
      return <Users className="w-4 h-4" />;
    } else {
      return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Amazon Q Chat
              </h1>
              <p className="text-sm text-gray-600">
                AI Assistant via MCP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium capitalize text-gray-700">
                {getConnectionStatus()}
              </span>
            </div>
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4">
        {/* Messages */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Start a conversation</p>
                <p className="text-gray-400 text-sm">Ask me anything!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm font-sans">
                        {message.content}
                      </pre>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

          {/* Connection Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">MCP Server Connection</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium mb-2">Atlassian MCP Server:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Connected to Atlassian services via MCP server. Configure your credentials in .env:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>CONFLUENCE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN</li>
                  <li>JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN</li>
                  <li>Get API tokens from: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Atlassian API Tokens</a></li>
                </ul>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Connection Error</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error.message}</p>
                </div>
              )}
              
              {state !== 'ready' && !error ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to MCP server... ({state})
                </div>
              ) : state === 'ready' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Connected to MCP server
                </div>
              ) : null}
            </div>
          </div>

          {/* Tool Selection and Query Interface */}
          {state === 'ready' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Query Interface</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tool/Service
                  </label>
                  <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a tool...</option>
                    {tools.map((tool) => (
                      <option key={tool.name} value={tool.name}>
                        {tool.description || tool.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Query
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter your query..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                    />
                    <button
                      onClick={handleQuery}
                      disabled={!selectedTool || !query.trim() || isLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      {isLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Tools Display */}
          {state === 'ready' && tools.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTool === tool.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTool(tool.name)}
                  >
                    <div className="flex items-center gap-3">
                      {getToolIcon(tool.name)}
                      <div>
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-gray-600">{tool.description || 'No description available'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Response</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              Setup Instructions
            </h2>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Step 1:</strong> Install Docker and pull the Atlassian MCP server: 
                <code className="bg-white px-2 py-1 rounded ml-2">docker pull ghcr.io/sooperset/mcp-atlassian:latest</code>
              </p>
              <p>
                <strong>Step 2:</strong> Create a <code className="bg-white px-1 rounded">.env</code> file with your Atlassian credentials
              </p>
              <p>
                <strong>Step 3:</strong> Get API tokens from Atlassian and configure environment variables
              </p>
              <p>
                <strong>Step 4:</strong> The app will automatically connect to your Atlassian services
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPAmazonQApp;