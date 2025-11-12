/**
 * Senato della Repubblica - Public API
 */

// Client
export { SenatoClient, senatoClient } from './client.js';

// Query Builders
export {
  SenatoSenatoriQueries,
  SenatoDdlQueries,
  SenatoVotazioniQueries,
  SenatoCommissioniQueries,
  SenatoGruppiQueries,
} from './queries/index.js';

// Types
export type {
  Senatore,
  Mandato,
  MandateType,
  Ddl,
  Iniziativa,
  IterDdl,
  FaseIter,
  Votazione,
  Commissione,
  AfferenzaCommissione,
  GruppoParlamentare,
  AdesioneGruppo,
  Intervento,
  Documento,
  Emendamento,
  Assegnazione,
  Relatore,
  SindacatoIspettivo,
  SenatoreSearchParams,
  DdlSearchParams,
  VotazioneSearchParams,
  CommissioneSearchParams,
  GruppoSearchParams,
} from './ontology/types.js';

// Prefixes
export { SENATO_PREFIXES, getSenatoPrefixes } from './ontology/prefixes.js';

// Tools
export { senatoTools, SENATO_TOOL_COUNT } from './tools/index.js';
