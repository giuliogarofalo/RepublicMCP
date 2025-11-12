/**
 * Camera dei Deputati - Query Builders Export Index
 */

export { CameraDeputatiQueries } from './deputati.js';
export { CameraAttiQueries } from './atti.js';
export { CameraVotazioniQueries } from './votazioni.js';
export { CameraOrganiQueries } from './organi.js';

// Re-export types
export type {
  DeputatoSearchParams,
  AttoSearchParams,
  VotazioneSearchParams,
  OrganoSearchParams,
  GovernoSearchParams,
  InterventoSearchParams,
  VoteStatsParams,
} from '../ontology/types.js';
