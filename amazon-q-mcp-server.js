#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';

const server = new Server(
  {
    name: 'amazon-q-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to execute Amazon Q CLI commands
async function executeAmazonQ(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('q', [command, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Amazon Q CLI error: ${stderr || stdout}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to execute Amazon Q CLI: ${error.message}`));
    });
  });
}

// Helper function for interactive Amazon Q chat
async function executeAmazonQChat(message) {
  return new Promise((resolve, reject) => {
    const child = spawn('q', ['chat'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send the message to Amazon Q
    child.stdin.write(message + '\n');
    child.stdin.end();

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Amazon Q chat error: ${stderr || stdout}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to execute Amazon Q chat: ${error.message}`));
    });
  });
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'amazon_q_chat',
        description: 'Chat with Amazon Q AI assistant',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to send to Amazon Q',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'amazon_q_explain',
        description: 'Ask Amazon Q to explain code or concepts',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The code to explain',
            },
            context: {
              type: 'string',
              description: 'Additional context for the explanation',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'amazon_q_transform',
        description: 'Ask Amazon Q to transform or refactor code',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The code to transform',
            },
            instruction: {
              type: 'string',
              description: 'How to transform the code',
            },
          },
          required: ['code', 'instruction'],
        },
      },
      {
        name: 'amazon_q_debug',
        description: 'Ask Amazon Q to help debug code',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The code that has issues',
            },
            error: {
              type: 'string',
              description: 'The error message or description of the issue',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'amazon_q_optimize',
        description: 'Ask Amazon Q to optimize code for performance',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The code to optimize',
            },
            focus: {
              type: 'string',
              description: 'What aspect to optimize (performance, readability, etc.)',
            },
          },
          required: ['code'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'amazon_q_chat':
        const chatResponse = await executeAmazonQChat(args.message);
        return {
          content: [
            {
              type: 'text',
              text: chatResponse,
            },
          ],
        };

      case 'amazon_q_explain':
        const explainPrompt = args.context 
          ? `Explain this code with context: ${args.context}\n\n${args.code}`
          : `Explain this code:\n\n${args.code}`;
        const explainResponse = await executeAmazonQChat(explainPrompt);
        return {
          content: [
            {
              type: 'text',
              text: explainResponse,
            },
          ],
        };

      case 'amazon_q_transform':
        const transformPrompt = `Transform this code: ${args.instruction}\n\n${args.code}`;
        const transformResponse = await executeAmazonQChat(transformPrompt);
        return {
          content: [
            {
              type: 'text',
              text: transformResponse,
            },
          ],
        };

      case 'amazon_q_debug':
        const debugPrompt = args.error 
          ? `Debug this code that has the following error: ${args.error}\n\n${args.code}`
          : `Debug this code:\n\n${args.code}`;
        const debugResponse = await executeAmazonQChat(debugPrompt);
        return {
          content: [
            {
              type: 'text',
              text: debugResponse,
            },
          ],
        };

      case 'amazon_q_optimize':
        const optimizePrompt = args.focus 
          ? `Optimize this code for ${args.focus}:\n\n${args.code}`
          : `Optimize this code:\n\n${args.code}`;
        const optimizeResponse = await executeAmazonQChat(optimizePrompt);
        return {
          content: [
            {
              type: 'text',
              text: optimizeResponse,
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Amazon Q MCP server running on stdio');
}

main().catch(console.error);