/**
 * TypeScript types for Senato della Repubblica Ontology (OSR)
 * Based on official ontology: https://dati.senato.it/DatiSenato/browse/21
 */

/**
 * Senatore (Senator)
 */
export interface Senatore {
  uri: string;
  firstName: string;
  lastName: string; // ⚠️ NOT surname!
  photo?: string;
  gender?: string;

  // Birth information
  birthDate?: string;
  birthCity?: string;
  birthProvince?: string;
  birthCountry?: string;

  // Residence
  residenceCity?: string;
  residenceProvince?: string;
  residenceCountry?: string;

  // Parliamentary activity
  mandates?: Mandato[];
  commissions?: AfferenzaCommissione[];
  groups?: AdesioneGruppo[];
  interventions?: string[]; // URIs
}

/**
 * Mandato (Mandate)
 */
export interface Mandato {
  uri?: string;
  legislature: number; // ⚠️ Integer, NOT URI!
  start: string; // ISO date
  end?: string; // ISO date, optional (null = still active)
  type: MandateType;
  nominationDate?: string; // For life senators
  endReason?: string;
  electionRegion?: string;
}

export type MandateType =
  | 'ordinario' // Elected
  | 'a vita, di nomina del Presidente della Repubblica' // Life senator by appointment
  | 'di diritto e a vita, Presidente emerito della Repubblica'; // Life senator by right (former president)

/**
 * Ddl (Disegno di Legge - Bill)
 */
export interface Ddl {
  uri: string;
  idDdl: number;
  idFase: string;
  ramo: 'Senato' | 'Camera'; // Chamber branch
  legislature: string; // Date-based
  numeroFase: string;
  numeroFaseCompatto?: string;
  titolo: string;
  titoloBreve?: string;
  natura?: string;
  presentatoTrasmesso: string;
  dataPresentazione: string;
  statoDdl: string;
  dataStatoDdl: string;
  testoPresentato?: string; // URL
  testoApprovato?: string; // URL

  // Relations
  iniziative?: Iniziativa[];
  iter?: IterDdl;
  assegnazioni?: Assegnazione[];
  relatori?: Relatore[];
}

/**
 * Iniziativa (Initiative - bill sponsor/signatory)
 */
export interface Iniziativa {
  uri?: string;
  presentatore: string; // Senator URI
  primoFirmatario: boolean;
  dataAggiuntaFirma?: string;
  dataRitiroFirma?: string;
}

/**
 * IterDdl (Bill Lifecycle)
 */
export interface IterDdl {
  uri?: string;
  idDdl: number;
  fasi: FaseIter[];
}

/**
 * FaseIter (Iteration Phase)
 */
export interface FaseIter {
  uri?: string;
  progrIter: number; // Progressive number
  ddlRef: {
    ramo: string;
    numeroFase: string;
    statoDdl: string;
    dataStatoDdl: string;
  };
}

/**
 * Votazione (Voting)
 */
export interface Votazione {
  uri: string;
  numero: string;
  legislature: string;

  // Session info
  seduta: {
    numeroSeduta: number;
    dataSeduta: string;
    legislatura: number;
  };

  // Vote subject
  oggetto: string; // rdfs:label

  // Outcome
  esito: string;

  // Aggregate counts
  presenti: number;
  votanti: number;
  favorevoli: number;
  contrari: number;
  astenuti: number;
  maggioranza: number;
  numeroLegale: number;

  // Vote type
  tipoVotazione?: string;

  // Individual votes (URIs to senators)
  votiFavorevoli?: string[];
  votiContrari?: string[];
  votiAstenuti?: string[];
  inCongedoMissione?: string[];

  // President
  presidente?: string;
}

/**
 * Commissione (Commission)
 */
export interface Commissione {
  uri: string;
  categoriaCommissione?: string;
  ordinale?: string;
  titolo?: string;
  sottotitolo?: string;

  // Denomination with validity period
  denominazione?: {
    titolo: string;
    fine?: string; // End date of this denomination
  };
}

/**
 * AfferenzaCommissione (Commission Membership)
 */
export interface AfferenzaCommissione {
  uri?: string;
  commissione: string; // Commission URI
  inizio: string;
  fine?: string;
  carica?: string; // Position in commission
}

/**
 * Gruppo Parlamentare (Parliamentary Group)
 * ⚠️ Uses Camera ontology: ocd:gruppoParlamentare
 */
export interface GruppoParlamentare {
  uri: string; // ocd:gruppoParlamentare URI
  denominazione: {
    titolo: string;
    fine?: string;
  };
}

/**
 * AdesioneGruppo (Group Membership)
 * ⚠️ Uses Camera ontology class: ocd:adesioneGruppo
 * But uses OSR properties: osr:gruppo, osr:inizio, osr:fine
 */
export interface AdesioneGruppo {
  uri?: string;
  gruppo: string; // Group URI (ocd:gruppoParlamentare)
  inizio: string;
  fine?: string;
  carica?: string; // Position in group
}

/**
 * Intervento (Intervention/Speech)
 */
export interface Intervento {
  uri: string;
  senatore: string; // Senator URI
  // Additional properties not fully documented
}

/**
 * Documento (Document)
 */
export interface Documento {
  uri: string;
  numeroDoc?: string;
  tipo?: string;
}

/**
 * Emendamento (Amendment)
 */
export interface Emendamento {
  uri: string;
  relativoA?: string; // DDL URI
  // Additional properties not fully documented
}

/**
 * Assegnazione (Assignment)
 */
export interface Assegnazione {
  uri: string;
  commissione?: string;
  dataAssegnazione?: string;
}

/**
 * Relatore (Rapporteur)
 */
export interface Relatore {
  uri: string;
  senatore: string;
  commissione?: string;
}

/**
 * SindacatoIspettivo (Oversight)
 */
export interface SindacatoIspettivo {
  uri: string;
  tipo?: string; // Type of oversight act
}

/**
 * Query Parameters
 */

export interface SenatoreSearchParams {
  lastName?: string;
  firstName?: string;
  legislature?: number;
  active?: boolean; // Filter by active mandate
  mandateType?: MandateType;
  region?: string;
  limit?: number;
  offset?: number;
}

export interface DdlSearchParams {
  legislature?: string;
  stato?: string;
  ramo?: 'Senato' | 'Camera';
  dateFrom?: string;
  dateTo?: string;
  sponsorLastName?: string;
  sponsorFirstName?: string;
  firstSignerOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface VotazioneSearchParams {
  legislature?: number;
  dateFrom?: string;
  dateTo?: string;
  esito?: string;
  senatoreUri?: string; // Filter votes by specific senator
  limit?: number;
  offset?: number;
}

export interface CommissioneSearchParams {
  ordinale?: string;
  active?: boolean;
  senatoreUri?: string; // Filter commissions by member
  limit?: number;
}

export interface GruppoSearchParams {
  active?: boolean;
  senatoreUri?: string;
  limit?: number;
}
