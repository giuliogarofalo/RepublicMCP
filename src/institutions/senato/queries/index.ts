/**
 * Senato Query Builders - Export Index
 */

export { SenatoSenatoriQueries } from './senatori.js';
export { SenatoDdlQueries } from './ddl.js';
export { SenatoVotazioniQueries } from './votazioni.js';
export { SenatoCommissioniQueries } from './commissioni.js';
export { SenatoGruppiQueries } from './gruppi.js';

// Re-export types
export type {
  SenatoreSearchParams,
  DdlSearchParams,
  VotazioneSearchParams,
  CommissioneSearchParams,
  GruppoSearchParams,
} from '../ontology/types.js';
