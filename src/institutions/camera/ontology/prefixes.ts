/**
 * Camera dei Deputati - SPARQL Prefixes
 * Organized by query domain
 */

/**
 * Core OCD prefixes (used in all queries)
 */
export const CAMERA_CORE_PREFIXES = [
  'PREFIX ocd: <http://dati.camera.it/ocd/>',
  'PREFIX dc: <http://purl.org/dc/elements/1.1/>',
  'PREFIX dcterms: <http://purl.org/dc/terms/>',
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
];

/**
 * Person/Biography prefixes
 */
export const PERSON_PREFIXES = [
  ...CAMERA_CORE_PREFIXES,
  'PREFIX bio: <http://purl.org/vocab/bio/0.1/>',
];

/**
 * Voting prefixes
 */
export const VOTING_PREFIXES = [
  ...CAMERA_CORE_PREFIXES,
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
];

/**
 * All Camera prefixes combined
 */
export const CAMERA_PREFIXES = [
  'PREFIX ocd: <http://dati.camera.it/ocd/>',
  'PREFIX dc: <http://purl.org/dc/elements/1.1/>',
  'PREFIX dcterms: <http://purl.org/dc/terms/>',
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
  'PREFIX bio: <http://purl.org/vocab/bio/0.1/>',
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
];

/**
 * Legislature URI builder
 */
export function buildLegislatureUri(legislature: number | string): string {
  const leg = typeof legislature === 'number'
    ? `repubblica_${legislature}`
    : legislature;
  return `http://dati.camera.it/ocd/legislatura.rdf/${leg}`;
}

/**
 * Extract legislature number from URI
 */
export function extractLegislatureNumber(uri: string): number | null {
  const match = uri.match(/repubblica_(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
