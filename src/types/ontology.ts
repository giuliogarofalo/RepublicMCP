/**
 * TypeScript types for OCD (Ontologia Camera dei Deputati) entities
 */

// Base entity with common properties
export interface OCDEntity {
  uri: string;
  type: string;
}

// Person
export interface Person extends OCDEntity {
  firstName?: string;
  surname?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
}

// Deputy
export interface Deputy extends OCDEntity {
  person: Person;
  legislature: string;
  parliamentaryGroup?: ParliamentaryGroup;
  mandateStartDate?: string;
  mandateEndDate?: string;
  validationDate?: string;
}

// Parliamentary Group
export interface ParliamentaryGroup extends OCDEntity {
  officialName: string;
  abbreviation?: string;
  startDate?: string;
  endDate?: string;
  legislature: string;
}

// Parliamentary Act
export interface ParliamentaryAct extends OCDEntity {
  title: string;
  actType: string;
  legislature: string;
  number?: string;
  presentationDate?: string;
  status?: string;
  concluded?: boolean;
  constitutional?: boolean;
  proponents?: Deputy[];
}

// Voting
export interface Voting extends OCDEntity {
  description?: string;
  date: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  relatedAct?: string;
  outcome?: string;
}

// Parliamentary Body/Organ
export interface ParliamentaryOrgan extends OCDEntity {
  name: string;
  organType?: string;
  legislature: string;
  startDate?: string;
  endDate?: string;
}

// Government
export interface Government extends OCDEntity {
  name: string;
  startDate: string;
  endDate?: string;
  primeMinister?: Person;
  legislature?: string;
}

// Government Member
export interface GovernmentMember extends OCDEntity {
  person: Person;
  government: string;
  position: string;
  startDate?: string;
  endDate?: string;
}

// Session
export interface Session extends OCDEntity {
  sessionNumber: string;
  date: string;
  legislature: string;
  organ?: string;
}

// SPARQL Query Result (generic)
export interface SparqlResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: SparqlBinding[];
  };
}

export interface SparqlBinding {
  [key: string]: {
    type: "uri" | "literal" | "bnode";
    value: string;
    "xml:lang"?: string;
    datatype?: string;
  };
}

// Query parameters
export interface DeputySearchParams {
  firstName?: string;
  surname?: string;
  legislature?: string;
  parliamentaryGroup?: string;
}

export interface ActSearchParams {
  title?: string;
  actType?: string;
  legislature?: string;
  status?: string;
  limit?: number;
}

export interface VotingSearchParams {
  actUri?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface OrganSearchParams {
  legislature?: string;
  organType?: string;
}

export interface GovernmentSearchParams {
  includeMembers?: boolean;
  legislature?: string;
}
