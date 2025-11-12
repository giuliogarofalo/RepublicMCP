/**
 * MCP Tools for Votazioni (Voting)
 */

import { senatoClient } from '../client.js';
import { SenatoVotazioniQueries } from '../queries/votazioni.js';
import type { VotazioneSearchParams } from '../ontology/types.js';

/**
 * Tool: Get recent votations
 */
export const getRecentVotazioniTool = {
  name: 'senato_get_votazioni_recenti',
  description: 'Ottieni le votazioni recenti al Senato con conteggi e esiti',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (default: 19 - corrente)',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYY-MM-DD) - opzionale',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYY-MM-DD) - opzionale',
      },
      esito: {
        type: 'string',
        description: 'Filtra per esito (es: "approvato", "respinto") - opzionale',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 50)',
      },
    },
  },
  handler: async (args: any) => {
    const params: VotazioneSearchParams = {
      legislature: args.legislatura,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      esito: args.esito,
      limit: args.limit,
    };

    const query = SenatoVotazioniQueries.getRecentVotazioni(params);
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
 * Tool: Get votation details
 */
export const getVotazioneDetailsTool = {
  name: 'senato_get_votazione_dettagli',
  description: 'Ottieni i dettagli completi di una votazione specifica (numero, data, conteggi, esito)',
  inputSchema: {
    type: 'object',
    properties: {
      numero: {
        type: 'string',
        description: 'Numero votazione (richiesto)',
      },
      data: {
        type: 'string',
        description: 'Data votazione (formato: YYYY-MM-DD, richiesto)',
      },
    },
    required: ['numero', 'data'],
  },
  handler: async (args: any) => {
    const query = SenatoVotazioniQueries.getVotazioneDetails(args.numero, args.data);
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
 * Tool: Get senator's votes
 */
export const getVotoSenatoreTool = {
  name: 'senato_get_voti_senatore',
  description: 'Ottieni i voti espressi da un senatore (favorevole, contrario, astenuto)',
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
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYY-MM-DD) - opzionale',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYY-MM-DD) - opzionale',
      },
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (default: 19 - corrente)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 50)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params = {
      lastName: args.cognome,
      firstName: args.nome,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      legislature: args.legislatura,
      limit: args.limit,
    };

    const query = SenatoVotazioniQueries.getVotoSenatore(params);
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
 * Tool: Get voting statistics for senator
 */
export const getStatisticheVotoSenatoreTool = {
  name: 'senato_get_statistiche_voto_senatore',
  description: 'Ottieni le statistiche di voto di un senatore (numero voti favorevoli, contrari, astenuti)',
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
        description: 'Numero legislatura (default: 19 - corrente)',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYY-MM-DD) - opzionale',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYY-MM-DD) - opzionale',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params = {
      lastName: args.cognome,
      firstName: args.nome,
      legislature: args.legislatura,
      dateFrom: args.data_da,
      dateTo: args.data_a,
    };

    const query = SenatoVotazioniQueries.getStatisticheVotoSenatore(params);
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
 * Tool: Get votations by outcome
 */
export const getVotazioniByEsitoTool = {
  name: 'senato_get_votazioni_per_esito',
  description: 'Ottieni le votazioni filtrate per esito (approvato, respinto, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      esito: {
        type: 'string',
        description: 'Esito votazione (es: "approvato", "respinto") - richiesto',
      },
      legislatura: {
        type: 'number',
        description: 'Numero legislatura (default: 19 - corrente)',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYY-MM-DD) - opzionale',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYY-MM-DD) - opzionale',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 50)',
      },
    },
    required: ['esito'],
  },
  handler: async (args: any) => {
    const params: VotazioneSearchParams = {
      legislature: args.legislatura,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      limit: args.limit,
    };

    const query = SenatoVotazioniQueries.getVotazioniByEsito(args.esito, params);
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
 * Tool: Get individual votes for a votation
 */
export const getVotiIndividualiTool = {
  name: 'senato_get_voti_individuali',
  description: 'Ottieni i voti individuali di tutti i senatori per una votazione specifica',
  inputSchema: {
    type: 'object',
    properties: {
      numero: {
        type: 'string',
        description: 'Numero votazione (richiesto)',
      },
      data: {
        type: 'string',
        description: 'Data votazione (formato: YYYY-MM-DD, richiesto)',
      },
    },
    required: ['numero', 'data'],
  },
  handler: async (args: any) => {
    const query = SenatoVotazioniQueries.getVotiIndividuali(args.numero, args.data);
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
 * Export all votazioni tools
 */
export const votazioniTools = [
  getRecentVotazioniTool,
  getVotazioneDetailsTool,
  getVotoSenatoreTool,
  getStatisticheVotoSenatoreTool,
  getVotazioniByEsitoTool,
  getVotiIndividualiTool,
];
