# Amazon Q Integration Setup

This UI now wraps the Amazon Q CLI through an MCP server. Here's how to use it:

## Prerequisites

1. **Install Amazon Q CLI**: Make sure you have the `q` command available
   ```bash
   # Install Amazon Q CLI (check AWS docs for latest instructions)
   pip install amazon-q-cli
   # OR
   npm install -g @aws/amazon-q-cli
   ```

2. **Configure AWS credentials**: Ensure you have proper AWS credentials set up
   ```bash
   aws configure
   ```

## Running the System

1. **Start the MCP Server** (in one terminal):
   ```bash
   npm run mcp-server
   ```

2. **Start the Web UI** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Open your browser** to http://localhost:5173

## Available Tools

The MCP server provides these Amazon Q tools:

- **amazon_q_chat**: General chat with Amazon Q
- **amazon_q_explain**: Explain code or concepts
- **amazon_q_transform**: Transform or refactor code
- **amazon_q_debug**: Debug code issues
- **amazon_q_optimize**: Optimize code for performance

## How It Works

1. You type a message in the chat UI
2. The UI sends it to the MCP server (port 3000)
3. The MCP server executes `q chat` with your message
4. Amazon Q's response is returned to the UI

## Troubleshooting

- Make sure `q` command works in your terminal first
- Check that AWS credentials are properly configured
- Ensure the MCP server is running on port 3000
- Check browser console for any connection errors