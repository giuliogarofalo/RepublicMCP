/**
 * Camera dei Deputati - Parliamentary Organs Queries
 * Query builders for commissions, groups, and other organs
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { CAMERA_PREFIXES, buildLegislatureUri } from '../ontology/prefixes.js';
import type { OrganoSearchParams, GovernoSearchParams, InterventoSearchParams } from '../ontology/types.js';

export class CameraOrganiQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return CAMERA_PREFIXES;
  }

  // ============== PARLIAMENTARY GROUPS ==============

  /**
   * Get parliamentary groups
   */
  static getParliamentaryGroups(params: { legislature?: number } = {}): string {
    const { legislature = 19 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const select = `
SELECT DISTINCT ?gruppo ?nomeUfficiale ?sigla ?startDate ?endDate
    `.trim();

    const where = `
  ?gruppo a ocd:gruppoParlamentare ;
    ocd:rif_leg <${legislatureUri}> ;
    dc:title ?nomeUfficiale .

  OPTIONAL { ?gruppo dcterms:alternative ?sigla }
  OPTIONAL { ?gruppo ocd:startDate ?startDate }
  OPTIONAL { ?gruppo ocd:endDate ?endDate }
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?nomeUfficiale',
    });
  }

  /**
   * Get parliamentary group positions with dates
   */
  static getParliamentaryGroupPositions(params: { legislature?: number } = {}): string {
    const { legislature = 19 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const select = `
SELECT DISTINCT ?d ?cognome ?nome ?genere ?incarico ?organo
  ?inizioIncarico ?fineIncarico
    `.trim();

    const where = `
  ?persona ocd:rif_mandatoCamera ?mandato ;
    a foaf:Person .

  ?d a ocd:deputato ;
    ocd:aderisce ?aderisce ;
    ocd:rif_leg <${legislatureUri}> ;
    ocd:rif_mandatoCamera ?mandato .

  ?d foaf:surname ?cognome ;
    foaf:gender ?genere ;
    foaf:firstName ?nome .

  ?d ocd:rif_incarico ?incaricoUri .
  ?incaricoUri ocd:rif_gruppoParlamentare ?organoUri ;
    ocd:ruolo ?incarico .

  OPTIONAL { ?incaricoUri ocd:endDate ?fineIncarico }
  OPTIONAL { ?incaricoUri ocd:startDate ?inizioIncarico }

  ?organoUri dc:title ?organo .
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?d',
      limit: 10000,
    });
  }

  // ============== PARLIAMENTARY ORGANS/COMMISSIONS ==============

  /**
   * Get parliamentary organs/commissions
   */
  static getOrgans(params: OrganoSearchParams = {}): string {
    const { legislature = 19, organType, active = false, limit = 100 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let typeFilter = '';
    if (organType) {
      typeFilter = `FILTER(REGEX(?tipo, '${organType}', 'i'))`;
    }

    let activeFilter = '';
    if (active) {
      activeFilter = 'MINUS { ?organo ocd:endDate ?endDate }';
    }

    const select = `
SELECT DISTINCT ?organo ?nome ?tipo ?startDate ?endDate
    `.trim();

    const where = `
  ?organo a ocd:organo ;
    ocd:rif_leg <${legislatureUri}> ;
    dc:title ?nome .

  OPTIONAL { ?organo dc:type ?tipo }
  OPTIONAL { ?organo ocd:startDate ?startDate }
  OPTIONAL { ?organo ocd:endDate ?endDate }

  ${typeFilter}
  ${activeFilter}
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?nome',
      limit,
    });
  }

  /**
   * Get parliamentary organ positions
   */
  static getParliamentaryOrganPositions(params: { legislature?: number } = {}): string {
    const { legislature = 19 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const select = `
SELECT DISTINCT ?d ?cognome ?nome ?info ?dataNascita ?luogoNascita ?genere
  ?ufficio ?organo ?inizioUfficio ?fineUfficio ?collegio
    `.trim();

    const where = `
  ?persona ocd:rif_mandatoCamera ?mandato ;
    a foaf:Person .

  ?d a ocd:deputato ;
    ocd:aderisce ?aderisce ;
    ocd:rif_leg <${legislatureUri}> ;
    ocd:rif_mandatoCamera ?mandato .

  OPTIONAL { ?d dc:description ?info }

  ?d foaf:surname ?cognome ;
    foaf:gender ?genere ;
    foaf:firstName ?nome .

  OPTIONAL {
    ?persona bio:Birth ?nascita .
    ?nascita bio:date ?dataNascita ;
      rdfs:label ?nato ;
      ocd:rif_luogo ?luogoNascitaUri .
    ?luogoNascitaUri dc:title ?luogoNascita .
  }

  ?mandato ocd:rif_elezione ?elezione .
  ?elezione dc:coverage ?collegio .

  ?d ocd:rif_ufficioParlamentare ?ufficioUri .
  ?ufficioUri ocd:rif_organo ?organoUri ;
    ocd:carica ?ufficio .

  OPTIONAL { ?ufficioUri ocd:endDate ?fineUfficio }
  OPTIONAL { ?ufficioUri ocd:startDate ?inizioUfficio }

  ?organoUri dc:title ?organo .
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?d',
      limit: 10000,
    });
  }

  // ============== GOVERNMENTS ==============

  /**
   * Get governments
   */
  static getGovernments(params: GovernoSearchParams = {}): string {
    const { currentOnly = false, limit = 50 } = params;

    let activeFilter = '';
    if (currentOnly) {
      activeFilter = 'MINUS { ?governo ocd:endDate ?endDate }';
    }

    const select = `
SELECT DISTINCT ?governo ?nome ?startDate ?endDate
    `.trim();

    const where = `
  ?governo a ocd:governo ;
    dc:title ?nome ;
    ocd:startDate ?startDate .

  OPTIONAL { ?governo ocd:endDate ?endDate }

  ${activeFilter}
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?startDate)',
      limit,
    });
  }

  /**
   * Get government members
   */
  static getGovernmentMembers(governmentUri: string): string {
    const select = `
SELECT DISTINCT ?persona ?nome ?cognome ?carica ?organoGoverno ?delega ?startDate ?endDate
    `.trim();

    const where = `
  ?membroGoverno ocd:rif_governo <${governmentUri}> ;
    ocd:rif_persona ?persona ;
    ocd:membroGoverno ?carica ;
    ocd:startDate ?startDate .

  ?persona foaf:firstName ?nome ;
    foaf:surname ?cognome .

  OPTIONAL {
    ?membroGoverno ocd:rif_organoGoverno ?organo .
    ?organo dc:title ?organoGoverno
  }

  OPTIONAL { ?membroGoverno dc:description ?delega }
  OPTIONAL { ?membroGoverno ocd:endDate ?endDate }
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome ?nome',
    });
  }

  // ============== INTERVENTIONS/DEBATES ==============

  /**
   * Search interventions/debates on a topic
   */
  static searchInterventions(params: InterventoSearchParams): string {
    const { topic, legislature = 19, deputySurname, deputyFirstName, limit = 20 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let deputyFilter = '';
    if (deputySurname) {
      deputyFilter += `FILTER(REGEX(STR(?cognome), '${deputySurname}', 'i'))\n  `;
    }
    if (deputyFirstName) {
      deputyFilter += `FILTER(REGEX(STR(?nome), '${deputyFirstName}', 'i'))\n  `;
    }

    const select = `
SELECT DISTINCT ?deputato ?cognome ?nome ?argomento ?titoloSeduta ?data
    `.trim();

    const where = `
  ?dibattito a ocd:dibattito ;
    ocd:rif_leg <${legislatureUri}> .

  ?dibattito ocd:rif_discussione ?discussione .
  ?discussione ocd:rif_seduta ?seduta .
  ?seduta dc:date ?data ;
    dc:title ?titoloSeduta .

  ?discussione rdfs:label ?argomento .
  FILTER(REGEX(?argomento, '${topic}', 'i'))

  ?discussione ocd:rif_intervento ?intervento .
  ?intervento ocd:rif_deputato ?deputato .
  ?deputato foaf:firstName ?nome ;
    foaf:surname ?cognome .

  ${deputyFilter}
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?data) ?cognome ?nome',
      limit,
    });
  }

  /**
   * Get deputy interventions by topic
   */
  static getDeputyInterventionsByTopic(params: InterventoSearchParams): string {
    const {
      topic,
      legislature = 19,
      deputySurname,
      deputyFirstName,
      limit = 50,
    } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let deputyFilter = '';
    if (deputySurname) {
      deputyFilter += `FILTER(REGEX(STR(?cognome), '${deputySurname}', 'i'))\n  `;
    }
    if (deputyFirstName) {
      deputyFilter += `FILTER(REGEX(STR(?nome), '${deputyFirstName}', 'i'))\n  `;
    }

    const select = `
SELECT DISTINCT ?deputatoId ?cognome ?nome ?argomento ?titoloSeduta ?data ?testo
    `.trim();

    const where = `
  ?dibattito a ocd:dibattito ;
    ocd:rif_leg <${legislatureUri}> .

  ?dibattito ocd:rif_discussione ?discussione .
  ?discussione ocd:rif_seduta ?seduta .
  ?seduta dc:date ?data ;
    dc:title ?titoloSeduta .
  ?seduta ocd:rif_assemblea ?assemblea .

  ?discussione rdfs:label ?argomento .
  FILTER(REGEX(?argomento, '${topic}', 'i'))

  ?discussione ocd:rif_intervento ?intervento .
  ?intervento ocd:rif_deputato ?deputatoId ;
    dc:relation ?testo .
  ?deputatoId foaf:firstName ?nome ;
    foaf:surname ?cognome .

  ${deputyFilter}
    `.trim();

    const instance = new CameraOrganiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome ?nome ?data',
      limit,
    });
  }
}
