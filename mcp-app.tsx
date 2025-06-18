import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Settings, Loader2, AlertCircle, CheckCircle, Database, Users, Calendar, FileText } from 'lucide-react';
import { useMcp } from 'use-mcp/react';

const MCPAmazonQApp = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  
  // Use the MCP hook with server URL configuration
  const { state, tools, callTool, error } = useMcp({
    url: 'http://localhost:3000',
    clientName: 'MCP Amazon Q App',
    clientUri: 'https://github.com/cloudflare/mcp-amazon-q-app'
  });

  // The new useMcp hook automatically connects, no manual connect needed

  const handleQuery = async () => {
    if (!selectedTool || !query.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await callTool(selectedTool, { query: query.trim() });
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                MCP Amazon Q Integration
              </h1>
              <p className="text-gray-600">
                Connect to Amazon Q and Atlassian services via MCP servers
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <span className="text-sm font-medium capitalize text-gray-700">
                {getConnectionStatus()}
              </span>
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