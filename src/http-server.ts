#!/usr/bin/env node

// @ts-nocheck - Temporary: disable type checking for Docker build compatibility

/**
 * RepublicMCP HTTP Server
 * Exposes MCP tools via REST API for containerized deployments
 */

import http from 'http';
import { toolRegistry } from './core/mcp/index.js';
import { cameraTools } from './institutions/camera/index.js';
import { senatoTools } from './institutions/senato/index.js';

const PORT = parseInt(process.env.MCP_PORT || '3000', 10);
const HOST = process.env.MCP_HOST || '0.0.0.0';

// ============== INITIALIZE TOOL REGISTRY ==============

console.log('Registering Camera tools...');
toolRegistry.registerMany(cameraTools);
console.log(`✓ Registered ${cameraTools.length} Camera tools`);

console.log('Registering Senato tools...');
toolRegistry.registerMany(senatoTools);
console.log(`✓ Registered ${senatoTools.length} Senato tools`);

const stats = toolRegistry.getStatistics();
console.log(`\n📊 Total tools registered: ${stats.total}`);
console.log(`   - Camera: ${stats.byInstitution.camera}`);
console.log(`   - Senato: ${stats.byInstitution.senato}`);
console.log(`   - Both: ${stats.byInstitution.both}\n`);

// ============== HELPER FUNCTIONS ==============

function sendJSON(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function sendError(res: http.ServerResponse, statusCode: number, message: string) {
  sendJSON(res, statusCode, { error: message });
}

async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// ============== HTTP SERVER ==============

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // Health check endpoint
  if (url.pathname === '/health' && req.method === 'GET') {
    sendJSON(res, 200, {
      status: 'healthy',
      service: 'republic-mcp',
      version: '0.2.0',
      tools: toolRegistry.count(),
    });
    return;
  }

  // List tools endpoint
  if (url.pathname === '/api/tools' && req.method === 'GET') {
    try {
      const allTools = toolRegistry.getAll();
      const tools = allTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        institution: tool.institution,
      }));
      sendJSON(res, 200, { tools });
    } catch (error) {
      console.error('Error listing tools:', error);
      sendError(res, 500, 'Failed to list tools');
    }
    return;
  }

  // Get tool info endpoint
  if (url.pathname.startsWith('/api/tools/') && req.method === 'GET') {
    try {
      const toolName = url.pathname.split('/').pop();
      const tool = toolRegistry.get(toolName || '');

      if (!tool) {
        sendError(res, 404, `Tool not found: ${toolName}`);
        return;
      }

      sendJSON(res, 200, {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        institution: tool.institution,
      });
    } catch (error) {
      console.error('Error getting tool info:', error);
      sendError(res, 500, 'Failed to get tool info');
    }
    return;
  }

  // Call tool endpoint
  if (url.pathname === '/api/call' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { tool: toolName, params } = body;

      if (!toolName) {
        sendError(res, 400, 'Missing tool name');
        return;
      }

      // Get tool from registry
      const tool = toolRegistry.get(toolName);

      if (!tool) {
        sendError(res, 404, `Unknown tool: ${toolName}`);
        return;
      }

      // Execute tool handler
      console.log(`📞 Calling tool: ${toolName}`, params);
      const startTime = Date.now();

      const result = await tool.handler(params || {});

      const duration = Date.now() - startTime;
      console.log(`✓ Tool executed in ${duration}ms`);

      sendJSON(res, 200, result);
    } catch (error) {
      console.error('Error calling tool:', error);
      sendError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to execute tool'
      );
    }
    return;
  }

  // Statistics endpoint
  if (url.pathname === '/api/stats' && req.method === 'GET') {
    try {
      const stats = toolRegistry.getStatistics();
      sendJSON(res, 200, stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      sendError(res, 500, 'Failed to get statistics');
    }
    return;
  }

  // 404
  sendError(res, 404, 'Not found');
});

// ============== START SERVER ==============

async function main() {
  server.listen(PORT, HOST, () => {
    console.log('✓ RepublicMCP HTTP Server running!');
    console.log(`\n🌐 Server URL: http://${HOST}:${PORT}`);
    console.log(`📊 Tools available: ${toolRegistry.count()}`);
    console.log('\n📝 Available endpoints:');
    console.log(`   GET  /health           - Health check`);
    console.log(`   GET  /api/tools        - List all tools`);
    console.log(`   GET  /api/tools/:name  - Get tool info`);
    console.log(`   POST /api/call         - Execute a tool`);
    console.log(`   GET  /api/stats        - Get statistics`);
    console.log('\n💡 Press Ctrl+C to stop\n');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
