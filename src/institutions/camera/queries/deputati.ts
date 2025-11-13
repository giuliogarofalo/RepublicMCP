/**
 * Camera dei Deputati - Deputies Queries
 * Query builders for deputies and biographical information
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { CAMERA_PREFIXES, buildLegislatureUri } from '../ontology/prefixes.js';
import type { DeputatoSearchParams } from '../ontology/types.js';

export class CameraDeputatiQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return CAMERA_PREFIXES;
  }

  /**
   * Get current deputies with biographical info
   */
  static getCurrentDeputies(params: DeputatoSearchParams = {}): string {
    const {
      firstName,
      surname,
      legislature = 19,
      parliamentaryGroup,
      limit = 100,
    } = params;

    const legislatureUri = buildLegislatureUri(legislature);

    let filters = '';
    if (surname) {
      filters += `FILTER(REGEX(?cognome, '${surname}', 'i'))\n  `;
    }
    if (firstName) {
      filters += `FILTER(REGEX(?nome, '${firstName}', 'i'))\n  `;
    }
    if (parliamentaryGroup) {
      filters += `FILTER(REGEX(?nomeGruppo, '${parliamentaryGroup}', 'i'))\n  `;
    }

    const select = `
?deputato ?cognome ?nome ?genere
  ?dataNascita ?luogoNascita
  ?collegio ?nomeGruppo ?sigla
    `.trim();

    const where = `
  ?deputato a ocd:deputato ;
    ocd:rif_leg <${legislatureUri}> ;
    ocd:rif_mandatoCamera ?mandato ;
    foaf:surname ?cognome ;
    foaf:gender ?genere ;
    foaf:firstName ?nome .

  ?mandato ocd:rif_elezione ?elezione .
  MINUS { ?mandato ocd:endDate ?fineMandato }

  OPTIONAL { ?elezione dc:coverage ?collegio }

  OPTIONAL {
    ?deputato ocd:aderisce ?aderisce .
    ?aderisce ocd:rif_gruppoParlamentare ?gruppo .
    ?gruppo dcterms:alternative ?sigla .
    ?gruppo dc:title ?nomeGruppo .
    MINUS { ?aderisce ocd:endDate ?fineAdesione }
  }

  OPTIONAL {
    ?persona a foaf:Person ;
      ocd:rif_mandatoCamera ?mandato ;
      bio:Birth ?nascita .
    ?nascita bio:date ?dataNascita ;
      ocd:rif_luogo ?luogoNascitaUri .
    ?luogoNascitaUri dc:title ?luogoNascita .
  }

  ${filters}
    `.trim();

    const instance = new CameraDeputatiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome ?nome',
      limit,
    });
  }

  /**
   * Search deputies with flexible filters
   */
  static searchDeputies(params: DeputatoSearchParams): string {
    return CameraDeputatiQueries.getCurrentDeputies(params);
  }

  /**
   * Get detailed info about a specific deputy
   */
  static getDeputyDetails(deputyUri: string): string {
    const select = `
SELECT DISTINCT ?deputato ?persona ?cognome ?nome ?genere ?info
  ?dataNascita ?luogoNascita
  ?collegio ?lista ?nomeGruppo ?sigla
  ?commissione ?ruoloCommissione
    `.trim();

    const where = `
  BIND(<${deputyUri}> as ?deputato)

  ?deputato a ocd:deputato ;
    ocd:rif_persona ?persona ;
    foaf:surname ?cognome ;
    foaf:gender ?genere ;
    foaf:firstName ?nome .

  OPTIONAL { ?deputato dc:description ?info }

  OPTIONAL {
    ?persona bio:Birth ?nascita .
    ?nascita bio:date ?dataNascita ;
      ocd:rif_luogo ?luogoNascitaUri .
    ?luogoNascitaUri dc:title ?luogoNascita .
  }

  OPTIONAL {
    ?deputato ocd:rif_mandatoCamera ?mandato .
    ?mandato ocd:rif_elezione ?elezione .
    OPTIONAL { ?elezione dc:coverage ?collegio }
    OPTIONAL { ?elezione ocd:lista ?lista }
  }

  OPTIONAL {
    ?deputato ocd:aderisce ?aderisce .
    ?aderisce ocd:rif_gruppoParlamentare ?gruppo .
    ?gruppo dcterms:alternative ?sigla .
    ?gruppo dc:title ?nomeGruppo .
    MINUS { ?aderisce ocd:endDate ?fineAdesione }
  }

  OPTIONAL {
    ?deputato ocd:membro ?membro .
    ?membro ocd:rif_organo ?organo .
    ?organo dc:title ?commissione .
    OPTIONAL { ?membro ocd:ruolo ?ruoloCommissione }
    MINUS { ?membro ocd:endDate ?fineMembership }
  }
    `.trim();

    const instance = new CameraDeputatiQueries();
    return instance.buildQuery(select, where, {
      limit: 10,
    });
  }

  /**
   * Get deputy's mandates history
   */
  static getDeputyMandates(params: {
    surname: string;
    firstName?: string;
    legislature?: number;
  }): string {
    const { surname, firstName, legislature = 19 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let nameFilter = `FILTER(REGEX(?cognome, '^${surname}', 'i'))`;
    if (firstName) {
      nameFilter += `\n  FILTER(REGEX(?nome, '^${firstName}', 'i'))`;
    }

    const select = `
SELECT DISTINCT ?deputato ?cognome ?nome
  ?mandato ?inizioMandato ?fineMandato ?validazione
  ?collegio ?lista
    `.trim();

    const where = `
  ?deputato a ocd:deputato ;
    ocd:rif_leg <${legislatureUri}> ;
    ocd:rif_mandatoCamera ?mandato ;
    foaf:surname ?cognome ;
    foaf:firstName ?nome .

  ${nameFilter}

  ?mandato ocd:rif_elezione ?elezione .
  OPTIONAL { ?mandato ocd:startDate ?inizioMandato }
  OPTIONAL { ?mandato ocd:endDate ?fineMandato }
  OPTIONAL { ?mandato ocd:convalidaMandato ?validazione }
  OPTIONAL { ?elezione dc:coverage ?collegio }
  OPTIONAL { ?elezione ocd:lista ?lista }
    `.trim();

    const instance = new CameraDeputatiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?inizioMandato',
    });
  }

  /**
   * Get deputies by parliamentary group
   */
  static getDeputiesByGroup(params: {
    groupName: string;
    legislature?: number;
    active?: boolean;
  }): string {
    const { groupName, legislature = 19, active = true } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const activeFilter = active
      ? 'MINUS { ?aderisce ocd:endDate ?fineAdesione }'
      : '';

    const select = `
SELECT DISTINCT ?deputato ?cognome ?nome ?nomeGruppo ?sigla ?inizioAdesione ?fineAdesione
    `.trim();

    const where = `
  ?deputato a ocd:deputato ;
    ocd:rif_leg <${legislatureUri}> ;
    foaf:surname ?cognome ;
    foaf:firstName ?nome ;
    ocd:aderisce ?aderisce .

  ?aderisce ocd:rif_gruppoParlamentare ?gruppo .
  ?gruppo dc:title ?nomeGruppo ;
    dcterms:alternative ?sigla .

  FILTER(REGEX(?nomeGruppo, '${groupName}', 'i'))

  OPTIONAL { ?aderisce ocd:startDate ?inizioAdesione }
  OPTIONAL { ?aderisce ocd:endDate ?fineAdesione }

  ${activeFilter}
    `.trim();

    const instance = new CameraDeputatiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome ?nome',
      limit: 200,
    });
  }

  /**
   * Get deputies by constituency (collegio)
   */
  static getDeputiesByConstituency(params: {
    constituency: string;
    legislature?: number;
  }): string {
    const { constituency, legislature = 19 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const select = `
SELECT DISTINCT ?deputato ?cognome ?nome ?collegio ?lista
    `.trim();

    const where = `
  ?deputato a ocd:deputato ;
    ocd:rif_leg <${legislatureUri}> ;
    foaf:surname ?cognome ;
    foaf:firstName ?nome ;
    ocd:rif_mandatoCamera ?mandato .

  ?mandato ocd:rif_elezione ?elezione .
  ?elezione dc:coverage ?collegio .

  FILTER(REGEX(?collegio, '${constituency}', 'i'))

  OPTIONAL { ?elezione ocd:lista ?lista }
    `.trim();

    const instance = new CameraDeputatiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome ?nome',
    });
  }

  /**
   * Get deputies with government positions
   */
  static getDeputiesWithGovernmentPositions(params: {
    legislature?: number;
    surname?: string;
    firstName?: string;
  } = {}): string {
    const { legislature = 19, surname, firstName } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let filters = '';
    if (surname) {
      filters += `FILTER(REGEX(?cognome, '${surname}', 'i'))\n  `;
    }
    if (firstName) {
      filters += `FILTER(REGEX(?nome, '${firstName}', 'i'))\n  `;
    }

    const select = `
SELECT DISTINCT ?d ?cognome ?nome ?membroGoverno
  ?dataInizio ?dataFine ?carica ?nomeGoverno ?nomeOrganoGoverno ?delega
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

  ${filters}

  ?persona ocd:rif_membroGoverno ?membroGoverno .
  ?membroGoverno ocd:rif_leg <${legislatureUri}> ;
    ocd:startDate ?dataInizio ;
    ocd:membroGoverno ?carica .

  ?membroGoverno ocd:rif_governo ?governo .
  ?governo dc:title ?nomeGoverno .

  OPTIONAL {
    ?membroGoverno ocd:rif_organoGoverno ?organoGoverno .
    ?organoGoverno dc:title ?nomeOrganoGoverno .
  }

  OPTIONAL { ?membroGoverno ocd:endDate ?dataFine }
  OPTIONAL { ?membroGoverno dc:description ?delega }
    `.trim();

    const instance = new CameraDeputatiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?nomeGoverno',
      limit: 1000,
    });
  }
}
