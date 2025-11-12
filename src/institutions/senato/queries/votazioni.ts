/**
 * SPARQL Queries for Votazioni (Voting)
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { VOTING_PREFIXES } from '../ontology/prefixes.js';
import type { VotazioneSearchParams } from '../ontology/types.js';
import { QUERY_LIMITS, CURRENT_LEGISLATURE } from '../../../config/constants.js';

export class SenatoVotazioniQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return VOTING_PREFIXES;
  }

  /**
   * Get recent votazioni (votings)
   */
  static getRecentVotazioni(params: VotazioneSearchParams = {}): string {
    const {
      legislature = CURRENT_LEGISLATURE,
      dateFrom,
      dateTo,
      esito,
      limit = QUERY_LIMITS.votings,
      offset,
    } = params;

    const select = `?votazione ?numero ?data ?oggetto ?esito
                    ?presenti ?votanti ?favorevoli ?contrari ?astenuti`;

    let where = `
  ?votazione a osr:Votazione ;
    osr:numero ?numero ;
    osr:seduta ?seduta ;
    rdfs:label ?oggetto ;
    osr:esito ?esito ;
    osr:presenti ?presenti ;
    osr:votanti ?votanti ;
    osr:favorevoli ?favorevoli ;
    osr:contrari ?contrari ;
    osr:astenuti ?astenuti .

  ?seduta osr:dataSeduta ?data ;
    osr:legislatura ${legislature} .
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?data)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?data)) <= xsd:date("${dateTo}"))`);
    }

    if (esito) {
      filters.push(`FILTER(REGEX(?esito, "${esito}", "i"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?data',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get votazione details
   */
  static getVotazioneDetails(numero: string, data: string): string {
    const select = `?votazione ?numero ?data ?oggetto ?esito ?tipoVotazione
                    ?presenti ?votanti ?favorevoli ?contrari ?astenuti
                    ?maggioranza ?numeroLegale ?presidente
                    ?numeroSeduta ?legislatura`;

    const where = `
  ?votazione a osr:Votazione ;
    osr:numero "${numero}" ;
    osr:seduta ?seduta ;
    rdfs:label ?oggetto ;
    osr:esito ?esito ;
    osr:presenti ?presenti ;
    osr:votanti ?votanti ;
    osr:favorevoli ?favorevoli ;
    osr:contrari ?contrari ;
    osr:astenuti ?astenuti ;
    osr:maggioranza ?maggioranza ;
    osr:numeroLegale ?numeroLegale .

  ?seduta osr:dataSeduta ?data ;
    osr:numeroSeduta ?numeroSeduta ;
    osr:legislatura ?legislatura .

  FILTER(xsd:date(str(?data)) = xsd:date("${data}"))

  OPTIONAL { ?votazione osr:tipoVotazione ?tipoVotazione }
  OPTIONAL { ?votazione osr:presidente ?presidente }
    `.trim();

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {});
  }

  /**
   * Get senator's vote in specific votazione
   */
  static getVotoSenatore(params: {
    lastName: string;
    firstName?: string;
    dateFrom?: string;
    dateTo?: string;
    legislature?: number;
    limit?: number;
  }): string {
    const {
      lastName,
      firstName,
      dateFrom,
      dateTo,
      legislature = CURRENT_LEGISLATURE,
      limit = QUERY_LIMITS.votings,
    } = params;

    const select = `?votazione ?data ?numero ?oggetto ?voto`;

    let where = `
  # Find senator
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  FILTER(REGEX(?cognome, "${lastName}", "i"))
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}

  # Find votazioni
  ?votazione a osr:Votazione ;
    osr:seduta ?seduta ;
    osr:numero ?numero ;
    rdfs:label ?oggetto .

  ?seduta osr:dataSeduta ?data ;
    osr:legislatura ${legislature} .

  # Determine vote type (favor, against, abstention)
  {
    ?votazione osr:favorevole ?senatore .
    BIND("Favorevole" AS ?voto)
  } UNION {
    ?votazione osr:contrario ?senatore .
    BIND("Contrario" AS ?voto)
  } UNION {
    ?votazione osr:astenuto ?senatore .
    BIND("Astenuto" AS ?voto)
  }
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?data)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?data)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {
      limit,
      orderBy: '?data',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get voting statistics for senator
   */
  static getStatisticheVotoSenatore(params: {
    lastName: string;
    firstName?: string;
    legislature?: number;
    dateFrom?: string;
    dateTo?: string;
  }): string {
    const {
      lastName,
      firstName,
      legislature = CURRENT_LEGISLATURE,
      dateFrom,
      dateTo,
    } = params;

    const select = `?senatore ?cognome ?nome
                    (COUNT(DISTINCT ?votFav) as ?voti_favorevoli)
                    (COUNT(DISTINCT ?votContr) as ?voti_contrari)
                    (COUNT(DISTINCT ?votAst) as ?voti_astenuti)`;

    let where = `
  ?senatore a osr:Senatore ;
    foaf:firstName ?nome ;
    foaf:lastName ?cognome ;
    osr:mandato ?mandato .

  ?mandato osr:legislatura ${legislature} .

  FILTER(REGEX(?cognome, "${lastName}", "i"))
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}

  # Count favor votes
  OPTIONAL {
    ?votFav a osr:Votazione ;
      osr:favorevole ?senatore ;
      osr:seduta/osr:dataSeduta ?dataFav .
    ${dateFrom ? `FILTER(xsd:date(str(?dataFav)) >= xsd:date("${dateFrom}"))` : ''}
    ${dateTo ? `FILTER(xsd:date(str(?dataFav)) <= xsd:date("${dateTo}"))` : ''}
  }

  # Count against votes
  OPTIONAL {
    ?votContr a osr:Votazione ;
      osr:contrario ?senatore ;
      osr:seduta/osr:dataSeduta ?dataContr .
    ${dateFrom ? `FILTER(xsd:date(str(?dataContr)) >= xsd:date("${dateFrom}"))` : ''}
    ${dateTo ? `FILTER(xsd:date(str(?dataContr)) <= xsd:date("${dateTo}"))` : ''}
  }

  # Count abstentions
  OPTIONAL {
    ?votAst a osr:Votazione ;
      osr:astenuto ?senatore ;
      osr:seduta/osr:dataSeduta ?dataAst .
    ${dateFrom ? `FILTER(xsd:date(str(?dataAst)) >= xsd:date("${dateFrom}"))` : ''}
    ${dateTo ? `FILTER(xsd:date(str(?dataAst)) <= xsd:date("${dateTo}"))` : ''}
  }
    `.trim();

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {}) + '\nGROUP BY ?senatore ?cognome ?nome';
  }

  /**
   * Get votazioni by outcome
   */
  static getVotazioniByEsito(esito: string, params: VotazioneSearchParams = {}): string {
    const {
      legislature = CURRENT_LEGISLATURE,
      dateFrom,
      dateTo,
      limit = QUERY_LIMITS.votings,
      offset,
    } = params;

    const select = `?votazione ?numero ?data ?oggetto
                    ?favorevoli ?contrari ?maggioranza`;

    let where = `
  ?votazione a osr:Votazione ;
    osr:numero ?numero ;
    osr:seduta ?seduta ;
    rdfs:label ?oggetto ;
    osr:esito ?esito ;
    osr:favorevoli ?favorevoli ;
    osr:contrari ?contrari ;
    osr:maggioranza ?maggioranza .

  ?seduta osr:dataSeduta ?data ;
    osr:legislatura ${legislature} .

  FILTER(REGEX(?esito, "${esito}", "i"))
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?data)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?data)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?data',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get individual votes for a specific votazione
   */
  static getVotiIndividuali(numero: string, data: string): string {
    const select = `?senatore ?cognome ?nome ?voto`;

    const where = `
  ?votazione a osr:Votazione ;
    osr:numero "${numero}" ;
    osr:seduta ?seduta .

  ?seduta osr:dataSeduta ?dataVotazione .
  FILTER(xsd:date(str(?dataVotazione)) = xsd:date("${data}"))

  # Get individual votes
  {
    ?votazione osr:favorevole ?senatore .
    BIND("Favorevole" AS ?voto)
  } UNION {
    ?votazione osr:contrario ?senatore .
    BIND("Contrario" AS ?voto)
  } UNION {
    ?votazione osr:astenuto ?senatore .
    BIND("Astenuto" AS ?voto)
  }

  ?senatore foaf:lastName ?cognome ;
    foaf:firstName ?nome .
    `.trim();

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get votazioni statistics by period
   */
  static getStatisticheVotazioni(params: {
    legislature?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {}): string {
    const {
      legislature = CURRENT_LEGISLATURE,
      dateFrom,
      dateTo,
    } = params;

    const select = `?esito (COUNT(?votazione) as ?count) (AVG(?partecipazione) as ?avg_partecipazione)`;

    let where = `
  ?votazione a osr:Votazione ;
    osr:esito ?esito ;
    osr:seduta ?seduta ;
    osr:presenti ?presenti ;
    osr:votanti ?votanti .

  ?seduta osr:dataSeduta ?data ;
    osr:legislatura ${legislature} .

  # Calculate participation rate
  BIND((?votanti * 100.0 / ?presenti) AS ?partecipazione)
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?data)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?data)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoVotazioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?count',
      orderDirection: 'DESC',
      distinct: false,
    }) + '\nGROUP BY ?esito';
  }
}
