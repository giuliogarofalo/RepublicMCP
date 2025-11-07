#!/usr/bin/env node

/**
 * RepublicMCP - MCP Server for Italian Parliament Open Data
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { cameraClient } from "./sparql/client.js";
import { QueryBuilder } from "./sparql/queries.js";
import {
  DeputySearchParams,
  ActSearchParams,
  VotingSearchParams,
  OrganSearchParams,
  GovernmentSearchParams,
} from "./types/ontology.js";

// Server instance
const server = new Server(
  {
    name: "republic-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: "search_deputati",
    description:
      "Cerca deputati della Camera per nome, cognome o legislatura. Restituisce informazioni biografiche, gruppo parlamentare e collegio elettorale.",
    inputSchema: {
      type: "object",
      properties: {
        nome: {
          type: "string",
          description: "Nome del deputato (opzionale)",
        },
        cognome: {
          type: "string",
          description: "Cognome del deputato (opzionale)",
        },
        legislatura: {
          type: "string",
          description: 'Legislatura (es: "repubblica_19" per la XIX legislatura, default: corrente)',
        },
      },
    },
  },
  {
    name: "get_deputato_info",
    description:
      "Ottiene informazioni dettagliate su un deputato specifico dato il suo URI. Include biografia, mandati, gruppo parlamentare, commissioni e incarichi.",
    inputSchema: {
      type: "object",
      properties: {
        uri: {
          type: "string",
          description: "URI completo del deputato (es: http://dati.camera.it/ocd/deputato.rdf/d123_19)",
        },
      },
      required: ["uri"],
    },
  },
  {
    name: "search_atti",
    description:
      "Cerca atti parlamentari (disegni di legge, proposte, mozioni) per titolo, tipo o legislatura.",
    inputSchema: {
      type: "object",
      properties: {
        titolo: {
          type: "string",
          description: "Parole chiave nel titolo dell'atto (opzionale)",
        },
        tipo: {
          type: "string",
          description: "Tipo di atto (es: 'disegno di legge', 'mozione', opzionale)",
        },
        legislatura: {
          type: "string",
          description: 'Legislatura (es: "repubblica_19", default: corrente)',
        },
        stato: {
          type: "string",
          description: "Stato dell'iter (opzionale)",
        },
        limit: {
          type: "number",
          description: "Numero massimo di risultati (default: 20)",
        },
      },
    },
  },
  {
    name: "get_atto_info",
    description:
      "Ottiene informazioni dettagliate su un atto parlamentare specifico, incluse le fasi dell'iter, i proponenti e le votazioni.",
    inputSchema: {
      type: "object",
      properties: {
        uri: {
          type: "string",
          description: "URI completo dell'atto (es: http://dati.camera.it/ocd/attocamera.rdf/ac19_1234)",
        },
      },
      required: ["uri"],
    },
  },
  {
    name: "get_votazioni",
    description: "Ottiene le votazioni recenti o relative ad un atto specifico.",
    inputSchema: {
      type: "object",
      properties: {
        atto_uri: {
          type: "string",
          description: "URI dell'atto (opzionale, per filtrare votazioni su un atto specifico)",
        },
        data_da: {
          type: "string",
          description: "Data inizio nel formato YYYYMMDD (opzionale)",
        },
        data_a: {
          type: "string",
          description: "Data fine nel formato YYYYMMDD (opzionale)",
        },
        limit: {
          type: "number",
          description: "Numero massimo di risultati (default: 20)",
        },
      },
    },
  },
  {
    name: "get_gruppi_parlamentari",
    description: "Ottiene la lista dei gruppi parlamentari per una determinata legislatura.",
    inputSchema: {
      type: "object",
      properties: {
        legislatura: {
          type: "string",
          description: 'Legislatura (es: "repubblica_19", default: corrente)',
        },
      },
    },
  },
  {
    name: "get_commissioni",
    description: "Ottiene la lista delle commissioni e organi parlamentari.",
    inputSchema: {
      type: "object",
      properties: {
        legislatura: {
          type: "string",
          description: 'Legislatura (es: "repubblica_19", default: corrente)',
        },
        tipo: {
          type: "string",
          description: "Tipo di organo (es: 'commissione', opzionale)",
        },
      },
    },
  },
  {
    name: "get_governi",
    description: "Ottiene informazioni sui governi della Repubblica.",
    inputSchema: {
      type: "object",
      properties: {
        include_membri: {
          type: "boolean",
          description: "Include i membri del governo (default: false)",
        },
      },
    },
  },
  {
    name: "get_governo_membri",
    description: "Ottiene i membri di un governo specifico.",
    inputSchema: {
      type: "object",
      properties: {
        uri: {
          type: "string",
          description: "URI del governo",
        },
      },
      required: ["uri"],
    },
  },
  {
    name: "search_interventi",
    description:
      "Cerca interventi in aula su un argomento specifico. Restituisce i deputati che sono intervenuti e le relative sedute.",
    inputSchema: {
      type: "object",
      properties: {
        argomento: {
          type: "string",
          description: "Argomento o parola chiave da cercare negli interventi",
        },
        legislatura: {
          type: "string",
          description: 'Legislatura (es: "repubblica_19", default: corrente)',
        },
        limit: {
          type: "number",
          description: "Numero massimo di risultati (default: 20)",
        },
      },
      required: ["argomento"],
    },
  },
  {
    name: "execute_sparql",
    description:
      "Esegue una query SPARQL personalizzata sull'endpoint della Camera dei Deputati. Per utenti avanzati.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Query SPARQL da eseguire",
        },
      },
      required: ["query"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error("Missing arguments");
    }

    switch (name) {
      case "search_deputati": {
        const params: DeputySearchParams = {
          firstName: args.nome as string,
          surname: args.cognome as string,
          legislature: args.legislatura as string,
        };
        const query = QueryBuilder.getCurrentDeputies(params);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_deputato_info": {
        const uri = args.uri as string;
        const query = QueryBuilder.getDeputyDetails(uri);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "search_atti": {
        const params: ActSearchParams = {
          title: args.titolo as string,
          actType: args.tipo as string,
          legislature: args.legislatura as string,
          status: args.stato as string,
          limit: args.limit as number,
        };
        const query = QueryBuilder.searchActs(params);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_atto_info": {
        const uri = args.uri as string;
        const query = QueryBuilder.getActDetails(uri);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_votazioni": {
        const params: VotingSearchParams = {
          actUri: args.atto_uri as string,
          dateFrom: args.data_da as string,
          dateTo: args.data_a as string,
          limit: args.limit as number,
        };
        const query = QueryBuilder.getVotings(params);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_gruppi_parlamentari": {
        const query = QueryBuilder.getParliamentaryGroups(args.legislatura as string);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_commissioni": {
        const params: OrganSearchParams = {
          legislature: args.legislatura as string,
          organType: args.tipo as string,
        };
        const query = QueryBuilder.getOrgans(params);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_governi": {
        const query = QueryBuilder.getGovernments();
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_governo_membri": {
        const uri = args.uri as string;
        const query = QueryBuilder.getGovernmentMembers(uri);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "search_interventi": {
        const argomento = args.argomento as string;
        const legislatura = args.legislatura as string;
        const limit = (args.limit as number) || 20;
        const query = QueryBuilder.searchInterventions(argomento, legislatura, limit);
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "execute_sparql": {
        const query = args.query as string;
        const result = await cameraClient.select(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RepublicMCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
