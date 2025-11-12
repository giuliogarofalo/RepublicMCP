/**
 * Costanti globali per RepublicMCP
 */

/**
 * Legislatura corrente
 */
export const CURRENT_LEGISLATURE = 19;
export const CURRENT_LEGISLATURE_START = '2022-10-13';

/**
 * Prefissi SPARQL comuni
 */
export const COMMON_PREFIXES = {
  foaf: 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
  rdfs: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
  dc: 'PREFIX dc: <http://purl.org/dc/elements/1.1/>',
  xsd: 'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
  bio: 'PREFIX bio: <http://purl.org/vocab/bio/0.1/>',
};

/**
 * Prefissi Camera
 */
export const CAMERA_PREFIXES = {
  ...COMMON_PREFIXES,
  ocd: 'PREFIX ocd: <http://dati.camera.it/ocd/>',
};

/**
 * Prefissi Senato
 */
export const SENATO_PREFIXES = {
  ...COMMON_PREFIXES,
  osr: 'PREFIX osr: <http://dati.senato.it/osr/>',
  ocd: 'PREFIX ocd: <http://dati.camera.it/ocd/>', // Per gruppi parlamentari
};

/**
 * Limiti query
 */
export const QUERY_LIMITS = {
  default: 100,
  max: 1000,
  members: 500,
  acts: 100,
  votings: 50,
};

/**
 * Timeout query SPARQL (ms)
 */
export const SPARQL_TIMEOUT = 30000; // 30 secondi

/**
 * Formati data
 */
export const DATE_FORMATS = {
  iso: 'YYYY-MM-DD',
  italian: 'DD/MM/YYYY',
};

/**
 * Tipi mandato Senato
 */
export const SENATE_MANDATE_TYPES = {
  elected: 'ordinario',
  lifePresidential: 'a vita, di nomina del Presidente della Repubblica',
  lifeFormer: 'di diritto e a vita, Presidente emerito della Repubblica',
} as const;

/**
 * Stati atto comuni
 */
export const ACT_STATES = {
  presented: 'Presentato',
  assigned: 'Assegnato',
  approved: 'Approvato',
  rejected: 'Respinto',
  withdrawn: 'Ritirato',
  inProgress: 'In corso',
} as const;

/**
 * Tipi voto
 */
export const VOTE_TYPES = {
  favor: 'Favorevole',
  against: 'Contrario',
  abstention: 'Astensione',
  voted: 'Ha votato',
  notVoted: 'Non ha votato',
} as const;

/**
 * Versione MCP
 */
export const MCP_VERSION = '2.0.0';

/**
 * Nome progetto
 */
export const PROJECT_NAME = 'RepublicMCP';

/**
 * Descrizione progetto
 */
export const PROJECT_DESCRIPTION =
  'MCP server per interrogare i dati aperti del Parlamento Italiano (Camera e Senato)';
