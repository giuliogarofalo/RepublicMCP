#!/usr/bin/env node

/**
 * Interactive CLI client for RepublicMCP
 * Allows you to test the MCP server directly from terminal
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline";
import { spawn } from "child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer);
    });
  });
}

class MCPCLIClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;
  private tools: any[] = [];

  constructor() {
    this.client = new Client(
      {
        name: "republic-cli-client",
        version: "0.1.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    log("\n🔌 Connecting to RepublicMCP server...", "yellow");

    // Spawn the MCP server
    const serverProcess = spawn("node", ["dist/index.js"], {
      cwd: process.cwd(),
    });

    this.transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
    });

    await this.client.connect(this.transport);
    log("✓ Connected to server", "green");

    // List available tools
    const toolsResponse = (await this.client.listTools()) as any;

    this.tools = toolsResponse.tools || [];
    log(`\n✓ Loaded ${this.tools.length} tools`, "green");
  }

  showWelcome() {
    log("\n" + "=".repeat(60), "cyan");
    log("  RepublicMCP - Interactive CLI Client", "bright");
    log("  Interroga i dati aperti del Parlamento Italiano", "dim");
    log("=".repeat(60) + "\n", "cyan");
  }

  showHelp() {
    log("\n📚 Comandi disponibili:", "yellow");
    log("  /tools              - Lista tutti i tools disponibili");
    log("  /tool <name>        - Info su un tool specifico");
    log("  /call <name> <json> - Chiama un tool con parametri JSON");
    log("  /help               - Mostra questo aiuto");
    log("  /quit               - Esci\n");

    log("💡 Esempi:", "yellow");
    log('  /tool search_deputati');
    log('  /call search_deputati {"cognome": "Meloni"}');
    log('  /call get_gruppi_parlamentari {}');
    log("");
  }

  showTools() {
    log("\n🔧 Tools disponibili:\n", "yellow");
    this.tools.forEach((tool, index) => {
      log(`${index + 1}. ${tool.name}`, "bright");
      log(`   ${tool.description}`, "dim");
    });
    log("");
  }

  showToolInfo(toolName: string) {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool) {
      log(`\n❌ Tool '${toolName}' non trovato\n`, "red");
      return;
    }

    log(`\n🔧 ${tool.name}`, "bright");
    log(`${tool.description}\n`, "dim");

    if (tool.inputSchema?.properties) {
      log("Parametri:", "yellow");
      const props = tool.inputSchema.properties;
      const required = tool.inputSchema.required || [];

      Object.keys(props).forEach((key) => {
        const prop = props[key];
        const isRequired = required.includes(key);
        const requiredTag = isRequired ? colors.red + " [required]" + colors.reset : "";
        log(`  • ${key}${requiredTag}: ${prop.description || prop.type}`);
      });
    }
    log("");
  }

  async callTool(toolName: string, argsStr: string) {
    try {
      const args = JSON.parse(argsStr || "{}");

      log(`\n⚙️  Chiamando ${toolName}...`, "yellow");

      const result = (await this.client.callTool({
        name: toolName,
        arguments: args,
      })) as any;

      log("\n✓ Risposta ricevuta:", "green");
      log("─".repeat(60), "dim");

      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === "text") {
          try {
            const parsed = JSON.parse(content.text);
            log(JSON.stringify(parsed, null, 2), "cyan");
          } catch {
            log(content.text, "cyan");
          }
        }
      }

      log("─".repeat(60) + "\n", "dim");
    } catch (error: any) {
      log(`\n❌ Errore: ${error.message}\n`, "red");
      if (error.message.includes("JSON")) {
        log("💡 Suggerimento: Controlla che il JSON sia valido", "yellow");
        log('   Esempio: {"cognome": "Meloni"}\n', "dim");
      }
    }
  }

  async handleCommand(input: string) {
    const trimmed = input.trim();

    if (!trimmed) return;

    if (trimmed.startsWith("/")) {
      const parts = trimmed.slice(1).split(" ");
      const command = parts[0];
      const args = parts.slice(1);

      switch (command) {
        case "help":
          this.showHelp();
          break;

        case "tools":
          this.showTools();
          break;

        case "tool":
          if (args.length === 0) {
            log("\n❌ Specifica il nome del tool\n", "red");
          } else {
            this.showToolInfo(args[0]);
          }
          break;

        case "call":
          if (args.length < 1) {
            log("\n❌ Specifica il nome del tool\n", "red");
          } else {
            const toolName = args[0];
            const argsJson = args.slice(1).join(" ");
            await this.callTool(toolName, argsJson);
          }
          break;

        case "quit":
        case "exit":
          log("\n👋 Arrivederci!\n", "green");
          process.exit(0);
          break;

        default:
          log(`\n❌ Comando sconosciuto: /${command}`, "red");
          log("   Usa /help per vedere i comandi disponibili\n", "dim");
      }
    } else {
      // Natural language query (future: integrate with AI)
      log('\n💡 Per ora usa i comandi come /call. Scrivi /help per aiuto\n', "yellow");
    }
  }

  async start() {
    this.showWelcome();
    await this.connect();
    this.showHelp();

    // Main REPL loop
    while (true) {
      const input = await question("🏛️  > ");
      await this.handleCommand(input);
    }
  }
}

// Main
async function main() {
  const client = new MCPCLIClient();

  // Handle cleanup
  process.on("SIGINT", () => {
    log("\n\n👋 Interrupted. Goodbye!\n", "yellow");
    process.exit(0);
  });

  try {
    await client.start();
  } catch (error) {
    log(`\n❌ Fatal error: ${error}\n`, "red");
    process.exit(1);
  }
}

main();
