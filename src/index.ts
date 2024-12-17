import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getConversations, GetConversationsSchema } from './tools/conversations.js';

const server = new Server(
  {
    name: 'intercom',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get-conversations',
        description: 'Get Intercom conversations with optional filters for date range, customer, and state',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start date for filtering conversations (ISO format)',
            },
            endDate: {
              type: 'string',
              description: 'End date for filtering conversations (ISO format)',
            },
            customer: {
              type: 'string',
              description: 'Customer ID to filter conversations',
            },
            state: {
              type: 'string',
              description: 'Conversation state to filter by (e.g., "open", "closed")',
            },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get-conversations') {
    try {
      const validatedArgs = GetConversationsSchema.parse(args);
      const conversations = await getConversations(validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(conversations, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
      throw error;
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Intercom MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});