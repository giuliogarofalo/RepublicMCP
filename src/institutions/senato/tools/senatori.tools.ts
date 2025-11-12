/**
 * MCP Tools for Senatori (Senators)
 */

import { senatoClient } from '../client.js';
import { SenatoSenatoriQueries } from '../queries/senatori.js';
import type { SenatoreSearchParams } from '../ontology/types.js';
import type { MCPTool } from '../../../core/mcp/types.js';

/**
 * Tool: Get current senators
 */
export const getCurrentSenatoriTool: MCPTool = {
  name: 'senato_get_senatori_correnti',
  description: 'Ottieni l\'elenco dei senatori attualmente in carica al Senato della Repubblica',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: {
        type: 'string',
        description: 'Filtra per cognome (opzionale, case-insensitive)',
      },
      nome: {
        type: 'string',
        description: 'Filtra per nome (opzionale, case-insensitive)',
      },
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (default: 19 - corrente)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 500)',
      },
    },
  },
  handler: async (args: any) => {
    const params: SenatoreSearchParams = {
      lastName: args.cognome,
      firstName: args.nome,
      legislature: args.legislatura,
      limit: args.limit,
    };

    const query = SenatoSenatoriQueries.getCurrentSenators(params);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Tool: Search senators
 */
export const searchSenatoriTool: MCPTool = {
  name: 'senato_cerca_senatori',
  description: 'Cerca senatori al Senato con filtri avanzati (nome, cognome, legislatura, tipo mandato, regione)',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: {
        type: 'string',
        description: 'Cognome senatore (richiesto)',
      },
      nome: {
        type: 'string',
        description: 'Nome senatore (opzionale)',
      },
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (opzionale)',
      },
      solo_in_carica: {
        type: 'boolean',
        description: 'Solo senatori attualmente in carica (default: true)',
      },
      tipo_mandato: {
        type: 'string',
        description: 'Tipo mandato: "ordinario", "a vita, di nomina del Presidente della Repubblica", "di diritto e a vita, Presidente emerito della Repubblica"',
      },
      regione: {
        type: 'string',
        description: 'Regione di elezione (opzionale)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 100)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params: SenatoreSearchParams = {
      lastName: args.cognome,
      firstName: args.nome,
      legislature: args.legislatura,
      active: args.solo_in_carica !== false,
      mandateType: args.tipo_mandato,
      region: args.regione,
      limit: args.limit,
    };

    const query = SenatoSenatoriQueries.searchSenators(params);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Tool: Get senator details
 */
export const getSenatoreDetailsTool: MCPTool = {
  name: 'senato_get_senatore_dettagli',
  description: 'Ottieni informazioni complete su un senatore (anagrafica, foto, nascita, residenza)',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: {
        type: 'string',
        description: 'Cognome senatore (richiesto)',
      },
      nome: {
        type: 'string',
        description: 'Nome senatore (opzionale per disambiguare)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const query = SenatoSenatoriQueries.getSenatoreDetails(args.cognome, args.nome);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Tool: Get senator mandates (historical)
 */
export const getSenatoreManadateTool: MCPTool = {
  name: 'senato_get_senatore_mandati',
  description: 'Ottieni la storia dei mandati parlamentari di un senatore (tutte le legislature)',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: {
        type: 'string',
        description: 'Cognome senatore (richiesto)',
      },
      nome: {
        type: 'string',
        description: 'Nome senatore (opzionale)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const query = SenatoSenatoriQueries.getSenatoreMandate(args.cognome, args.nome);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Tool: Get life senators
 */
export const getLifeSenatorsTool: MCPTool = {
  name: 'senato_get_senatori_a_vita',
  description: 'Ottieni l\'elenco dei senatori a vita (nominati dal Presidente o ex Presidenti della Repubblica)',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (opzionale, default: corrente)',
      },
    },
  },
  handler: async (args: any) => {
    const query = SenatoSenatoriQueries.getLifeSenators(args.legislatura);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Tool: Get senators by legislature
 */
export const getSenatoriByLegislatureTool: MCPTool = {
  name: 'senato_get_senatori_per_legislatura',
  description: 'Ottieni tutti i senatori di una specifica legislatura',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (es: 19 per XIX legislatura, 18 per XVIII, ecc.)',
      },
    },
    required: ['legislatura'],
  },
  handler: async (args: any) => {
    const query = SenatoSenatoriQueries.getSenatoriByLegislature(args.legislatura);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Tool: Get senators by region
 */
export const getSenatoriByRegionTool: MCPTool = {
  name: 'senato_get_senatori_per_regione',
  description: 'Ottieni i senatori eletti in una specifica regione',
  institution: 'senato',
  inputSchema: {
    type: 'object',
    properties: {
      regione: {
        type: 'string',
        description: 'Nome regione (es: "Lombardia", "Lazio", "Sicilia")',
      },
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (opzionale, default: corrente)',
      },
    },
    required: ['regione'],
  },
  handler: async (args: any) => {
    const query = SenatoSenatoriQueries.getSenatoriByRegion(args.regione, args.legislatura);
    const result = await senatoClient.select(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

/**
 * Export all senatori tools
 */
export const senatoriTools = [
  getCurrentSenatoriTool,
  searchSenatoriTool,
  getSenatoreDetailsTool,
  getSenatoreManadateTool,
  getLifeSenatorsTool,
  getSenatoriByLegislatureTool,
  getSenatoriByRegionTool,
];
