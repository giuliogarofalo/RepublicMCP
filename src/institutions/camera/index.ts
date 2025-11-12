/**
 * Camera dei Deputati - Public Module API
 * Complete export for Camera implementation
 */

// Client
export { CameraClient, cameraClient } from './client.js';

// Query Builders
export {
  CameraDeputatiQueries,
  CameraAttiQueries,
  CameraVotazioniQueries,
  CameraOrganiQueries,
} from './queries/index.js';

// Tools
export { cameraTools, CAMERA_TOOL_COUNT } from './tools/index.js';

// Types
export type {
  Deputato,
  Atto,
  Votazione,
  GruppoParlamentare,
  Organo,
  Governo,
  DeputatoSearchParams,
  AttoSearchParams,
  VotazioneSearchParams,
  OrganoSearchParams,
  GovernoSearchParams,
  InterventoSearchParams,
  VoteStatsParams,
} from './ontology/types.js';

// Prefixes
export { CAMERA_PREFIXES, buildLegislatureUri } from './ontology/prefixes.js';
