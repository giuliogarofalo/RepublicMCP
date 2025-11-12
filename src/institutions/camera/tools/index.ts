/**
 * Camera dei Deputati - MCP Tools
 * All 19+ tools for Camera implementation
 */

import { cameraClient } from '../client.js';
import {
  CameraDeputatiQueries,
  CameraAttiQueries,
  CameraVotazioniQueries,
  CameraOrganiQueries,
} from '../queries/index.js';
import type { MCPTool } from '../../../core/mcp/types.js';

// ============== DEPUTIES TOOLS ==============

/**
 * Tool: Search deputies
 */
const searchDeputatiTool: MCPTool = {
  name: 'search_deputati',
  description:
    'Cerca deputati della Camera per nome, cognome o legislatura. Restituisce informazioni biografiche, gruppo parlamentare e collegio elettorale.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      nome: {
        type: 'string',
        description: 'Nome del deputato (opzionale)',
      },
      cognome: {
        type: 'string',
        description: 'Cognome del deputato (opzionale)',
      },
      legislatura: {
        type: 'number',
        description: 'Legislatura (es: 19 per la XIX legislatura, default: 19)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      firstName: args.nome,
      surname: args.cognome,
      legislature: args.legislatura,
    };
    const query = CameraDeputatiQueries.getCurrentDeputies(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get deputy info
 */
const getDeputatoInfoTool: MCPTool = {
  name: 'get_deputato_info',
  description:
    'Ottiene informazioni dettagliate su un deputato specifico dato il suo URI. Include biografia, mandati, gruppo parlamentare, commissioni e incarichi.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      uri: {
        type: 'string',
        description: 'URI completo del deputato (es: http://dati.camera.it/ocd/deputato.rdf/d123_19)',
      },
    },
    required: ['uri'],
  },
  handler: async (args: any) => {
    const query = CameraDeputatiQueries.getDeputyDetails(args.uri);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== ACTS TOOLS ==============

/**
 * Tool: Search acts
 */
const searchAttiTool: MCPTool = {
  name: 'search_atti',
  description:
    'Cerca atti parlamentari (disegni di legge, proposte, mozioni) per titolo, tipo o legislatura.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      titolo: {
        type: 'string',
        description: 'Parole chiave nel titolo dell\'atto (opzionale)',
      },
      tipo: {
        type: 'string',
        description: 'Tipo di atto (es: \'disegno di legge\', \'mozione\', opzionale)',
      },
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      stato: {
        type: 'string',
        description: 'Stato dell\'iter (opzionale)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo di risultati (default: 20)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      title: args.titolo,
      actType: args.tipo,
      legislature: args.legislatura,
      status: args.stato,
      limit: args.limit,
    };
    const query = CameraAttiQueries.searchActs(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get act info
 */
const getAttoInfoTool: MCPTool = {
  name: 'get_atto_info',
  description:
    'Ottiene informazioni dettagliate su un atto parlamentare specifico, incluse le fasi dell\'iter, i proponenti e le votazioni.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      uri: {
        type: 'string',
        description: 'URI completo dell\'atto (es: http://dati.camera.it/ocd/attocamera.rdf/ac19_1234)',
      },
    },
    required: ['uri'],
  },
  handler: async (args: any) => {
    const query = CameraAttiQueries.getActDetails(args.uri);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get acts with iter phases
 */
const getAttiConFasiTool: MCPTool = {
  name: 'get_atti_con_fasi',
  description:
    'Ottieni atti con le loro fasi di iter e date di approvazione. Utile per seguire l\'evoluzione legislativa.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYYMMDD)',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYYMMDD)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo di risultati (default: 100)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      legislature: args.legislatura,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      limit: args.limit,
    };
    const query = CameraAttiQueries.getActsWithIterPhases(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get deputy acts
 */
const getAttiDeputatoTool: MCPTool = {
  name: 'get_atti_deputato',
  description:
    'Ottieni gli atti presentati da un deputato come primo firmatario o cofirmatario.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: {
        type: 'string',
        description: 'Cognome del deputato',
      },
      nome: {
        type: 'string',
        description: 'Nome del deputato (opzionale)',
      },
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      ruolo: {
        type: 'string',
        description: 'Ruolo: "primo_firmatario", "altro_firmatario", o "both" (default: both)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo di risultati (default: 100)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params = {
      surname: args.cognome,
      firstName: args.nome,
      legislature: args.legislatura,
      role: args.ruolo as 'primo_firmatario' | 'altro_firmatario' | 'both',
      limit: args.limit,
    };
    const query = CameraAttiQueries.getDeputyActs(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== VOTING TOOLS ==============

/**
 * Tool: Get votings
 */
const getVotazioniTool: MCPTool = {
  name: 'get_votazioni',
  description: 'Ottiene le votazioni recenti o relative ad un atto specifico.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      atto_uri: {
        type: 'string',
        description: 'URI dell\'atto (opzionale, per filtrare votazioni su un atto specifico)',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio nel formato YYYYMMDD (opzionale)',
      },
      data_a: {
        type: 'string',
        description: 'Data fine nel formato YYYYMMDD (opzionale)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo di risultati (default: 20)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      actUri: args.atto_uri,
      dateFrom: args.data_da,
      dateTo: args.data_a,
      limit: args.limit,
    };
    const query = CameraVotazioniQueries.getVotings(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get vote expressions
 */
const getEspressioniVotoTool: MCPTool = {
  name: 'get_espressioni_voto',
  description:
    'Ottieni i dettagli di voto di ogni deputato per una specifica votazione.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'Data votazione (formato: YYYYMMDD, es: 20140611)',
      },
      numero: {
        type: 'string',
        description: 'Numero votazione (es: 001)',
      },
    },
    required: ['data', 'numero'],
  },
  handler: async (args: any) => {
    const params = {
      date: args.data,
      voteNumber: args.numero,
    };
    const query = CameraVotazioniQueries.getVoteExpressions(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get deputy voting statistics
 */
const getStatisticheVotoDeputatoTool: MCPTool = {
  name: 'get_statistiche_voto_deputato',
  description:
    'Ottieni statistiche sui voti di un deputato (favorevoli, contrari, astenuti, etc).',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      cognome: {
        type: 'string',
        description: 'Cognome del deputato',
      },
      nome: {
        type: 'string',
        description: 'Nome del deputato (opzionale)',
      },
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      tipo_voto: {
        type: 'string',
        description: 'Tipo voto: "Favorevole", "Contrario", "Astensione", "Ha votato", "Non ha votato"',
      },
      data_da: {
        type: 'string',
        description: 'Data inizio periodo (formato: YYYYMM)',
      },
      data_a: {
        type: 'string',
        description: 'Data fine periodo (formato: YYYYMM)',
      },
    },
    required: ['cognome'],
  },
  handler: async (args: any) => {
    const params = {
      surname: args.cognome,
      firstName: args.nome,
      legislature: args.legislatura,
      voteType: args.tipo_voto,
      dateFrom: args.data_da,
      dateTo: args.data_a,
    };
    const query = CameraVotazioniQueries.getDeputyVotingStats(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== PARLIAMENTARY GROUPS & ORGANS TOOLS ==============

/**
 * Tool: Get parliamentary groups
 */
const getGruppiParlamentariTool: MCPTool = {
  name: 'get_gruppi_parlamentari',
  description: 'Ottiene la lista dei gruppi parlamentari per una determinata legislatura.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
    },
  },
  handler: async (args: any) => {
    const query = CameraOrganiQueries.getParliamentaryGroups({
      legislature: args.legislatura,
    });
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get commissions/organs
 */
const getCommissioniTool: MCPTool = {
  name: 'get_commissioni',
  description: 'Ottiene la lista delle commissioni e organi parlamentari.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      tipo: {
        type: 'string',
        description: 'Tipo di organo (es: \'commissione\', opzionale)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      legislature: args.legislatura,
      organType: args.tipo,
    };
    const query = CameraOrganiQueries.getOrgans(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get group positions
 */
const getIncarichiGruppiParlamentariTool: MCPTool = {
  name: 'get_incarichi_gruppi_parlamentari',
  description:
    'Ottieni gli incarichi nei gruppi parlamentari con date di inizio e fine.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
    },
  },
  handler: async (args: any) => {
    const query = CameraOrganiQueries.getParliamentaryGroupPositions({
      legislature: args.legislatura,
    });
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get organ positions
 */
const getIncarichiOrganiParlamentariTool: MCPTool = {
  name: 'get_incarichi_organi_parlamentari',
  description:
    'Ottieni gli incarichi negli organi parlamentari (commissioni, etc) con date.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
    },
  },
  handler: async (args: any) => {
    const query = CameraOrganiQueries.getParliamentaryOrganPositions({
      legislature: args.legislatura,
    });
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== GOVERNMENT TOOLS ==============

/**
 * Tool: Get governments
 */
const getGoverniTool: MCPTool = {
  name: 'get_governi',
  description: 'Ottiene informazioni sui governi della Repubblica.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      include_membri: {
        type: 'boolean',
        description: 'Include i membri del governo (default: false)',
      },
    },
  },
  handler: async (args: any) => {
    const query = CameraOrganiQueries.getGovernments();
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get government members
 */
const getGovernoMembriTool: MCPTool = {
  name: 'get_governo_membri',
  description: 'Ottiene i membri di un governo specifico.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      uri: {
        type: 'string',
        description: 'URI del governo',
      },
    },
    required: ['uri'],
  },
  handler: async (args: any) => {
    const query = CameraOrganiQueries.getGovernmentMembers(args.uri);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get government positions of deputies
 */
const getIncarichiGovernoDeputatiTool: MCPTool = {
  name: 'get_incarichi_governo_deputati',
  description:
    'Ottieni gli incarichi di governo ricoperti dai deputati.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      cognome: {
        type: 'string',
        description: 'Cognome del deputato (opzionale, per filtrare)',
      },
      nome: {
        type: 'string',
        description: 'Nome del deputato (opzionale, per filtrare)',
      },
    },
  },
  handler: async (args: any) => {
    const params = {
      legislature: args.legislatura,
      surname: args.cognome,
      firstName: args.nome,
    };
    const query = CameraDeputatiQueries.getDeputiesWithGovernmentPositions(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== INTERVENTION TOOLS ==============

/**
 * Tool: Search interventions
 */
const searchInterventiTool: MCPTool = {
  name: 'search_interventi',
  description:
    'Cerca interventi in aula su un argomento specifico. Restituisce i deputati che sono intervenuti e le relative sedute.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      argomento: {
        type: 'string',
        description: 'Argomento o parola chiave da cercare negli interventi',
      },
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo di risultati (default: 20)',
      },
    },
    required: ['argomento'],
  },
  handler: async (args: any) => {
    const params = {
      topic: args.argomento,
      legislature: args.legislatura,
      limit: args.limit,
    };
    const query = CameraOrganiQueries.searchInterventions(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

/**
 * Tool: Get deputy interventions by topic
 */
const getInterventiPerArgomentoTool: MCPTool = {
  name: 'get_interventi_per_argomento',
  description:
    'Cerca interventi in aula per argomento, con possibilità di filtrare per deputato.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      argomento: {
        type: 'string',
        description: 'Argomento o parola chiave (es: \'immigrazione\', \'sanità\')',
      },
      legislatura: {
        type: 'number',
        description: 'Legislatura (default: 19)',
      },
      cognome: {
        type: 'string',
        description: 'Cognome deputato (opzionale, per filtrare)',
      },
      nome: {
        type: 'string',
        description: 'Nome deputato (opzionale, per filtrare)',
      },
      limit: {
        type: 'number',
        description: 'Numero massimo di risultati (default: 50)',
      },
    },
    required: ['argomento'],
  },
  handler: async (args: any) => {
    const params = {
      topic: args.argomento,
      legislature: args.legislatura,
      deputySurname: args.cognome,
      deputyFirstName: args.nome,
      limit: args.limit,
    };
    const query = CameraOrganiQueries.getDeputyInterventionsByTopic(params);
    const result = await cameraClient.select(query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== ADVANCED TOOLS ==============

/**
 * Tool: Execute custom SPARQL
 */
const executeSparqlTool: MCPTool = {
  name: 'execute_sparql',
  description:
    'Esegue una query SPARQL personalizzata sull\'endpoint della Camera dei Deputati. Per utenti avanzati.',
  institution: 'camera',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Query SPARQL da eseguire',
      },
    },
    required: ['query'],
  },
  handler: async (args: any) => {
    const result = await cameraClient.select(args.query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  },
};

// ============== EXPORT ALL TOOLS ==============

/**
 * All Camera MCP tools (19 total)
 */
export const cameraTools: MCPTool[] = [
  // Deputies (2)
  searchDeputatiTool,
  getDeputatoInfoTool,
  // Acts (3)
  searchAttiTool,
  getAttoInfoTool,
  getAttiConFasiTool,
  getAttiDeputatoTool,
  // Voting (3)
  getVotazioniTool,
  getEspressioniVotoTool,
  getStatisticheVotoDeputatoTool,
  // Groups & Organs (4)
  getGruppiParlamentariTool,
  getCommissioniTool,
  getIncarichiGruppiParlamentariTool,
  getIncarichiOrganiParlamentariTool,
  // Government (3)
  getGoverniTool,
  getGovernoMembriTool,
  getIncarichiGovernoDeputatiTool,
  // Interventions (2)
  searchInterventiTool,
  getInterventiPerArgomentoTool,
  // Advanced (1)
  executeSparqlTool,
];

/**
 * Tool count
 */
export const CAMERA_TOOL_COUNT = {
  deputies: 2,
  acts: 4,
  voting: 3,
  organs_groups: 4,
  government: 3,
  interventions: 2,
  advanced: 1,
  total: cameraTools.length,
};
