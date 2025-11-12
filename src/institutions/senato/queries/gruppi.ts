/**
 * SPARQL Queries for Gruppi Parlamentari (Parliamentary Groups)
 * ⚠️ Uses Camera ontology: ocd:gruppoParlamentare
 * But uses OSR properties: osr:gruppo, osr:inizio, osr:fine
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { GROUP_PREFIXES } from '../ontology/prefixes.js';
import type { GruppoSearchParams } from '../ontology/types.js';
import { QUERY_LIMITS } from '../../../config/constants.js';

export class SenatoGruppiQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return GROUP_PREFIXES;
  }

  /**
   * Get active parliamentary groups
   */
  static getGruppiAttivi(params: GruppoSearchParams = {}): string {
    const { limit = QUERY_LIMITS.default } = params;

    const select = '?gruppo ?nomeGruppo';

    const where = `
  # Parliamentary group (uses Camera ontology class)
  ?gruppo a ocd:gruppoParlamentare ;
    osr:denominazione ?den .

  ?den osr:titolo ?nomeGruppo .

  # Only active groups (no end date)
  OPTIONAL { ?den osr:fine ?fineDen }
  FILTER(!bound(?fineDen))
    `.trim();

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      limit,
      orderBy: '?nomeGruppo',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get group composition (members)
   */
  static getComposizioneGruppo(params: {
    groupName?: string;
    groupUri?: string;
    active?: boolean;
  }): string {
    const {
      groupName,
      groupUri,
      active = true,
    } = params;

    if (!groupName && !groupUri) {
      throw new Error('Either groupName or groupUri is required');
    }

    const select = `?gruppo ?nomeGruppo
                    ?senatore ?cognome ?nome ?carica ?inizio ?fine`;

    let where = `
  # Group
  ?gruppo a ocd:gruppoParlamentare ;
    osr:denominazione/osr:titolo ?nomeGruppo .

  ${groupName ? `FILTER(REGEX(?nomeGruppo, "${groupName}", "i"))` : ''}
  ${groupUri ? `FILTER(?gruppo = <${groupUri}>)` : ''}

  # Membership (uses Camera ontology property)
  ?senatore ocd:aderisce ?adesione .

  ?adesione a ocd:adesioneGruppo ;
    osr:gruppo ?gruppo ;      # OSR property!
    osr:inizio ?inizio .      # OSR property!

  OPTIONAL { ?adesione osr:carica ?carica }
  OPTIONAL { ?adesione osr:fine ?fine }

  # Senator info
  ?senatore foaf:firstName ?nome ;
    foaf:lastName ?cognome .
    `.trim();

    if (active) {
      where += '\n\n  # Only active memberships\n  FILTER(!bound(?fine))';
    }

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get senator's groups (history)
   */
  static getGruppiSenatore(params: {
    lastName: string;
    firstName?: string;
    active?: boolean;
  }): string {
    const {
      lastName,
      firstName,
      active = true,
    } = params;

    const select = `?senatore ?cognome ?nome
                    ?gruppo ?nomeGruppo ?carica
                    ?inizio ?fine`;

    let where = `
  # Find senator
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  FILTER(REGEX(?cognome, "${lastName}", "i"))
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}

  # Find memberships
  ?senatore ocd:aderisce ?adesione .

  ?adesione a ocd:adesioneGruppo ;
    osr:gruppo ?gruppo ;
    osr:inizio ?inizio .

  OPTIONAL { ?adesione osr:carica ?carica }
  OPTIONAL { ?adesione osr:fine ?fine }

  # Group name
  ?gruppo osr:denominazione ?den .
  ?den osr:titolo ?nomeGruppo .
    `.trim();

    if (active) {
      where += '\n\n  # Only active memberships\n  FILTER(!bound(?fine))';
    }

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?inizio',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get group leadership
   */
  static getLeadershipGruppo(params: {
    groupName?: string;
    groupUri?: string;
  }): string {
    const {
      groupName,
      groupUri,
    } = params;

    if (!groupName && !groupUri) {
      throw new Error('Either groupName or groupUri is required');
    }

    const select = `?gruppo ?nomeGruppo
                    ?senatore ?cognome ?nome ?carica ?inizio`;

    let where = `
  ?gruppo a ocd:gruppoParlamentare ;
    osr:denominazione/osr:titolo ?nomeGruppo .

  ${groupName ? `FILTER(REGEX(?nomeGruppo, "${groupName}", "i"))` : ''}
  ${groupUri ? `FILTER(?gruppo = <${groupUri}>)` : ''}

  ?senatore ocd:aderisce ?adesione .

  ?adesione a ocd:adesioneGruppo ;
    osr:gruppo ?gruppo ;
    osr:inizio ?inizio ;
    osr:carica ?carica .

  # Only positions (not simple members)
  FILTER(BOUND(?carica))

  # Only active
  OPTIONAL { ?adesione osr:fine ?fine }
  FILTER(!bound(?fine))

  ?senatore foaf:firstName ?nome ;
    foaf:lastName ?cognome .
    `.trim();

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?carica',
      orderDirection: 'ASC',
    });
  }

  /**
   * Search groups by name
   */
  static searchGruppi(searchTerm: string): string {
    const select = '?gruppo ?nomeGruppo';

    const where = `
  ?gruppo a ocd:gruppoParlamentare ;
    osr:denominazione ?den .

  ?den osr:titolo ?nomeGruppo .

  FILTER(REGEX(?nomeGruppo, "${searchTerm}", "i"))

  # Only active
  OPTIONAL { ?den osr:fine ?fineDen }
  FILTER(!bound(?fineDen))
    `.trim();

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      limit: QUERY_LIMITS.default,
      orderBy: '?nomeGruppo',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get group statistics
   */
  static getStatisticheGruppi(): string {
    const select = `?gruppo ?nomeGruppo
                    (COUNT(DISTINCT ?senatore) as ?num_membri)`;

    const where = `
  ?gruppo a ocd:gruppoParlamentare ;
    osr:denominazione ?den .

  ?den osr:titolo ?nomeGruppo .

  # Only active
  OPTIONAL { ?den osr:fine ?fineDen }
  FILTER(!bound(?fineDen))

  # Count members
  OPTIONAL {
    ?senatore ocd:aderisce ?adesione .
    ?adesione osr:gruppo ?gruppo .
    OPTIONAL { ?adesione osr:fine ?fine }
    FILTER(!bound(?fine))
  }
    `.trim();

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?num_membri',
      orderDirection: 'DESC',
      distinct: false,
    }) + '\nGROUP BY ?gruppo ?nomeGruppo';
  }

  /**
   * Get senators who changed groups
   */
  static getSenatoriCambioGruppo(params: {
    dateFrom?: string;
    dateTo?: string;
  } = {}): string {
    const {
      dateFrom,
      dateTo,
    } = params;

    const select = `?senatore ?cognome ?nome
                    ?gruppoVecchio ?nomeVecchio ?fineVecchio
                    ?gruppoNuovo ?nomeNuovo ?inizioNuovo`;

    let where = `
  # Senator
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  # Old membership
  ?senatore ocd:aderisce ?adesioneVecchia .
  ?adesioneVecchia osr:gruppo ?gruppoVecchio ;
    osr:inizio ?inizioVecchio ;
    osr:fine ?fineVecchio .

  ?gruppoVecchio osr:denominazione/osr:titolo ?nomeVecchio .

  # New membership
  ?senatore ocd:aderisce ?adesioneNuova .
  ?adesioneNuova osr:gruppo ?gruppoNuovo ;
    osr:inizio ?inizioNuovo .

  ?gruppoNuovo osr:denominazione/osr:titolo ?nomeNuovo .

  # New membership started around when old one ended
  FILTER(?inizioNuovo >= ?fineVecchio)
  FILTER(?inizioNuovo < ?fineVecchio + 365) # Within a year

  # Only active new membership
  OPTIONAL { ?adesioneNuova osr:fine ?fineNuovo }
  FILTER(!bound(?fineNuovo))
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?fineVecchio)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?fineVecchio)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoGruppiQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?fineVecchio',
      orderDirection: 'DESC',
    });
  }
}
