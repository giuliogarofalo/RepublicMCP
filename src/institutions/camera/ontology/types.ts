/**
 * Camera dei Deputati - TypeScript Type Definitions
 * Based on OCD (Ontologia Camera dei Deputati)
 */

// ============== BASE TYPES ==============

/**
 * Base Camera entity
 */
export interface CameraEntity {
  uri: string;
}

// ============== PERSON & DEPUTY ==============

/**
 * Person (foaf:Person)
 */
export interface Persona extends CameraEntity {
  firstName: string;
  surname: string; // ⚠️ Camera uses 'surname' not 'lastName'
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  photo?: string;
}

/**
 * Deputy (ocd:deputato)
 */
export interface Deputato extends CameraEntity {
  person: Persona;
  legislature: number; // Extracted from URI
  legislatureUri: string; // Full URI
  firstName: string;
  surname: string;
  gender?: string;
  mandates?: Mandato[];
  currentGroup?: GruppoParlamentare;
  commissions?: Commissione[];
  photo?: string;
}

/**
 * Mandate (ocd:mandatoCamera)
 */
export interface Mandato {
  uri: string;
  election?: Elezione;
  start?: string;
  end?: string;
  validationDate?: string;
  constituency?: string; // Collegio elettorale
}

/**
 * Election (ocd:elezione)
 */
export interface Elezione {
  uri: string;
  constituency?: string; // Collegio
  list?: string; // Lista elettorale
  date?: string;
}

// ============== PARLIAMENTARY ACTS ==============

/**
 * Parliamentary Act (ocd:atto)
 */
export interface Atto extends CameraEntity {
  identifier: string; // dc:identifier
  title: string;
  actType?: string; // dc:type
  legislature: number;
  legislatureUri: string;
  presentationDate: string;
  initiative?: string; // ocd:iniziativa
  concluded?: boolean;
  constitutional?: boolean;
  status?: string;
  iter?: IterPhase[];
  proponents?: Deputato[];
  firstSigner?: Deputato;
}

/**
 * Iter Phase (ocd:statoIter)
 */
export interface IterPhase {
  uri: string;
  phase: string; // dc:title
  date: string;
  description?: string;
}

// ============== VOTING ==============

/**
 * Voting (ocd:votazione)
 */
export interface Votazione extends CameraEntity {
  identifier: string;
  title?: string;
  description?: string;
  date: string;
  sessionNumber?: string;
  votesFor?: number; // ocd:favorevoli
  votesAgainst?: number; // ocd:contrari
  abstentions?: number; // ocd:astenuti
  voters?: number; // ocd:votanti
  approved?: boolean; // ocd:approvato
  finalVote?: boolean; // ocd:votazioneFinale
  relatedAct?: string; // ocd:rif_attoCamera
  outcome?: string;
}

/**
 * Vote Expression (ocd:voto)
 */
export interface Voto extends CameraEntity {
  voting: string; // ocd:rif_votazione
  deputy: string; // ocd:rif_deputato
  expression: VoteExpression; // dc:type
  absenceReason?: string; // dc:description
}

/**
 * Vote expression types
 */
export type VoteExpression =
  | 'Favorevole'
  | 'Contrario'
  | 'Astensione'
  | 'Astenuto per disguido tecnico'
  | 'Astenuto per non aver potuto votare'
  | 'Ha votato'
  | 'Non ha votato'
  | 'In missione'
  | 'Presidente di turno';

// ============== PARLIAMENTARY GROUPS ==============

/**
 * Parliamentary Group (ocd:gruppoParlamentare)
 */
export interface GruppoParlamentare extends CameraEntity {
  officialName: string; // dc:title
  abbreviation?: string; // dcterms:alternative
  legislature: number;
  legislatureUri: string;
  start?: string; // ocd:startDate
  end?: string; // ocd:endDate
  members?: Deputato[];
  leadership?: Incarico[];
}

/**
 * Group Membership (ocd:adesioneGruppo)
 */
export interface AdesioneGruppo extends CameraEntity {
  deputy: string; // Deputy URI
  group: string; // Group URI
  start: string; // ocd:startDate
  end?: string; // ocd:endDate
}

// ============== COMMISSIONS & ORGANS ==============

/**
 * Parliamentary Organ/Commission (ocd:organo)
 */
export interface Organo extends CameraEntity {
  name: string; // dc:title
  organType?: string; // dc:type
  legislature: number;
  legislatureUri: string;
  start?: string;
  end?: string;
  members?: Membro[];
}

export type Commissione = Organo;

/**
 * Organ Membership (ocd:membro)
 */
export interface Membro extends CameraEntity {
  organ: string; // ocd:rif_organo
  deputy: string; // Deputy URI
  role?: string; // ocd:ruolo
  start?: string; // ocd:startDate
  end?: string; // ocd:endDate
}

// ============== POSITIONS & ROLES ==============

/**
 * Parliamentary Position (ocd:incarico)
 */
export interface Incarico extends CameraEntity {
  role: string; // ocd:ruolo or ocd:carica
  organ?: string; // ocd:rif_organo or ocd:rif_gruppoParlamentare
  start?: string; // ocd:startDate
  end?: string; // ocd:endDate
  deputy: string; // Deputy URI
}

/**
 * Parliamentary Office (ocd:ufficioParlamentare)
 */
export interface UfficioParlamentare extends CameraEntity {
  organ: string; // ocd:rif_organo
  position: string; // ocd:carica
  start?: string;
  end?: string;
}

// ============== GOVERNMENT ==============

/**
 * Government (ocd:governo)
 */
export interface Governo extends CameraEntity {
  name: string; // dc:title
  start: string; // ocd:startDate
  end?: string; // ocd:endDate
  primeMinister?: Persona;
  legislature?: number;
  members?: MembroGoverno[];
}

/**
 * Government Member (ocd:membroGoverno)
 */
export interface MembroGoverno extends CameraEntity {
  person: string; // ocd:rif_persona
  government: string; // ocd:rif_governo
  position: string; // ocd:membroGoverno
  governmentOrgan?: string; // ocd:rif_organoGoverno (Ministry)
  delegation?: string; // dc:description
  start?: string; // ocd:startDate
  end?: string; // ocd:endDate
  legislature?: number;
}

// ============== DEBATES & INTERVENTIONS ==============

/**
 * Debate (ocd:dibattito)
 */
export interface Dibattito extends CameraEntity {
  legislature: number;
  legislatureUri: string;
  discussion?: string; // ocd:rif_discussione
}

/**
 * Discussion (ocd:discussione)
 */
export interface Discussione extends CameraEntity {
  session: string; // ocd:rif_seduta
  topic: string; // rdfs:label
  interventions?: Intervento[];
}

/**
 * Intervention (ocd:intervento)
 */
export interface Intervento extends CameraEntity {
  deputy: string; // ocd:rif_deputato
  discussion: string; // Discussion URI
  text?: string; // dc:relation
  date?: string;
}

/**
 * Session (ocd:seduta)
 */
export interface Seduta extends CameraEntity {
  sessionNumber: string;
  date: string;
  title?: string;
  assembly?: string; // ocd:rif_assemblea
  legislature: number;
}

// ============== SEARCH PARAMETERS ==============

/**
 * Deputy search parameters
 */
export interface DeputatoSearchParams {
  firstName?: string;
  surname?: string;
  legislature?: number;
  legislatureUri?: string;
  parliamentaryGroup?: string;
  active?: boolean;
  limit?: number;
}

/**
 * Act search parameters
 */
export interface AttoSearchParams {
  title?: string;
  actType?: string;
  legislature?: number;
  legislatureUri?: string;
  initiative?: string;
  status?: string;
  concluded?: boolean;
  constitutional?: boolean;
  dateFrom?: string;
  dateTo?: string;
  proponentSurname?: string;
  proponentFirstName?: string;
  limit?: number;
}

/**
 * Voting search parameters
 */
export interface VotazioneSearchParams {
  actUri?: string;
  dateFrom?: string;
  dateTo?: string;
  approved?: boolean;
  finalVote?: boolean;
  limit?: number;
}

/**
 * Organ search parameters
 */
export interface OrganoSearchParams {
  legislature?: number;
  legislatureUri?: string;
  organType?: string;
  active?: boolean;
  limit?: number;
}

/**
 * Government search parameters
 */
export interface GovernoSearchParams {
  includeMembers?: boolean;
  legislature?: number;
  currentOnly?: boolean;
  limit?: number;
}

/**
 * Intervention search parameters
 */
export interface InterventoSearchParams {
  topic: string;
  legislature?: number;
  legislatureUri?: string;
  deputySurname?: string;
  deputyFirstName?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

/**
 * Vote statistics parameters
 */
export interface VoteStatsParams {
  surname: string;
  firstName?: string;
  legislature?: number;
  legislatureUri?: string;
  voteType?: VoteExpression;
  dateFrom?: string;
  dateTo?: string;
}
