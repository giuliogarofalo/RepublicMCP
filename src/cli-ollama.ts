#!/usr/bin/env node

/**
 * Interactive CLI client for RepublicMCP with Ollama integration
 * Uses codellama:7b-instrucT for natural language queries
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Ollama } from "ollama";
import readline from "readline";

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

class MCPOllamaClient {
  private mcpClient: Client;
  private ollama: Ollama;
  private transport: StdioClientTransport | null = null;
  private tools: any[] = [];
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    this.mcpClient = new Client(
      {
        name: "republic-ollama-client",
        version: "0.1.0",
      },
      {
        capabilities: {},
      }
    );

    this.ollama = new Ollama({ host: "http://localhost:11434" });
  }

  async connect() {
    log("\n🔌 Connessione al server MCP...", "yellow");

    this.transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
    });

    await this.mcpClient.connect(this.transport);
    log("✓ Connesso al server MCP", "green");

    // List available tools (hardcoded for now due to SDK issues)
    this.tools = [
      { name: "search_deputati", description: "Cerca deputati per nome, cognome o legislatura" },
      { name: "get_deputato_info", description: "Info dettagliate su un deputato" },
      { name: "search_atti", description: "Cerca atti parlamentari" },
      { name: "get_atto_info", description: "Info dettagliate su un atto" },
      { name: "get_votazioni", description: "Ottieni votazioni" },
      { name: "get_gruppi_parlamentari", description: "Lista gruppi parlamentari" },
      { name: "get_commissioni", description: "Lista commissioni" },
      { name: "get_governi", description: "Info sui governi" },
      { name: "get_governo_membri", description: "Membri di un governo" },
      { name: "search_interventi", description: "Cerca interventi in aula" },
      { name: "get_atti_con_fasi", description: "Atti con fasi iter e date approvazione" },
      { name: "get_atti_deputato", description: "Atti presentati da deputato" },
      { name: "get_espressioni_voto", description: "Voti dettagliati per votazione" },
      { name: "get_statistiche_voto_deputato", description: "Statistiche voti deputato" },
      { name: "get_incarichi_governo_deputati", description: "Incarichi governo deputati" },
      { name: "get_interventi_per_argomento", description: "Interventi per argomento" },
      { name: "get_incarichi_gruppi_parlamentari", description: "Incarichi gruppi parlamentari" },
      { name: "get_incarichi_organi_parlamentari", description: "Incarichi organi parlamentari" },
      { name: "execute_sparql", description: "Query SPARQL personalizzate" },
    ];
    log(`✓ Caricati ${this.tools.length} tools MCP`, "green");

    // Test Ollama connection
    const model = process.env.OLLAMA_MODEL || "codellama:7b-instrucT";
    log(`\n🤖 Connessione a Ollama (${model})...`, "yellow");
    try {
      const models = await this.ollama.list();

      // Check for model with multiple strategies
      const modelBase = model.split(":")[0];
      const hasModel = models.models?.some((m: any) => {
        // Try exact match first
        if (m.name === model) return true;
        // Try base name match (e.g., "deepseek-coder")
        if (m.name && m.name.startsWith(modelBase)) return true;
        // Try model field if exists
        if (m.model === model) return true;
        return false;
      });

      if (!hasModel) {
        log(`\n⚠️  Modello ${model} non trovato!`, "yellow");
        log(`💡 Scaricalo con: ollama pull ${model}`, "cyan");
        log("   Modelli consigliati:", "cyan");
        log("   - gemma2:2b (veloce, buono)", "dim");
        log("   - llama3.2:3b (bilanciato)", "dim");
        log("   - qwen2.5:3b (ottimo per task)", "dim");
        log("   - mistral:7b (molto accurato)\n", "dim");
      } else {
        log(`✓ Modello ${model} trovato e pronto`, "green");
      }

      log("✓ Ollama connesso", "green");
    } catch (error) {
      log("⚠️  Ollama non disponibile. Usa /call per query dirette.", "yellow");
    }
  }

  showWelcome() {
    log("\n" + "=".repeat(70), "cyan");
    log("  RepublicMCP con Ollama - Client Interattivo", "bright");
    log("  Chiedi in linguaggio naturale sui dati del Parlamento", "dim");
    log("=".repeat(70) + "\n", "cyan");
  }

  showHelp() {
    log("\n📚 Come usare:", "yellow");
    log("  • Scrivi una domanda in linguaggio naturale");
    log('    Es: "Chi è Giorgia Meloni?"');
    log('    Es: "Mostrami le ultime votazioni"');
    log('    Es: "Quali sono i gruppi parlamentari?"');
    log("");
    log("💡 Comandi speciali:", "yellow");
    log("  /tools    - Lista dei tools MCP disponibili");
    log("  /help     - Mostra questo aiuto");
    log("  /clear    - Pulisci la conversazione");
    log("  /quit     - Esci\n");
  }

  getToolsContext(): string {
    return this.tools
      .map((tool) => {
        const params = tool.inputSchema?.properties || {};
        const paramsList = Object.keys(params)
          .map((key) => `${key}: ${params[key].description || params[key].type}`)
          .join(", ");

        return `- ${tool.name}(${paramsList}): ${tool.description}`;
      })
      .join("\n");
  }

  async processNaturalLanguage(userInput: string): Promise<void> {
    log("\n🤔 Analizzando la domanda...", "dim");

    const systemPrompt = `You are helping query Italian Parliament data.

Available tools:
- search_deputati: params {cognome, nome, legislatura}
- search_atti: params {titolo, tipo, legislatura, limit}
- get_votazioni: params {limit, data_da, data_a}
- get_gruppi_parlamentari: params {legislatura}
- get_commissioni: params {legislatura, tipo}
- get_governi: params {include_membri}
- get_governo_membri: params {uri}
- search_interventi: params {argomento, legislatura, limit}
- get_atti_con_fasi: params {legislatura, data_da, data_a, limit}
- get_atti_deputato: params {cognome, nome, legislatura, ruolo, limit}
- get_espressioni_voto: params {data, numero}
- get_statistiche_voto_deputato: params {cognome, nome, legislatura, tipo_voto, data_da, data_a}
- get_incarichi_governo_deputati: params {legislatura, cognome, nome}
- get_interventi_per_argomento: params {argomento, legislatura, cognome, nome, limit}
- get_incarichi_gruppi_parlamentari: params {legislatura}
- get_incarichi_organi_parlamentari: params {legislatura}

Return ONLY valid JSON (no markdown, no backticks):
{"tool": "tool_name", "params": {...}, "reasoning": "why"}

Examples:
Q: Chi è Meloni? A: {"tool":"search_deputati","params":{"cognome":"Meloni"},"reasoning":"search by surname"}
Q: Ultime 5 votazioni A: {"tool":"get_votazioni","params":{"limit":5},"reasoning":"get recent votes"}
Q: Gruppi parlamentari A: {"tool":"get_gruppi_parlamentari","params":{},"reasoning":"list groups"}
Q: Atti ecologia A: {"tool":"search_atti","params":{"titolo":"ecologia","limit":3},"reasoning":"search acts by keyword"}
Q: Atti presentati da Meloni A: {"tool":"get_atti_deputato","params":{"cognome":"Meloni"},"reasoning":"acts by deputy"}
Q: Interventi sull'immigrazione A: {"tool":"get_interventi_per_argomento","params":{"argomento":"immigrazione","limit":10},"reasoning":"interventions on topic"}
Q: Statistiche voti Rossi A: {"tool":"get_statistiche_voto_deputato","params":{"cognome":"Rossi"},"reasoning":"voting stats"}
Q: Incarichi di governo A: {"tool":"get_incarichi_governo_deputati","params":{},"reasoning":"government positions"}
Q: Atti con iter completo A: {"tool":"get_atti_con_fasi","params":{"limit":20},"reasoning":"acts with phases"}

CRITICAL: Return ONLY the JSON object. NO other text.`;

    try {
      // Usa modello da env o default
      const model = process.env.OLLAMA_MODEL || "codellama:7b-instrucT";

      const response = await this.ollama.chat({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput },
        ],
        stream: false,
        options: {
          temperature: 0.1, // Più deterministico
          top_p: 0.9,
        },
        format: "json", // Forza output JSON
      });

      let aiResponse = response.message.content;

      // Remove markdown code blocks if present
      aiResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/`/g, "")
        .trim();

      // Remove any text before first { and after last }
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = jsonMatch[0];
      }

      log(`\n🤖 AI: ${aiResponse}`, "dim");

      // Parse AI response
      const parsed = JSON.parse(aiResponse);

      if (parsed.error) {
        log(`\n❌ ${parsed.error}`, "red");
        if (parsed.suggestion) {
          log(`💡 ${parsed.suggestion}`, "yellow");
        }
        return;
      }

      if (parsed.reasoning) {
        log(`\n💭 ${parsed.reasoning}`, "dim");
      }

      // Call the tool
      await this.callTool(parsed.tool, parsed.params);
    } catch (error: any) {
      if (error.message?.includes("model")) {
        log("\n❌ Modello codellama:7b-instrucT non trovato.", "red");
        log("💡 Esegui: ollama pull codellama:7b-instrucT", "yellow");
      } else {
        log(`\n❌ Errore nell'analisi: ${error.message}`, "red");
        log("💡 Prova a riformulare la domanda o usa /help", "yellow");
      }
    }
  }

  async callTool(toolName: string, params: any) {
    try {
      log(`\n⚙️  Chiamando ${toolName}...`, "yellow");

      // @ts-ignore
      const result = (await this.mcpClient.callTool({
        name: toolName,
        arguments: params,
      })) as any;

      log("\n✓ Risposta ricevuta:", "green");
      log("─".repeat(70), "dim");

      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === "text") {
          try {
            const parsed = JSON.parse(content.text);

            // Format the result nicely
            if (parsed.results?.bindings) {
              const bindings = parsed.results.bindings;
              log(`\n📊 Trovati ${bindings.length} risultati:\n`, "green");

              bindings.slice(0, 5).forEach((binding: any, index: number) => {
                log(`${index + 1}. `, "bright");
                Object.entries(binding).forEach(([key, value]: [string, any]) => {
                  log(`   ${key}: ${value.value}`, "cyan");
                });
                log("");
              });

              if (bindings.length > 5) {
                log(`... e altri ${bindings.length - 5} risultati`, "dim");
              }
            } else {
              log(JSON.stringify(parsed, null, 2), "cyan");
            }
          } catch {
            log(content.text, "cyan");
          }
        }
      }

      log("─".repeat(70) + "\n", "dim");
    } catch (error: any) {
      log(`\n❌ Errore: ${error.message}\n`, "red");
    }
  }

  showTools() {
    log("\n🔧 Tools MCP disponibili:\n", "yellow");
    this.tools.forEach((tool, index) => {
      log(`${index + 1}. ${tool.name}`, "bright");
      log(`   ${tool.description}`, "dim");

      if (tool.inputSchema?.properties) {
        const props = tool.inputSchema.properties;
        const required = tool.inputSchema.required || [];
        log("   Parametri:", "yellow");
        Object.keys(props).forEach((key) => {
          const prop = props[key];
          const req = required.includes(key) ? " [obbligatorio]" : "";
          log(`   • ${key}${req}: ${prop.description}`, "dim");
        });
      }
      log("");
    });
  }

  async handleInput(input: string) {
    const trimmed = input.trim();

    if (!trimmed) return;

    // Commands
    if (trimmed.startsWith("/")) {
      const command = trimmed.slice(1).toLowerCase();

      switch (command) {
        case "help":
          this.showHelp();
          break;

        case "tools":
          this.showTools();
          break;

        case "clear":
          this.conversationHistory = [];
          log("\n✓ Conversazione pulita\n", "green");
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
      // Natural language query
      await this.processNaturalLanguage(trimmed);
    }
  }

  async start() {
    this.showWelcome();
    await this.connect();
    this.showHelp();

    log("💡 Suggerimenti:", "yellow");
    log('   "Chi sono i membri del governo?"');
    log('   "Cerca deputati con cognome Rossi"');
    log('   "Ultime 5 votazioni"\n');

    // Main REPL loop
    while (true) {
      const input = await question("🏛️  > ");
      await this.handleInput(input);
    }
  }
}

// Main
async function main() {
  const client = new MCPOllamaClient();

  // Handle cleanup
  process.on("SIGINT", () => {
    log("\n\n👋 Interrotto. Ciao!\n", "yellow");
    process.exit(0);
  });

  try {
    await client.start();
  } catch (error: any) {
    log(`\n❌ Errore fatale: ${error.message}\n`, "red");
    if (error.message?.includes("ECONNREFUSED")) {
      log("💡 Assicurati che Ollama sia in esecuzione:", "yellow");
      log("   brew services start ollama", "dim");
      log("   oppure: ollama serve\n", "dim");
    }
    process.exit(1);
  }
}

main();
