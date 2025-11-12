/**
 * Configurazione centralizzata per gli endpoint SPARQL delle istituzioni parlamentari italiane
 */

export interface InstitutionConfig {
  name: string;
  shortName: string;
  endpoint: string;
  namespace: string;
  baseUri: string;
  ontology: string;
  license: string;
  docs?: string;

  // Differenze ontologiche
  memberClass: string;
  lastNameProperty: string;
  mandateRelation: string;
  mandateClass: string;
  mandateStartProperty: string;
  mandateEndProperty: string;
  legislatureProperty: string;
  legislatureFormat: 'uri' | 'integer';

  // Atti legislativi
  actClass: string;

  // Gruppi parlamentari
  groupClass: string;
  groupMembershipProperty: string;
  groupMembershipClass: string;
  groupRelationProperty: string;

  // Votazioni
  votingClass: string;
}

export const INSTITUTIONS: Record<'camera' | 'senato', InstitutionConfig> = {
  camera: {
    name: 'Camera dei Deputati',
    shortName: 'Camera',
    endpoint: 'https://dati.camera.it/sparql',
    namespace: 'ocd',
    baseUri: 'http://dati.camera.it/ocd/',
    ontology: 'OCD',
    license: 'CC BY 4.0',
    docs: 'https://dati.camera.it/ocd-ontologia-della-camera-dei-deputati',

    // Membri
    memberClass: 'ocd:deputato',
    lastNameProperty: 'foaf:surname',
    mandateRelation: 'ocd:rif_mandatoCamera',
    mandateClass: 'ocd:mandatoCamera',
    mandateStartProperty: 'ocd:startDate',
    mandateEndProperty: 'ocd:endDate',
    legislatureProperty: 'ocd:rif_leg',
    legislatureFormat: 'uri',

    // Atti
    actClass: 'ocd:atto',

    // Gruppi
    groupClass: 'ocd:gruppoParlamentare',
    groupMembershipProperty: 'ocd:aderisce',
    groupMembershipClass: 'ocd:adesioneGruppo',
    groupRelationProperty: 'ocd:rif_gruppoParlamentare',

    // Votazioni
    votingClass: 'ocd:votazione',
  },

  senato: {
    name: 'Senato della Repubblica',
    shortName: 'Senato',
    endpoint: 'https://dati.senato.it/sparql',
    namespace: 'osr',
    baseUri: 'http://dati.senato.it/osr/',
    ontology: 'OSR',
    license: 'CC BY 3.0',
    docs: 'https://dati.senato.it/DatiSenato/browse/21',

    // Membri
    memberClass: 'osr:Senatore',
    lastNameProperty: 'foaf:lastName',
    mandateRelation: 'osr:mandato',
    mandateClass: 'ocd:mandatoSenato', // ⚠️ Usa namespace Camera!
    mandateStartProperty: 'osr:inizio',
    mandateEndProperty: 'osr:fine',
    legislatureProperty: 'osr:legislatura',
    legislatureFormat: 'integer',

    // Atti
    actClass: 'osr:Ddl',

    // Gruppi (riusa Camera ontology)
    groupClass: 'ocd:gruppoParlamentare', // ⚠️ Usa namespace Camera!
    groupMembershipProperty: 'ocd:aderisce', // ⚠️ Usa namespace Camera!
    groupMembershipClass: 'ocd:adesioneGruppo', // ⚠️ Usa namespace Camera!
    groupRelationProperty: 'osr:gruppo', // Ma la relazione è OSR

    // Votazioni
    votingClass: 'osr:Votazione',
  },
};

/**
 * Legislature disponibili
 */
export const LEGISLATURES = {
  camera: {
    current: 19,
    available: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
    startDates: {
      19: '2022-10-13',
      18: '2018-03-23',
      17: '2013-03-15',
      16: '2008-04-29',
    },
  },
  senato: {
    current: 19,
    available: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
    startDates: {
      19: '2022-10-13',
      18: '2018-03-23',
      17: '2013-03-15',
      16: '2008-04-29',
    },
  },
};

/**
 * Genera URI legislatura per Camera
 */
export function getCameraLegislatureUri(legislature: number): string {
  return `<http://dati.camera.it/ocd/legislatura.rdf/repubblica_${legislature}>`;
}

/**
 * Ottiene numero legislatura corrente per istituzione
 */
export function getCurrentLegislature(institution: 'camera' | 'senato'): number {
  return LEGISLATURES[institution].current;
}

/**
 * Verifica se una legislatura è disponibile
 */
export function isLegislatureAvailable(
  institution: 'camera' | 'senato',
  legislature: number
): boolean {
  return LEGISLATURES[institution].available.includes(legislature);
}

/**
 * Ottiene configurazione per istituzione
 */
export function getInstitutionConfig(institution: 'camera' | 'senato'): InstitutionConfig {
  return INSTITUTIONS[institution];
}

/**
 * Type guard per istituzione valida
 */
export function isValidInstitution(value: string): value is 'camera' | 'senato' {
  return value === 'camera' || value === 'senato';
}
