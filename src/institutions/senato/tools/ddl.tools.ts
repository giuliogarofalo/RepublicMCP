/**
 * MCP Tools for DDL (Disegni di Legge - Bills)
 */

import { senatoClient } from '../client.js';
import { SenatoDdlQueries } from '../queries/ddl.js';
import type { DdlSearchParams } from '../ontology/types.js';

/**
 * Tool: Get recent DDL
 */
export const getRecentDdlTool = {
  name: 'senato_get_ddl_recenti',
  description: 'Ottieni i disegni di legge (DDL) recenti presentati al Senato',
  inputSchema: {
    type: 'object',
    properties: {
      stato: {
        type: 'string',
        description: 'Filtra per stato (es: "In corso", "Approvato", "Respinto") - opzionale',
      },
      ramo: {
        type: 'string',
        description: 'Ramo: "Senato" o "Camera" (default: "Senato")',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYY-MM-DD, default: inizio legislatura corrente)',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYY-MM-DD) - opzionale',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 100)',
      },
    },
  },
  handler: async (args: any) => {
    const params: DdlSearchParams = {
      stato: args.stato,
      ramo: args.ramo,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      limit: args.limit,
    };

    const query = SenatoDdlQueries.getRecentDdl(params);
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
 * Tool: Get DDL by senator
 */
export const getDdlBySenatoreTool = {
  name: 'senato_get_ddl_senatore',
  description: 'Ottieni i disegni di legge presentati o firmati da un senatore',
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
      solo_primo_firmatario: {
        type: 'boolean',
        description: 'Solo DDL come primo firmatario (default: false - mostra tutti)',
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
        description: 'Numero massimo risultati (default: 100)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params: DdlSearchParams = {
      sponsorLastName: args.cognome,
      sponsorFirstName: args.nome,
      firstSignerOnly: args.solo_primo_firmatario || false,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      limit: args.limit,
    };

    const query = SenatoDdlQueries.getDdlBySenatore(params);
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
 * Tool: Get DDL by status
 */
export const getDdlByStatoTool = {
  name: 'senato_get_ddl_per_stato',
  description: 'Ottieni i disegni di legge filtrati per stato (In corso, Approvato, Respinto, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      stato: {
        type: 'string',
        description: 'Stato DDL (es: "In corso", "Approvato", "Respinto", "Decaduto")',
      },
      ramo: {
        type: 'string',
        description: 'Ramo: "Senato" o "Camera" (default: "Senato")',
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
        description: 'Numero massimo risultati (default: 100)',
      },
    },
    required: ['stato'],
  },
  handler: async (args: any) => {
    const params: DdlSearchParams = {
      ramo: args.ramo,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      limit: args.limit,
    };

    const query = SenatoDdlQueries.getDdlByStato(args.stato, params);
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
 * Tool: Get DDL details with iteration
 */
export const getDdlWithIterTool = {
  name: 'senato_get_ddl_iter',
  description: 'Ottieni i dettagli completi di un DDL incluso l\'iter legislativo (tutte le fasi)',
  inputSchema: {
    type: 'object',
    properties: {
      id_ddl: {
        type: 'number',
        description: 'ID del disegno di legge (richiesto)',
      },
    },
    required: ['id_ddl'],
  },
  handler: async (args: any) => {
    const query = SenatoDdlQueries.getDdlWithIter(args.id_ddl);
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
 * Tool: Get DDL with sponsors
 */
export const getDdlWithSponsorsTool = {
  name: 'senato_get_ddl_firmatari',
  description: 'Ottieni tutti i firmatari (sponsor) di un disegno di legge specifico',
  inputSchema: {
    type: 'object',
    properties: {
      id_ddl: {
        type: 'number',
        description: 'ID del disegno di legge (richiesto)',
      },
    },
    required: ['id_ddl'],
  },
  handler: async (args: any) => {
    const query = SenatoDdlQueries.getDdlWithSponsors(args.id_ddl);
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
 * Tool: Get DDL complete details
 */
export const getDdlDetailsTool = {
  name: 'senato_get_ddl_dettagli',
  description: 'Ottieni tutti i dettagli di un disegno di legge (titolo, natura, date, testi, stato)',
  inputSchema: {
    type: 'object',
    properties: {
      id_ddl: {
        type: 'number',
        description: 'ID del disegno di legge (richiesto)',
      },
    },
    required: ['id_ddl'],
  },
  handler: async (args: any) => {
    const query = SenatoDdlQueries.getDdlDetails(args.id_ddl);
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
 * Tool: Search DDL by title
 */
export const searchDdlByTitleTool = {
  name: 'senato_cerca_ddl_per_titolo',
  description: 'Cerca disegni di legge per parola chiave nel titolo',
  inputSchema: {
    type: 'object',
    properties: {
      parola_chiave: {
        type: 'string',
        description: 'Parola o frase da cercare nel titolo (richiesto)',
      },
      ramo: {
        type: 'string',
        description: 'Ramo: "Senato" o "Camera" (default: "Senato")',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYY-MM-DD) - opzionale',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo risultati (default: 100)',
      },
    },
    required: ['parola_chiave'],
  },
  handler: async (args: any) => {
    const params: DdlSearchParams = {
      ramo: args.ramo,
      dateFrom: args.data_da,
      limit: args.limit,
    };

    const query = SenatoDdlQueries.searchDdlByTitle(args.parola_chiave, params);
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
 * Export all DDL tools
 */
export const ddlTools = [
  getRecentDdlTool,
  getDdlBySenatoreTool,
  getDdlByStatoTool,
  getDdlWithIterTool,
  getDdlWithSponsorsTool,
  getDdlDetailsTool,
  searchDdlByTitleTool,
];
