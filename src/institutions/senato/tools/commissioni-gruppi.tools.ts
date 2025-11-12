/**
 * MCP Tools for Commissioni (Commissions) and Gruppi (Groups)
 */

import { senatoClient } from '../client.js';
import { SenatoCommissioniQueries } from '../queries/commissioni.js';
import { SenatoGruppiQueries } from '../queries/gruppi.js';

// ============== COMMISSIONI TOOLS ==============

/**
 * Tool: Get active commissions
 */
export const getCommissioniAttiveTool = {
  name: 'senato_get_commissioni_attive',
  description: 'Ottieni l\'elenco delle commissioni parlamentari attive al Senato',
  inputSchema: {
    type: 'object',
    properties: {
      ordinale: {
        type: 'string',
        description: 'Filtra per numero ordinale (es: "1", "2", etc.) - opzionale',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 100)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      ordinale: args.ordinale,
      limit: args.limit,
    };

    const query = SenatoCommissioniQueries.getCommissioniAttive(params);
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
 * Tool: Get commission composition
 */
export const getComposizioneCommissioneTool = {
  name: 'senato_get_composizione_commissione',
  description: 'Ottieni la composizione (membri) di una commissione parlamentare',
  inputSchema: {
    type: 'object',
    properties: {
      ordinale: {
        type: 'string',
        description: 'Numero ordinale commissione (es: "1" per 1ª Commissione)',
      },
      solo_in_carica: {
        type: 'boolean',
        description: 'Solo membri attualmente in carica (default: true)',
      },
    },
    required: ['ordinale'],
  },
  handler: async (args: any) => {
    const params = {
      ordinale: args.ordinale,
      active: args.solo_in_carica !== false,
    };

    const query = SenatoCommissioniQueries.getComposizioneCommissione(params);
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
 * Tool: Get senator's commissions
 */
export const getCommissioniSenatoreTool = {
  name: 'senato_get_commissioni_senatore',
  description: 'Ottieni le commissioni di cui fa o ha fatto parte un senatore',
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
      solo_in_carica: {
        type: 'boolean',
        description: 'Solo commissioni attuali (default: true)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params = {
      lastName: args.cognome,
      firstName: args.nome,
      active: args.solo_in_carica !== false,
    };

    const query = SenatoCommissioniQueries.getCommissioniSenatore(params);
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

// ============== GRUPPI TOOLS ==============

/**
 * Tool: Get active parliamentary groups
 */
export const getGruppiAttiviTool = {
  name: 'senato_get_gruppi_attivi',
  description: 'Ottieni l\'elenco dei gruppi parlamentari attivi al Senato',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 100)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      limit: args.limit,
    };

    const query = SenatoGruppiQueries.getGruppiAttivi(params);
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
 * Tool: Get group composition
 */
export const getComposizioneGruppoTool = {
  name: 'senato_get_composizione_gruppo',
  description: 'Ottieni la composizione (membri) di un gruppo parlamentare',
  inputSchema: {
    type: 'object',
    properties: {
      nome_gruppo: {
        type: 'string',
        description: 'Nome o parte del nome del gruppo (es: "Fratelli d\'Italia", "Lega")',
      },
      solo_in_carica: {
        type: 'boolean',
        description: 'Solo membri attualmente in carica (default: true)',
      },
    },
    required: ['nome_gruppo'],
  },
  handler: async (args: any) => {
    const params = {
      groupName: args.nome_gruppo,
      active: args.solo_in_carica !== false,
    };

    const query = SenatoGruppiQueries.getComposizioneGruppo(params);
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
 * Tool: Get senator's groups
 */
export const getGruppiSenatoreTool = {
  name: 'senato_get_gruppi_senatore',
  description: 'Ottieni i gruppi parlamentari di cui fa o ha fatto parte un senatore',
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
      solo_in_carica: {
        type: 'boolean',
        description: 'Solo gruppo attuale (default: true)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params = {
      lastName: args.cognome,
      firstName: args.nome,
      active: args.solo_in_carica !== false,
    };

    const query = SenatoGruppiQueries.getGruppiSenatore(params);
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
 * Export all commissioni and gruppi tools
 */
export const commissioniGruppiTools = [
  // Commissioni
  getCommissioniAttiveTool,
  getComposizioneCommissioneTool,
  getCommissioniSenatoreTool,
  // Gruppi
  getGruppiAttiviTool,
  getComposizioneGruppoTool,
  getGruppiSenatoreTool,
];
