// @ts-nocheck - Temporary: disable type checking for Docker build compatibility

/**
 * MCP Tools for OpenPolis "Openparlamento" — dati CURATI (indice di forza, presenze, coesione, conversioni).
 * Fonte: Openpolis (CC-BY-NC). Citare sempre "Fonte: Openpolis".
 */

import { OpenPolisClient } from '../client.js';
import type { MCPTool } from '../../../core/mcp/types.js';

const asText = (data: any) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });

export const cercaParlamentariTool: MCPTool = {
  name: 'openpolis_cerca_parlamentari',
  description:
    'Cerca PARLAMENTARI (deputati/senatori) per nome o ruolo, ordinati per indice di forza, con foto, ruoli e stato in carica. Dati curati Openpolis.',
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: {
      testo: { type: 'string', description: 'Testo di ricerca (nome/cognome), opzionale' },
      ruolo: { type: 'string', description: "Ruolo: 'Deputato' o 'Senatore' (opzionale)" },
      solo_attivi: { type: 'boolean', description: 'Solo parlamentari in carica (default: true)' },
    },
  },
  handler: async (args: any) =>
    asText(await OpenPolisClient.cercaParlamentari(args.testo, args.ruolo, args.solo_attivi !== false)),
};

export const indiceDiForzaTool: MCPTool = {
  name: 'openpolis_indice_di_forza',
  description:
    "Classifica dei parlamentari per INDICE DI FORZA (pp): chi ha più potere/influenza in Parlamento e Governo. Esclusiva Openpolis.",
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: {
      ramo: { type: 'string', description: "Ramo: 'camera' o 'senato' (opzionale)" },
      limite: { type: 'number', description: 'Numero di risultati (default: 10, max: 50)' },
    },
  },
  handler: async (args: any) => asText(await OpenPolisClient.indiceDiForza(args.ramo, args.limite)),
};

export const profiloParlamentareTool: MCPTool = {
  name: 'openpolis_profilo_parlamentare',
  description:
    'Scheda di un PARLAMENTARE: gruppo, ruolo, collegio e statistiche di presenza (presente/assente/in missione/ribelle/voti). Dati Openpolis.',
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: { nome: { type: 'string', description: 'Nome del parlamentare (richiesto)' } },
    required: ['nome'],
  },
  handler: async (args: any) => asText(await OpenPolisClient.profiloParlamentare(args.nome)),
};

export const cercaVotazioniTool: MCPTool = {
  name: 'openpolis_cerca_votazioni',
  description:
    'Cerca VOTAZIONI parlamentari per tema, con esito, voti di FIDUCIA, voti CHIAVE, voto segreto e coesione di maggioranza/minoranza. Dati Openpolis.',
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: {
      testo: { type: 'string', description: 'Tema/testo della votazione (opzionale)' },
      solo_voti_chiave: { type: 'boolean', description: 'Solo voti chiave (default: false)' },
      solo_finali: { type: 'boolean', description: 'Solo votazioni finali (default: false)' },
      solo_fiducia: { type: 'boolean', description: 'Solo voti di fiducia (default: false)' },
      esito: { type: 'string', description: "Esito: es. 'Approvata' / 'Respinta' (opzionale)" },
    },
  },
  handler: async (args: any) =>
    asText(
      await OpenPolisClient.cercaVotazioni(
        args.testo,
        !!args.solo_voti_chiave,
        !!args.solo_finali,
        !!args.solo_fiducia,
        args.esito
      )
    ),
};

export const decretiLeggeTool: MCPTool = {
  name: 'openpolis_decreti_legge',
  description:
    'Cerca DECRETI LEGGE per tema, con lo stato di CONVERSIONE in legge, l\'atto di conversione e il link a Normattiva (normattiva_urn). Dati Openpolis.',
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: {
      testo: { type: 'string', description: 'Tema/testo del decreto (opzionale)' },
      stato: { type: 'string', description: "Filtro stato: es. 'In conversione', 'Diventato legge' (opzionale)" },
    },
  },
  handler: async (args: any) => asText(await OpenPolisClient.decretiLegge(args.testo, args.stato)),
};

export const attivitaLegislativaTool: MCPTool = {
  name: 'openpolis_attivita_legislativa',
  description:
    'Cerca ATTI/DDL (tutti i rami) per tema, con tipo, iniziativa, fase dell\'iter, primi FIRMATARI e RELATORI. Dati curati Openpolis.',
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: {
      testo: { type: 'string', description: 'Tema/testo dell\'atto (opzionale)' },
      tipo: { type: 'string', description: 'Tipo atto (opzionale)' },
      stato: { type: 'string', description: 'Filtro sulla fase dell\'iter (opzionale)' },
      ramo: { type: 'string', description: "Ramo: 'Camera' o 'Senato' (opzionale)" },
    },
  },
  handler: async (args: any) =>
    asText(await OpenPolisClient.attivitaLegislativa(args.testo, args.tipo, args.stato, args.ramo)),
};

export const organiParlamentariTool: MCPTool = {
  name: 'openpolis_organi_parlamentari',
  description:
    'Elenca ORGANI PARLAMENTARI: GRUPPI (con peso per schieramento), PRESIDENZA (presidente e vicepresidenti) o COMMISSIONI. Dati Openpolis.',
  institution: 'openpolis',
  inputSchema: {
    type: 'object',
    properties: {
      ramo: { type: 'string', description: "Ramo: 'camera' o 'senato' (default: camera)" },
      tipo: { type: 'string', description: 'groups | presidency | commission_councils (default: groups)' },
    },
  },
  handler: async (args: any) => asText(await OpenPolisClient.organiParlamentari(args.ramo, args.tipo)),
};

export const openpolisTools: MCPTool[] = [
  cercaParlamentariTool,
  indiceDiForzaTool,
  profiloParlamentareTool,
  cercaVotazioniTool,
  decretiLeggeTool,
  attivitaLegislativaTool,
  organiParlamentariTool,
];
