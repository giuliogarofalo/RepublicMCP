/**
 * Camera dei Deputati - Parliamentary Acts Queries
 * Query builders for legislative acts (DDL, proposals, motions)
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { CAMERA_PREFIXES, buildLegislatureUri } from '../ontology/prefixes.js';
import type { AttoSearchParams } from '../ontology/types.js';

export class CameraAttiQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return CAMERA_PREFIXES;
  }

  /**
   * Search for parliamentary acts
   */
  static searchActs(params: AttoSearchParams = {}): string {
    const {
      title,
      actType,
      legislature = 19,
      initiative,
      status,
      concluded,
      constitutional,
      dateFrom,
      dateTo,
      limit = 20,
    } = params;

    const legislatureUri = buildLegislatureUri(legislature);

    let filters = '';
    if (title) {
      filters += `FILTER(REGEX(?titolo, '${title}', 'i'))\n  `;
    }
    if (actType) {
      filters += `FILTER(REGEX(?tipo, '${actType}', 'i'))\n  `;
    }
    if (initiative) {
      filters += `FILTER(REGEX(?iniziativa, '${initiative}', 'i'))\n  `;
    }
    if (status) {
      filters += `FILTER(REGEX(?stato, '${status}', 'i'))\n  `;
    }
    if (concluded !== undefined) {
      const conclusoValue = concluded ? '"1"^^xsd:integer' : '"0"^^xsd:integer';
      filters += `FILTER(?concluso = ${conclusoValue})\n  `;
    }
    if (constitutional !== undefined) {
      const costituzValue = constitutional ? '"1"^^xsd:integer' : '"0"^^xsd:integer';
      filters += `FILTER(?costituzionale = ${costituzValue})\n  `;
    }
    if (dateFrom) {
      filters += `FILTER(?presentazione >= "${dateFrom}")\n  `;
    }
    if (dateTo) {
      filters += `FILTER(?presentazione <= "${dateTo}")\n  `;
    }

    const select = `?atto ?numero ?titolo ?tipo ?iniziativa ?presentazione ?concluso ?costituzionale`.trim();

    const where = `
  ?atto a ocd:atto ;
    ocd:rif_leg <${legislatureUri}> ;
    dc:identifier ?numero ;
    dc:title ?titolo ;
    dc:date ?presentazione .

  OPTIONAL { ?atto dc:type ?tipo }
  OPTIONAL { ?atto ocd:iniziativa ?iniziativa }
  OPTIONAL { ?atto ocd:concluso ?concluso }
  OPTIONAL { ?atto ocd:costituzionale ?costituzionale }

  ${filters}
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?presentazione)',
      limit,
    });
  }

  /**
   * Get recent acts
   */
  static getRecentActs(params: {
    legislature?: number;
    days?: number;
    limit?: number;
  } = {}): string {
    const { legislature = 19, limit = 20 } = params;

    // Calculate date filter if days is provided
    let dateFrom: string | undefined;
    if (params.days) {
      const date = new Date();
      date.setDate(date.getDate() - params.days);
      dateFrom = date.toISOString().split('T')[0].replace(/-/g, '');
    }

    return CameraAttiQueries.searchActs({
      legislature,
      dateFrom,
      limit,
    });
  }

  /**
   * Get detailed info about a specific act
   */
  static getActDetails(actUri: string): string {
    const select = `?atto ?numero ?titolo ?tipo ?iniziativa ?presentazione ?concluso ?costituzionale ?fase ?dataFase ?proponente ?nomeProponente ?cognomeProponente ?dataApprovazione`.trim();

    const where = `
  BIND(<${actUri}> as ?atto)

  ?atto a ocd:atto ;
    dc:identifier ?numero ;
    dc:title ?titolo ;
    dc:date ?presentazione .

  OPTIONAL { ?atto dc:type ?tipo }
  OPTIONAL { ?atto ocd:iniziativa ?iniziativa }
  OPTIONAL { ?atto ocd:concluso ?concluso }
  OPTIONAL { ?atto ocd:costituzionale ?costituzionale }

  OPTIONAL {
    ?atto ocd:rif_statoIter ?statoIter .
    ?statoIter dc:title ?fase ;
      dc:date ?dataFase .
  }

  OPTIONAL {
    ?atto ocd:primo_firmatario ?proponente .
    ?proponente foaf:firstName ?nomeProponente ;
      foaf:surname ?cognomeProponente .
  }

  OPTIONAL {
    ?votazione a ocd:votazione ;
      ocd:rif_attoCamera ?atto ;
      ocd:approvato "1"^^xsd:integer ;
      ocd:votazioneFinale "1"^^xsd:integer ;
      dc:date ?dataApprovazione .
  }
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?dataFase',
      limit: 100,
    });
  }

  /**
   * Get acts with their iter phases
   */
  static getActsWithIterPhases(params: {
    legislature?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): string {
    const { legislature = 19, dateFrom, dateTo, limit = 100 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let dateFilter = '';
    if (dateFrom) {
      dateFilter += `FILTER(?presentazione >= "${dateFrom}")\n  `;
    }
    if (dateTo) {
      dateFilter += `FILTER(?presentazione <= "${dateTo}")\n  `;
    }

    const select = `?atto ?numero ?iniziativa ?presentazione ?titolo ?fase ?dataIter ?dataApprovazione`.trim();

    const where = `
  ?atto a ocd:atto ;
    ocd:iniziativa ?iniziativa ;
    dc:identifier ?numero ;
    ocd:rif_leg <${legislatureUri}> ;
    dc:date ?presentazione ;
    dc:title ?titolo ;
    ocd:rif_statoIter ?statoIter .

  ?statoIter dc:title ?fase ;
    dc:date ?dataIter .

  ${dateFilter}

  OPTIONAL {
    ?votazione a ocd:votazione ;
      ocd:rif_attoCamera ?atto ;
      ocd:approvato "1"^^xsd:integer ;
      ocd:votazioneFinale "1"^^xsd:integer ;
      dc:date ?dataApprovazione .
  }
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?presentazione) ?dataIter',
      limit,
    });
  }

  /**
   * Get deputy's presented acts (as first or co-signer)
   */
  static getDeputyActs(params: {
    surname: string;
    firstName?: string;
    legislature?: number;
    role?: 'primo_firmatario' | 'altro_firmatario' | 'both';
    limit?: number;
  }): string {
    const {
      surname,
      firstName,
      legislature = 19,
      role = 'both',
      limit = 100,
    } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    let roleFilter = '';
    if (role === 'primo_firmatario') {
      roleFilter = 'FILTER(?ruolo = ocd:primo_firmatario)';
    } else if (role === 'altro_firmatario') {
      roleFilter = 'FILTER(?ruolo = ocd:altro_firmatario)';
    }

    let nameFilter = `FILTER(REGEX(?cognome, '${surname}', 'i'))`;
    if (firstName) {
      nameFilter += `\n  FILTER(REGEX(?nome, '${firstName}', 'i'))`;
    }

    const query =
      role === 'both'
        ? `
{
  ?atto ?ruolo ?deputato ;
    dc:date ?date ;
    dc:identifier ?numeroAtto ;
    dc:title ?titolo .
  OPTIONAL { ?atto dc:type ?tipo }
  FILTER(?ruolo = ocd:primo_firmatario)
}
UNION
{
  ?atto ?ruolo ?deputato ;
    dc:date ?date ;
    dc:identifier ?numeroAtto ;
    dc:title ?titolo .
  OPTIONAL { ?atto dc:type ?tipo }
  FILTER(?ruolo = ocd:altro_firmatario)
}`
        : `
?atto ?ruolo ?deputato ;
  dc:date ?date ;
  dc:identifier ?numeroAtto ;
  dc:title ?titolo .
OPTIONAL { ?atto dc:type ?tipo }
${roleFilter}`;

    const select = `?atto ?tipoRuolo ?tipo ?numeroAtto ?date ?titolo ?cognome ?nome`.trim();

    const where = `
${query}

?ruolo rdfs:label ?tipoRuolo .

?deputato foaf:surname ?cognome ;
  foaf:firstName ?nome ;
  ocd:rif_leg <${legislatureUri}>

${nameFilter}
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?ruolo) ASC(?tipo) ASC(?date)',
      limit,
    });
  }

  /**
   * Get act proponents/signers
   */
  static getActProponents(actUri: string): string {
    const select = `?atto ?deputato ?cognome ?nome ?ruolo ?tipoRuolo`.trim();

    const where = `
  BIND(<${actUri}> as ?atto)

  ?atto ?ruolo ?deputato .

  FILTER(?ruolo = ocd:primo_firmatario || ?ruolo = ocd:altro_firmatario)

  ?ruolo rdfs:label ?tipoRuolo .

  ?deputato foaf:surname ?cognome ;
    foaf:firstName ?nome .
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?ruolo) ?cognome ?nome',
    });
  }

  /**
   * Get acts by type
   */
  static getActsByType(params: {
    actType: string;
    legislature?: number;
    limit?: number;
  }): string {
    const { actType, legislature = 19, limit = 50 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const select = `?atto ?numero ?titolo ?tipo ?presentazione ?iniziativa`.trim();

    const where = `
  ?atto a ocd:atto ;
    ocd:rif_leg <${legislatureUri}> ;
    dc:identifier ?numero ;
    dc:title ?titolo ;
    dc:type ?tipo ;
    dc:date ?presentazione .

  FILTER(REGEX(?tipo, '${actType}', 'i'))

  OPTIONAL { ?atto ocd:iniziativa ?iniziativa }
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?presentazione)',
      limit,
    });
  }

  /**
   * Get acts statistics by status
   */
  static getActsStatisticsByStatus(params: {
    legislature?: number;
  } = {}): string {
    const { legislature = 19 } = params;
    const legislatureUri = buildLegislatureUri(legislature);

    const select = `
SELECT ?fase (COUNT(DISTINCT ?atto) as ?numeroAtti)
    `.trim();

    const where = `
  ?atto a ocd:atto ;
    ocd:rif_leg <${legislatureUri}> ;
    ocd:rif_statoIter ?statoIter .

  ?statoIter dc:title ?fase .
    `.trim();

    const instance = new CameraAttiQueries();
    return instance.buildQuery(select, where, {
      groupBy: '?fase',
      orderBy: 'DESC(?numeroAtti)',
    });
  }
}
