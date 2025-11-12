/**
 * Tipi parlamentari generici (normalizzati cross-istituzione)
 */

import type { Institution } from './common.js';

/**
 * Membro parlamento (deputato o senatore) normalizzato
 */
export interface ParliamentMember {
  uri: string;
  institution: Institution;
  firstName: string;
  lastName: string;
  photo?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: {
    city?: string;
    province?: string;
    country?: string;
  };
  mandates: Mandate[];
  currentMandate?: Mandate;
}

/**
 * Mandato normalizzato
 */
export interface Mandate {
  uri?: string;
  legislature: number | string;
  start: string;
  end?: string;
  type?: string;
  active: boolean;
  election?: string;
}

/**
 * Atto legislativo normalizzato
 */
export interface LegislativeAct {
  uri: string;
  institution: Institution;
  id: string;
  title: string;
  shortTitle?: string;
  legislature: number | string;
  presentationDate: string;
  status: string;
  statusDate?: string;
  nature?: string;
  sponsors?: Sponsor[];
  currentPhase?: string;
}

/**
 * Firmatario/Sponsor atto
 */
export interface Sponsor {
  uri: string;
  firstName: string;
  lastName: string;
  role: 'first' | 'co-signer';
  signatureDate?: string;
}

/**
 * Votazione normalizzata
 */
export interface Voting {
  uri: string;
  institution: Institution;
  number: string;
  date: string;
  legislature: number | string;
  subject: string;
  outcome: string;
  present?: number;
  voting?: number;
  favor: number;
  against: number;
  abstentions: number;
  majority?: number;
  quorum?: number;
}

/**
 * Voto individuale
 */
export interface IndividualVote {
  member: {
    uri: string;
    firstName: string;
    lastName: string;
  };
  vote: 'favor' | 'against' | 'abstention' | 'absent';
  voting: {
    uri: string;
    number: string;
    date: string;
    subject: string;
  };
}

/**
 * Gruppo parlamentare normalizzato
 */
export interface ParliamentaryGroup {
  uri: string;
  name: string;
  institution: Institution;
  members?: GroupMember[];
  active: boolean;
}

/**
 * Membro gruppo parlamentare
 */
export interface GroupMember {
  uri: string;
  firstName: string;
  lastName: string;
  position?: string;
  joinDate: string;
  leaveDate?: string;
  active: boolean;
}

/**
 * Commissione normalizzata
 */
export interface Commission {
  uri: string;
  name: string;
  institution: Institution;
  category?: string;
  ordinal?: string;
  members?: CommissionMember[];
  active: boolean;
}

/**
 * Membro commissione
 */
export interface CommissionMember {
  uri: string;
  firstName: string;
  lastName: string;
  position?: string;
  joinDate: string;
  leaveDate?: string;
  active: boolean;
}

/**
 * Statistiche voto membro
 */
export interface VotingStatistics {
  member: {
    uri: string;
    firstName: string;
    lastName: string;
    institution: Institution;
  };
  period: {
    from: string;
    to: string;
    legislature?: number;
  };
  stats: {
    totalVotings: number;
    favor: number;
    against: number;
    abstentions: number;
    absent: number;
    participationRate: number;
  };
}

/**
 * Governo (Camera only, ma tipo generico per estensibilità)
 */
export interface Government {
  uri: string;
  number: number;
  name: string;
  primeMinister: string;
  startDate: string;
  endDate?: string;
  legislature: number | string;
  active: boolean;
}

/**
 * Incarico governo
 */
export interface GovernmentPosition {
  member: {
    uri: string;
    firstName: string;
    lastName: string;
  };
  position: string;
  government: {
    uri: string;
    name: string;
    number: number;
  };
  startDate: string;
  endDate?: string;
  active: boolean;
}

/**
 * Intervento parlamentare
 */
export interface ParliamentaryIntervention {
  uri: string;
  member: {
    uri: string;
    firstName: string;
    lastName: string;
  };
  session: {
    number?: string;
    date: string;
  };
  topic?: string;
  text?: string;
  institution: Institution;
}

/**
 * Parametri ricerca membri
 */
export interface MemberSearchParams {
  lastName?: string;
  firstName?: string;
  legislature?: number | string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Parametri ricerca atti
 */
export interface ActSearchParams {
  legislature?: number | string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sponsorLastName?: string;
  sponsorFirstName?: string;
  firstSignerOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Parametri ricerca votazioni
 */
export interface VotingSearchParams {
  legislature?: number | string;
  dateFrom?: string;
  dateTo?: string;
  outcome?: string;
  memberUri?: string;
  limit?: number;
  offset?: number;
}
