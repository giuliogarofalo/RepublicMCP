/**
 * Pre-built SPARQL queries for common use cases
 */

import type {
  DeputySearchParams,
  ActSearchParams,
  VotingSearchParams,
  OrganSearchParams,
  GovernmentSearchParams,
} from "../types/ontology.js";

const CURRENT_LEGISLATURE = "repubblica_19";

export class QueryBuilder {
  /**
   * Get all current deputies with biographical info
   */
  static getCurrentDeputies(params: DeputySearchParams = {}): string {
    const { firstName, surname, parliamentaryGroup } = params;
    const legislature = params.legislature || CURRENT_LEGISLATURE;

    let filters = "";
    if (surname) {
      filters += `FILTER(REGEX(?cognome, '${surname}', 'i'))\n`;
    }
    if (firstName) {
      filters += `FILTER(REGEX(?nome, '${firstName}', 'i'))\n`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?deputato ?cognome ?nome ?genere
  ?dataNascita ?luogoNascita
  ?collegio ?nomeGruppo ?sigla
WHERE {
  ?deputato a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    ocd:rif_mandatoCamera ?mandato;
    foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  ?mandato ocd:rif_elezione ?elezione.
  MINUS{?mandato ocd:endDate ?fineMandato.}

  OPTIONAL {?elezione dc:coverage ?collegio}

  OPTIONAL{
    ?deputato ocd:aderisce ?aderisce.
    ?aderisce ocd:rif_gruppoParlamentare ?gruppo.
    ?gruppo <http://purl.org/dc/terms/alternative> ?sigla.
    ?gruppo dc:title ?nomeGruppo.
    MINUS{?aderisce ocd:endDate ?fineAdesione}
  }

  OPTIONAL{
    ?persona a foaf:Person;
      ocd:rif_mandatoCamera ?mandato;
      bio:Birth ?nascita.
    ?nascita bio:date ?dataNascita;
      ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

  ${filters}
}
ORDER BY ?cognome ?nome
LIMIT 100
    `.trim();
  }

  /**
   * Get detailed info about a specific deputy
   */
  static getDeputyDetails(deputyUri: string): string {
    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?deputato ?persona ?cognome ?nome ?genere ?info
  ?dataNascita ?luogoNascita
  ?collegio ?lista ?nomeGruppo ?sigla
  ?commissione ?ruoloCommissione
WHERE {
  BIND(<${deputyUri}> as ?deputato)

  ?deputato a ocd:deputato;
    ocd:rif_persona ?persona;
    foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  OPTIONAL{?deputato dc:description ?info}

  OPTIONAL{
    ?persona bio:Birth ?nascita.
    ?nascita bio:date ?dataNascita;
      ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

  OPTIONAL{
    ?deputato ocd:rif_mandatoCamera ?mandato.
    ?mandato ocd:rif_elezione ?elezione.
    OPTIONAL {?elezione dc:coverage ?collegio}
    OPTIONAL {?elezione ocd:lista ?lista}
  }

  OPTIONAL{
    ?deputato ocd:aderisce ?aderisce.
    ?aderisce ocd:rif_gruppoParlamentare ?gruppo.
    ?gruppo <http://purl.org/dc/terms/alternative> ?sigla.
    ?gruppo dc:title ?nomeGruppo.
    MINUS{?aderisce ocd:endDate ?fineAdesione}
  }

  OPTIONAL{
    ?deputato ocd:membro ?membro.
    ?membro ocd:rif_organo ?organo.
    ?organo dc:title ?commissione.
    OPTIONAL{?membro ocd:ruolo ?ruoloCommissione}
    MINUS{?membro ocd:endDate ?fineMembership}
  }
}
LIMIT 10
    `.trim();
  }

  /**
   * Search for parliamentary acts
   */
  static searchActs(params: ActSearchParams = {}): string {
    const { title, actType, status, limit = 20 } = params;
    const legislature = params.legislature || CURRENT_LEGISLATURE;

    let filters = "";
    if (title) {
      filters += `FILTER(REGEX(?titolo, '${title}', 'i'))\n`;
    }
    if (actType) {
      filters += `FILTER(REGEX(?tipo, '${actType}', 'i'))\n`;
    }
    if (status) {
      filters += `FILTER(REGEX(?stato, '${status}', 'i'))\n`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT DISTINCT ?atto ?numero ?titolo ?tipo ?iniziativa ?presentazione ?concluso
WHERE {
  ?atto a ocd:atto;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    dc:identifier ?numero;
    dc:title ?titolo;
    dc:date ?presentazione.

  OPTIONAL{?atto dc:type ?tipo}
  OPTIONAL{?atto ocd:iniziativa ?iniziativa}
  OPTIONAL{?atto ocd:concluso ?concluso}

  ${filters}
}
ORDER BY DESC(?presentazione)
LIMIT ${limit}
    `.trim();
  }

  /**
   * Get detailed info about a specific act
   */
  static getActDetails(actUri: string): string {
    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?atto ?numero ?titolo ?tipo ?iniziativa ?presentazione
  ?concluso ?costituzionale
  ?fase ?dataFase
  ?proponente ?nomeProponente ?cognomeProponente
  ?dataApprovazione
WHERE {
  BIND(<${actUri}> as ?atto)

  ?atto a ocd:atto;
    dc:identifier ?numero;
    dc:title ?titolo;
    dc:date ?presentazione.

  OPTIONAL{?atto dc:type ?tipo}
  OPTIONAL{?atto ocd:iniziativa ?iniziativa}
  OPTIONAL{?atto ocd:concluso ?concluso}
  OPTIONAL{?atto ocd:costituzionale ?costituzionale}

  OPTIONAL{
    ?atto ocd:rif_statoIter ?statoIter.
    ?statoIter dc:title ?fase; dc:date ?dataFase.
  }

  OPTIONAL{
    ?atto ocd:primo_firmatario ?proponente.
    ?proponente foaf:firstName ?nomeProponente;
      foaf:surname ?cognomeProponente.
  }

  OPTIONAL{
    ?votazione a ocd:votazione;
      ocd:rif_attoCamera ?atto;
      ocd:approvato "1"^^xsd:integer;
      ocd:votazioneFinale "1"^^xsd:integer;
      dc:date ?dataApprovazione.
  }
}
ORDER BY ?dataFase
LIMIT 100
    `.trim();
  }

  /**
   * Get voting records
   */
  static getVotings(params: VotingSearchParams = {}): string {
    const { actUri, dateFrom, dateTo, limit = 20 } = params;

    let actFilter = "";
    if (actUri) {
      actFilter = `?votazione ocd:rif_attoCamera <${actUri}>;\n`;
    }

    let dateFilter = "";
    if (dateFrom) {
      dateFilter += `FILTER(?data >= "${dateFrom}")\n`;
    }
    if (dateTo) {
      dateFilter += `FILTER(?data <= "${dateTo}")\n`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT DISTINCT ?votazione ?data ?titolo ?descrizione
  ?votanti ?favorevoli ?contrari ?astenuti
  ?approvato ?votazioneFinale
WHERE {
  ?votazione a ocd:votazione;
    ${actFilter}
    dc:date ?data.

  OPTIONAL{?votazione dc:title ?titolo}
  OPTIONAL{?votazione dc:description ?descrizione}
  OPTIONAL{?votazione ocd:votanti ?votanti}
  OPTIONAL{?votazione ocd:favorevoli ?favorevoli}
  OPTIONAL{?votazione ocd:contrari ?contrari}
  OPTIONAL{?votazione ocd:astenuti ?astenuti}
  OPTIONAL{?votazione ocd:approvato ?approvato}
  OPTIONAL{?votazione ocd:votazioneFinale ?votazioneFinale}

  ${dateFilter}
}
ORDER BY DESC(?data)
LIMIT ${limit}
    `.trim();
  }

  /**
   * Get parliamentary groups
   */
  static getParliamentaryGroups(legislature?: string): string {
    const leg = legislature || CURRENT_LEGISLATURE;

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT DISTINCT ?gruppo ?nomeUfficiale ?sigla ?startDate ?endDate
WHERE {
  ?gruppo a ocd:gruppoParlamentare;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${leg}>;
    dc:title ?nomeUfficiale.

  OPTIONAL{?gruppo <http://purl.org/dc/terms/alternative> ?sigla}
  OPTIONAL{?gruppo ocd:startDate ?startDate}
  OPTIONAL{?gruppo ocd:endDate ?endDate}
}
ORDER BY ?nomeUfficiale
    `.trim();
  }

  /**
   * Get parliamentary organs/commissions
   */
  static getOrgans(params: OrganSearchParams = {}): string {
    const legislature = params.legislature || CURRENT_LEGISLATURE;
    const { organType } = params;

    let filter = "";
    if (organType) {
      filter = `FILTER(REGEX(?tipo, '${organType}', 'i'))`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT DISTINCT ?organo ?nome ?tipo ?startDate ?endDate
WHERE {
  ?organo a ocd:organo;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    dc:title ?nome.

  OPTIONAL{?organo dc:type ?tipo}
  OPTIONAL{?organo ocd:startDate ?startDate}
  OPTIONAL{?organo ocd:endDate ?endDate}

  ${filter}
}
ORDER BY ?nome
LIMIT 100
    `.trim();
  }

  /**
   * Get governments
   */
  static getGovernments(params: GovernmentSearchParams = {}): string {
    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT DISTINCT ?governo ?nome ?startDate ?endDate
WHERE {
  ?governo a ocd:governo;
    dc:title ?nome;
    ocd:startDate ?startDate.

  OPTIONAL{?governo ocd:endDate ?endDate}
}
ORDER BY DESC(?startDate)
LIMIT 50
    `.trim();
  }

  /**
   * Get government members
   */
  static getGovernmentMembers(governmentUri: string): string {
    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?persona ?nome ?cognome ?carica ?organoGoverno ?delega ?startDate ?endDate
WHERE {
  ?membroGoverno ocd:rif_governo <${governmentUri}>;
    ocd:rif_persona ?persona;
    ocd:membroGoverno ?carica;
    ocd:startDate ?startDate.

  ?persona foaf:firstName ?nome;
    foaf:surname ?cognome.

  OPTIONAL{?membroGoverno ocd:rif_organoGoverno ?organo.
    ?organo dc:title ?organoGoverno}
  OPTIONAL{?membroGoverno dc:description ?delega}
  OPTIONAL{?membroGoverno ocd:endDate ?endDate}
}
ORDER BY ?cognome ?nome
    `.trim();
  }

  /**
   * Search interventions/debates on a topic
   */
  static searchInterventions(topic: string, legislature?: string, limit = 20): string {
    const leg = legislature || CURRENT_LEGISLATURE;

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?deputato ?cognome ?nome ?argomento ?titoloSeduta ?data
WHERE {
  ?dibattito a ocd:dibattito;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${leg}>.

  ?dibattito ocd:rif_discussione ?discussione.
  ?discussione ocd:rif_seduta ?seduta.
  ?seduta dc:date ?data; dc:title ?titoloSeduta.

  ?discussione rdfs:label ?argomento.
  FILTER(REGEX(?argomento,'${topic}','i'))

  ?discussione ocd:rif_intervento ?intervento.
  ?intervento ocd:rif_deputato ?deputato.
  ?deputato foaf:firstName ?nome; foaf:surname ?cognome.
}
ORDER BY DESC(?data) ?cognome ?nome
LIMIT ${limit}
    `.trim();
  }

  /**
   * Get acts with their iter phases and approval dates
   */
  static getActsWithIterPhases(params: {
    legislature?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): string {
    const legislature = params.legislature || CURRENT_LEGISLATURE;
    const limit = params.limit || 100;

    let dateFilter = "";
    if (params.dateFrom) {
      dateFilter += `FILTER(?presentazione >= "${params.dateFrom}")\n`;
    }
    if (params.dateTo) {
      dateFilter += `FILTER(?presentazione <= "${params.dateTo}")\n`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?atto ?numero ?iniziativa ?presentazione ?titolo ?fase ?dataIter ?dataApprovazione
WHERE {
  ?atto a ocd:atto;
    ocd:iniziativa ?iniziativa;
    dc:identifier ?numero;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    dc:date ?presentazione;
    dc:title ?titolo;
    ocd:rif_statoIter ?statoIter.

  ?statoIter dc:title ?fase;
    dc:date ?dataIter.

  ${dateFilter}

  OPTIONAL {
    ?votazione a ocd:votazione;
      ocd:rif_attoCamera ?atto;
      ocd:approvato "1"^^xsd:integer;
      ocd:votazioneFinale "1"^^xsd:integer;
      dc:date ?dataApprovazione.
  }
}
ORDER BY DESC(?presentazione) ?dataIter
LIMIT ${limit}
    `.trim();
  }

  /**
   * Get deputy's presented acts (as first or co-signer)
   */
  static getDeputyActs(params: {
    surname: string;
    firstName?: string;
    legislature?: string;
    role?: "primo_firmatario" | "altro_firmatario" | "both";
    limit?: number;
  }): string {
    const legislature = params.legislature || CURRENT_LEGISLATURE;
    const limit = params.limit || 100;
    const { surname, firstName, role = "both" } = params;

    let roleFilter = "";
    if (role === "primo_firmatario") {
      roleFilter = "FILTER(?ruolo = ocd:primo_firmatario)";
    } else if (role === "altro_firmatario") {
      roleFilter = "FILTER(?ruolo = ocd:altro_firmatario)";
    }

    let nameFilter = `FILTER(REGEX(?cognome,'${surname}','i'))`;
    if (firstName) {
      nameFilter += `\nFILTER(REGEX(?nome,'${firstName}','i'))`;
    }

    const query = role === "both" ? `
{
  ?atto ?ruolo ?deputato;
    dc:date ?date;
    dc:identifier ?numeroAtto;
    dc:title ?titolo.
  OPTIONAL{?atto dc:type ?tipo}
  FILTER(?ruolo = ocd:primo_firmatario)
}
UNION
{
  ?atto ?ruolo ?deputato;
    dc:date ?date;
    dc:identifier ?numeroAtto;
    dc:title ?titolo.
  OPTIONAL{?atto dc:type ?tipo}
  FILTER(?ruolo = ocd:altro_firmatario)
}` : `
?atto ?ruolo ?deputato;
  dc:date ?date;
  dc:identifier ?numeroAtto;
  dc:title ?titolo.
OPTIONAL{?atto dc:type ?tipo}
${roleFilter}`;

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?atto ?tipoRuolo ?tipo ?numeroAtto ?date ?titolo ?cognome ?nome
WHERE {
${query}

?ruolo rdfs:label ?tipoRuolo.

?deputato foaf:surname ?cognome;
  foaf:firstName ?nome;
  ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>

${nameFilter}
}
ORDER BY DESC(?ruolo) ASC(?tipo) ASC(?date)
LIMIT ${limit}
    `.trim();
  }

  /**
   * Get vote expressions for a specific voting
   */
  static getVoteExpressions(params: {
    date: string;
    voteNumber: string;
  }): string {
    const { date, voteNumber } = params;

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?votazione ?titolo ?descrizione ?numeroVotazione
  ?cognome ?nome ?espressione ?infoAssenza ?deputato
WHERE {
  ?votazione a ocd:votazione;
    dc:date '${date}';
    rdfs:label ?titolo;
    dc:description ?descrizione;
    dc:identifier ?numeroVotazione.
  FILTER(regex(?numeroVotazione,'${voteNumber}'))

  ?voto a ocd:voto;
    ocd:rif_votazione ?votazione;
    dc:type ?espressione;
    ocd:rif_deputato ?deputato.
  OPTIONAL{?voto dc:description ?infoAssenza}

  ?deputato foaf:surname ?cognome;
    foaf:firstName ?nome
}
ORDER BY ?cognome
    `.trim();
  }

  /**
   * Get voting statistics by deputy
   */
  static getDeputyVotingStats(params: {
    surname: string;
    firstName?: string;
    legislature?: string;
    voteType?: "Favorevole" | "Contrario" | "Astensione" | "Ha votato" | "Non ha votato";
    dateFrom?: string;
    dateTo?: string;
  }): string {
    const legislature = params.legislature || CURRENT_LEGISLATURE;
    const { surname, firstName, voteType } = params;

    let nameFilter = `FILTER(REGEX(?cognome,'^${surname}','i'))`;
    if (firstName) {
      nameFilter += `\nFILTER(REGEX(?nome,'^${firstName}','i'))`;
    }

    let dateFilter = "";
    if (params.dateFrom && params.dateTo) {
      dateFilter = `FILTER(REGEX(?date,'^${params.dateFrom.substring(0, 6)}','i'))`;
    }

    let voteTypeFilter = "";
    if (voteType) {
      voteTypeFilter = `FILTER(REGEX(?espressione,'${voteType}','i'))`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?cognome ?nome ?espressione (COUNT(DISTINCT ?votazione) as ?numero)
WHERE {
  ?deputato foaf:surname ?cognome;
    foaf:firstName ?nome;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>
  ${nameFilter}

  ?votazione a ocd:votazione;
    dc:date ?date.
  ${dateFilter}

  ?voto a ocd:voto;
    ocd:rif_votazione ?votazione;
    dc:type ?espressione;
    ocd:rif_deputato ?deputato;
    dc:identifier ?numero.
  ${voteTypeFilter}
}
ORDER BY DESC(?numero) ASC(?cognome) ASC(?nome)
LIMIT 1000
    `.trim();
  }

  /**
   * Get government positions of deputies
   */
  static getDeputyGovernmentPositions(params: {
    legislature?: string;
    surname?: string;
    firstName?: string;
  } = {}): string {
    const legislature = params.legislature || CURRENT_LEGISLATURE;
    const { surname, firstName } = params;

    let filters = "";
    if (surname) {
      filters += `FILTER(REGEX(?cognome, '${surname}', 'i'))\n`;
    }
    if (firstName) {
      filters += `FILTER(REGEX(?nome, '${firstName}', 'i'))\n`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?d ?cognome ?nome ?membroGoverno
  ?dataInizio ?dataFine ?carica ?nomeGoverno ?nomeOrganoGoverno ?delega
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ?d a ocd:deputato;
    ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    ocd:rif_mandatoCamera ?mandato.

  ?d foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  ${filters}

  ?persona ocd:rif_membroGoverno ?membroGoverno.
  ?membroGoverno ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    ocd:startDate ?dataInizio;
    ocd:membroGoverno ?carica.

  ?membroGoverno ocd:rif_governo ?governo.
  ?governo dc:title ?nomeGoverno.

  OPTIONAL {
    ?membroGoverno ocd:rif_organoGoverno ?organoGoverno.
    ?organoGoverno dc:title ?nomeOrganoGoverno.
  }

  OPTIONAL {?membroGoverno ocd:endDate ?dataFine}
  OPTIONAL {?membroGoverno dc:description ?delega}
}
ORDER BY ?nomeGoverno
LIMIT 1000
    `.trim();
  }

  /**
   * Get deputy interventions in assembly by topic
   */
  static getDeputyInterventionsByTopic(params: {
    topic: string;
    legislature?: string;
    surname?: string;
    firstName?: string;
    limit?: number;
  }): string {
    const legislature = params.legislature || CURRENT_LEGISLATURE;
    const { topic, surname, firstName } = params;
    const limit = params.limit || 50;

    let deputyFilter = "";
    if (surname) {
      deputyFilter += `FILTER(REGEX(STR(?cognome),'${surname}','i'))\n`;
    }
    if (firstName) {
      deputyFilter += `FILTER(REGEX(STR(?nome),'${firstName}','i'))\n`;
    }

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?deputatoId ?cognome ?nome ?argomento ?titoloSeduta ?data ?testo
WHERE {
  ?dibattito a ocd:dibattito;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>.

  ?dibattito ocd:rif_discussione ?discussione.
  ?discussione ocd:rif_seduta ?seduta.
  ?seduta dc:date ?data;
    dc:title ?titoloSeduta.
  ?seduta ocd:rif_assemblea ?assemblea.

  ?discussione rdfs:label ?argomento.
  FILTER(regex(?argomento,'${topic}','i'))

  ?discussione ocd:rif_intervento ?intervento.
  ?intervento ocd:rif_deputato ?deputatoId;
    dc:relation ?testo.
  ?deputatoId foaf:firstName ?nome;
    foaf:surname ?cognome.

  ${deputyFilter}
}
ORDER BY ?cognome ?nome ?data
LIMIT ${limit}
    `.trim();
  }

  /**
   * Get parliamentary group positions with dates
   */
  static getParliamentaryGroupPositions(legislature?: string): string {
    const leg = legislature || CURRENT_LEGISLATURE;

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?d ?cognome ?nome ?genere ?incarico ?organo
  ?inizioIncarico ?fineIncarico
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ?d a ocd:deputato;
    ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${leg}>;
    ocd:rif_mandatoCamera ?mandato.

  ?d foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  ?d ocd:rif_incarico ?incaricoUri.
  ?incaricoUri ocd:rif_gruppoParlamentare ?organoUri;
    ocd:ruolo ?incarico.
  OPTIONAL{?incaricoUri ocd:endDate ?fineIncarico}
  OPTIONAL{?incaricoUri ocd:startDate ?inizioIncarico}
  ?organoUri dc:title ?organo.
}
ORDER BY ?d
LIMIT 10000
    `.trim();
  }

  /**
   * Get parliamentary organ positions with dates
   */
  static getParliamentaryOrganPositions(legislature?: string): string {
    const leg = legislature || CURRENT_LEGISLATURE;

    return `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?d ?cognome ?nome ?info ?dataNascita ?luogoNascita ?genere
  ?ufficio ?organo ?inizioUfficio ?fineUfficio ?collegio
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ?d a ocd:deputato;
    ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${leg}>;
    ocd:rif_mandatoCamera ?mandato.
  OPTIONAL{?d dc:description ?info}

  ?d foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  OPTIONAL {
    ?persona <http://purl.org/vocab/bio/0.1/Birth> ?nascita.
    ?nascita <http://purl.org/vocab/bio/0.1/date> ?dataNascita;
      rdfs:label ?nato;
      ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

  ?mandato ocd:rif_elezione ?elezione.
  ?elezione dc:coverage ?collegio.

  ?d ocd:rif_ufficioParlamentare ?ufficioUri.
  ?ufficioUri ocd:rif_organo ?organoUri;
    ocd:carica ?ufficio.
  OPTIONAL{?ufficioUri ocd:endDate ?fineUfficio}
  OPTIONAL{?ufficioUri ocd:startDate ?inizioUfficio}
  ?organoUri dc:title ?organo.
}
ORDER BY ?d
LIMIT 10000
    `.trim();
  }
}
