#!/usr/bin/env node

/**
 * Simple web client for RepublicMCP
 * Serves a web interface to interact with the MCP server
 */

import http from "http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const PORT = 3000;

let mcpClient: Client;
let tools: any[] = [];

// Initialize MCP client
async function initMCPClient() {
  mcpClient = new Client(
    {
      name: "republic-web-client",
      version: "0.1.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  await mcpClient.connect(transport);

  // Get tools list
  const toolsResponse = (await mcpClient.listTools()) as any;

  tools = toolsResponse.tools || [];
  console.log(`✓ Connected to MCP server. Loaded ${tools.length} tools.`);
}

// HTML template
function getHTML() {
  return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RepublicMCP - Web Client</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        header p {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .content {
            display: grid;
            grid-template-columns: 300px 1fr;
            min-height: 600px;
        }

        .sidebar {
            background: #f8f9fa;
            border-right: 1px solid #dee2e6;
            padding: 20px;
            overflow-y: auto;
            max-height: 600px;
        }

        .sidebar h3 {
            margin-bottom: 15px;
            color: #495057;
            font-size: 1.1em;
        }

        .tool-list {
            list-style: none;
        }

        .tool-item {
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .tool-item:hover {
            border-color: #667eea;
            transform: translateX(5px);
        }

        .tool-item.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .tool-name {
            font-weight: bold;
            font-size: 0.9em;
        }

        .main {
            padding: 30px;
        }

        .tool-info {
            margin-bottom: 30px;
        }

        .tool-info h2 {
            color: #667eea;
            margin-bottom: 10px;
        }

        .tool-info p {
            color: #6c757d;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #495057;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            font-size: 1em;
            transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }

        .form-group small {
            display: block;
            margin-top: 5px;
            color: #6c757d;
            font-size: 0.85em;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 30px;
            font-size: 1.1em;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .btn:hover {
            transform: scale(1.05);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .result {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }

        .result h3 {
            margin-bottom: 15px;
            color: #495057;
        }

        .result pre {
            background: #212529;
            color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.9em;
            line-height: 1.5;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #6c757d;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            color: #721c24;
        }

        .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            color: #155724;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #dc3545;
            color: white;
            border-radius: 4px;
            font-size: 0.75em;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🏛️ RepublicMCP</h1>
            <p>Interroga i dati aperti del Parlamento Italiano</p>
        </header>

        <div class="content">
            <aside class="sidebar">
                <h3>Tools Disponibili</h3>
                <ul class="tool-list" id="toolList"></ul>
            </aside>

            <main class="main">
                <div id="mainContent">
                    <div class="loading">
                        <h2>Benvenuto!</h2>
                        <p>Seleziona un tool dalla barra laterale per iniziare</p>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        let currentTool = null;
        let tools = [];

        // Load tools on page load
        async function loadTools() {
            try {
                const response = await fetch('/api/tools');
                tools = await response.json();
                renderToolList();
            } catch (error) {
                console.error('Error loading tools:', error);
            }
        }

        function renderToolList() {
            const list = document.getElementById('toolList');
            list.innerHTML = tools.map(tool => {
                const required = tool.inputSchema?.required || [];
                const hasRequired = required.length > 0;

                return \`
                    <li class="tool-item" onclick="selectTool('\${tool.name}')">
                        <div class="tool-name">
                            \${tool.name}
                            \${hasRequired ? '<span class="badge">params</span>' : ''}
                        </div>
                    </li>
                \`;
            }).join('');
        }

        function selectTool(toolName) {
            currentTool = tools.find(t => t.name === toolName);

            // Update active state
            document.querySelectorAll('.tool-item').forEach(el => {
                el.classList.remove('active');
                if (el.textContent.includes(toolName)) {
                    el.classList.add('active');
                }
            });

            renderToolForm();
        }

        function renderToolForm() {
            if (!currentTool) return;

            const props = currentTool.inputSchema?.properties || {};
            const required = currentTool.inputSchema?.required || [];

            const fields = Object.keys(props).map(key => {
                const prop = props[key];
                const isRequired = required.includes(key);

                return \`
                    <div class="form-group">
                        <label for="param_\${key}">
                            \${key}
                            \${isRequired ? '<span class="badge">required</span>' : ''}
                        </label>
                        <input
                            type="text"
                            id="param_\${key}"
                            placeholder="\${prop.description || ''}"
                            \${isRequired ? 'required' : ''}
                        >
                        <small>\${prop.description || ''}</small>
                    </div>
                \`;
            }).join('');

            document.getElementById('mainContent').innerHTML = \`
                <div class="tool-info">
                    <h2>\${currentTool.name}</h2>
                    <p>\${currentTool.description}</p>
                </div>

                <form onsubmit="callTool(event)">
                    \${fields || '<p>Questo tool non richiede parametri</p>'}

                    <button type="submit" class="btn" id="submitBtn">
                        🚀 Esegui Query
                    </button>
                </form>

                <div id="result"></div>
            \`;
        }

        async function callTool(event) {
            event.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result');

            // Collect parameters
            const params = {};
            const props = currentTool.inputSchema?.properties || {};

            Object.keys(props).forEach(key => {
                const value = document.getElementById(\`param_\${key}\`)?.value;
                if (value) {
                    params[key] = value;
                }
            });

            // Show loading
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Loading...';
            resultDiv.innerHTML = \`
                <div class="result">
                    <div class="spinner"></div>
                    <p style="text-align: center;">Interrogando l'endpoint SPARQL...</p>
                </div>
            \`;

            try {
                const response = await fetch('/api/call', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tool: currentTool.name,
                        params: params
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <div class="result success">
                            <h3>✓ Risultato</h3>
                            <pre>\${JSON.stringify(result, null, 2)}</pre>
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Errore</h3>
                            <pre>\${JSON.stringify(result, null, 2)}</pre>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <h3>❌ Errore</h3>
                        <p>\${error.message}</p>
                    </div>
                \`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '🚀 Esegui Query';
            }
        }

        // Initialize
        loadTools();
    </script>
</body>
</html>`;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(getHTML());
    return;
  }

  if (req.url === "/api/tools" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(tools));
    return;
  }

  if (req.url === "/api/call" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { tool, params } = JSON.parse(body);

        const result = (await mcpClient.callTool({
          name: tool,
          arguments: params,
        })) as any;

        // Parse the result
        let responseData = result;
        if (result.content && result.content.length > 0) {
          const content = result.content[0];
          if (content.type === "text") {
            try {
              responseData = JSON.parse(content.text);
            } catch {
              responseData = content.text;
            }
          }
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(responseData));
      } catch (error: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

// Start server
async function main() {
  console.log("🔌 Initializing MCP client...");
  await initMCPClient();

  server.listen(PORT, () => {
    console.log(`\n✓ RepublicMCP Web Client running!`);
    console.log(`\n🌐 Open in browser: http://localhost:${PORT}`);
    console.log("\n📝 Press Ctrl+C to stop\n");
  });
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
