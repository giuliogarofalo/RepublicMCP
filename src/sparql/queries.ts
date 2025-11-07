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

SELECT DISTINCT ?deputato ?persona ?cognome ?nome ?genere
  ?dataNascita ?luogoNascita
  ?collegio ?nomeGruppo ?sigla
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ?deputato a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/${legislature}>;
    ocd:rif_mandatoCamera ?mandato;
    ocd:rif_persona ?persona.

  ?deputato foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  OPTIONAL{
    ?persona bio:Birth ?nascita.
    ?nascita bio:date ?dataNascita;
      ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

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
}
