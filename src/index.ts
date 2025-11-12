#!/usr/bin/env node

/**
 * RepublicMCP - MCP Server for Italian Parliament Open Data
 * Integrated Multi-Institution Support (Camera + Senato)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool registry
import { toolRegistry } from './core/mcp/index.js';

// Import Camera tools
import { cameraTools } from './institutions/camera/index.js';

// Import Senato tools
import { senatoTools } from './institutions/senato/index.js';

// ============== INITIALIZE TOOL REGISTRY ==============

console.error('Registering Camera tools...');
toolRegistry.registerMany(cameraTools);
console.error(`✓ Registered ${cameraTools.length} Camera tools`);

console.error('Registering Senato tools...');
toolRegistry.registerMany(senatoTools);
console.error(`✓ Registered ${senatoTools.length} Senato tools`);

const stats = toolRegistry.getStatistics();
console.error(`\n📊 Total tools registered: ${stats.total}`);
console.error(`   - Camera: ${stats.byInstitution.camera}`);
console.error(`   - Senato: ${stats.byInstitution.senato}`);
console.error(`   - Both: ${stats.byInstitution.both}\n`);

// ============== CREATE MCP SERVER ==============

const server = new Server(
  {
    name: 'republic-mcp',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============== LIST TOOLS HANDLER ==============

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const allTools = toolRegistry.getAll();

  // Convert MCPTool format to MCP SDK Tool format
  const tools = allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  return { tools };
});

// ============== CALL TOOL HANDLER ==============

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Get tool from registry
    const tool = toolRegistry.get(name);

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Execute tool handler
    const result = await tool.handler(args || {});

    return result;
  } catch (error) {
    console.error(`Error executing tool "${name}":`, error);

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ============== START SERVER ==============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✓ RepublicMCP server running on stdio');
  console.error(`✓ Serving ${toolRegistry.count()} tools from Camera and Senato\n`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
