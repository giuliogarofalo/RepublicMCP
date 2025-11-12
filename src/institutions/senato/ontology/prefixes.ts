/**
 * SPARQL Prefixes for Senato della Repubblica
 */

/**
 * All Senato prefixes
 */
export const SENATO_PREFIXES = [
  'PREFIX osr: <http://dati.senato.it/osr/>',
  'PREFIX ocd: <http://dati.camera.it/ocd/>', // For parliamentary groups
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
  'PREFIX dc: <http://purl.org/dc/elements/1.1/>',
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
  'PREFIX bio: <http://purl.org/vocab/bio/0.1/>',
];

/**
 * Get prefixes as string
 */
export function getSenatoPrefixes(): string {
  return SENATO_PREFIXES.join('\n');
}

/**
 * Minimal prefixes for basic queries
 */
export const MINIMAL_PREFIXES = [
  'PREFIX osr: <http://dati.senato.it/osr/>',
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
];

/**
 * Prefixes for group queries (includes Camera ontology)
 */
export const GROUP_PREFIXES = [
  'PREFIX osr: <http://dati.senato.it/osr/>',
  'PREFIX ocd: <http://dati.camera.it/ocd/>',
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
];

/**
 * Prefixes for voting queries
 */
export const VOTING_PREFIXES = [
  'PREFIX osr: <http://dati.senato.it/osr/>',
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
];

/**
 * Prefixes for DDL queries
 */
export const DDL_PREFIXES = [
  'PREFIX osr: <http://dati.senato.it/osr/>',
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
];
