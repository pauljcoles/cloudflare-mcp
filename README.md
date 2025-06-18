# MCP Atlassian Integration with React

This project demonstrates how to integrate Atlassian services (Jira and Confluence) with a React application using the Model Context Protocol (MCP) and the `use-mcp` hook.

## Features

- Real-time connection to Atlassian MCP server
- Search and interact with Jira issues and Confluence pages
- Modern React UI with Tailwind CSS
- TypeScript support

## Prerequisites

1. **Docker** - Required to run the Atlassian MCP server
2. **Atlassian Account** - With access to Jira and/or Confluence
3. **API Tokens** - Generated from your Atlassian account

## Setup Instructions

### 1. Get Atlassian API Tokens

1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label and copy the token immediately (you won't see it again)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Atlassian credentials:

```env
# Atlassian Confluence Configuration
CONFLUENCE_URL=https://your-domain.atlassian.net
CONFLUENCE_USERNAME=your-email@example.com
CONFLUENCE_API_TOKEN=your-confluence-api-token

# Atlassian Jira Configuration  
JIRA_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
```

### 3. Pull the MCP Server

```bash
docker pull ghcr.io/sooperset/mcp-atlassian:latest
```

### 4. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application will start and automatically attempt to connect to your Atlassian services via the MCP server.

## How It Works

1. **MCP Server**: Runs in Docker and connects to your Atlassian services
2. **use-mcp Hook**: Provides a simple React interface to the MCP server
3. **React App**: Uses the hook to display available tools and execute queries

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **MCP Integration**: `use-mcp` hook from the `use-mcp` package
- **Backend**: Atlassian MCP server running in Docker
- **Services**: Jira and Confluence via REST APIs

## Available Tools

The Atlassian MCP server provides various tools for:
- Searching Confluence spaces
- Querying Jira projects and issues
- Retrieving user information
- And more (depends on your Atlassian setup)

## Troubleshooting

1. **Connection Issues**: Check that Docker is running and your API tokens are correct
2. **Authentication Errors**: Verify your Atlassian URLs and credentials
3. **No Tools Available**: Ensure your MCP server is properly configured and running

## Learn More

- [MCP Atlassian Server](https://github.com/sooperset/mcp-atlassian)
- [use-mcp Hook](https://github.com/modelcontextprotocol/use-mcp)
- [Cloudflare MCP Blog Post](https://blog.cloudflare.com/connect-any-react-application-to-an-mcp-server-in-three-lines-of-code/)