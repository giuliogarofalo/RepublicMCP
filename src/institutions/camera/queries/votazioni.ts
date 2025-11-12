/**
 * Camera dei Deputati - Voting Queries
 * Query builders for votations and vote expressions
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { VOTING_PREFIXES } from '../ontology/prefixes.js';
import type { VotazioneSearchParams, VoteStatsParams, VoteExpression } from '../ontology/types.js';

export class CameraVotazioniQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return VOTING_PREFIXES;
  }

  /**
   * Get voting records
   */
  static getVotings(params: VotazioneSearchParams = {}): string {
    const { actUri, dateFrom, dateTo, approved, finalVote, limit = 20 } = params;

    let actFilter = '';
    if (actUri) {
      actFilter = `?votazione ocd:rif_attoCamera <${actUri}> ;\n    `;
    }

    let dateFilter = '';
    if (dateFrom) {
      dateFilter += `FILTER(?data >= "${dateFrom}")\n  `;
    }
    if (dateTo) {
      dateFilter += `FILTER(?data <= "${dateTo}")\n  `;
    }

    let filters = '';
    if (approved !== undefined) {
      const approvVal = approved ? '"1"^^xsd:integer' : '"0"^^xsd:integer';
      filters += `FILTER(?approvato = ${approvVal})\n  `;
    }
    if (finalVote !== undefined) {
      const finalVal = finalVote ? '"1"^^xsd:integer' : '"0"^^xsd:integer';
      filters += `FILTER(?votazioneFinale = ${finalVal})\n  `;
    }

    const select = `
SELECT DISTINCT ?votazione ?data ?titolo ?descrizione
  ?votanti ?favorevoli ?contrari ?astenuti
  ?approvato ?votazioneFinale
    `.trim();

    const where = `
  ?votazione a ocd:votazione ;
    ${actFilter}dc:date ?data .

  OPTIONAL { ?votazione dc:title ?titolo }
  OPTIONAL { ?votazione dc:description ?descrizione }
  OPTIONAL { ?votazione ocd:votanti ?votanti }
  OPTIONAL { ?votazione ocd:favorevoli ?favorevoli }
  OPTIONAL { ?votazione ocd:contrari ?contrari }
  OPTIONAL { ?votazione ocd:astenuti ?astenuti }
  OPTIONAL { ?votazione ocd:approvato ?approvato }
  OPTIONAL { ?votazione ocd:votazioneFinale ?votazioneFinale }

  ${dateFilter}
  ${filters}
    `.trim();

    const instance = new CameraVotazioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?data)',
      limit,
    });
  }

  /**
   * Get recent votings
   */
  static getRecentVotings(params: { days?: number; limit?: number } = {}): string {
    const { days = 30, limit = 20 } = params;

    // Calculate date filter
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateFrom = date.toISOString().split('T')[0].replace(/-/g, '');

    return CameraVotazioniQueries.getVotings({ dateFrom, limit });
  }

  /**
   * Get vote expressions for a specific voting
   */
  static getVoteExpressions(params: { date: string; voteNumber: string }): string {
    const { date, voteNumber } = params;

    const select = `
SELECT DISTINCT ?votazione ?titolo ?descrizione ?numeroVotazione
  ?cognome ?nome ?espressione ?infoAssenza ?deputato
    `.trim();

    const where = `
  ?votazione a ocd:votazione ;
    dc:date '${date}' ;
    rdfs:label ?titolo ;
    dc:description ?descrizione ;
    dc:identifier ?numeroVotazione .

  FILTER(REGEX(?numeroVotazione, '${voteNumber}'))

  ?voto a ocd:voto ;
    ocd:rif_votazione ?votazione ;
    dc:type ?espressione ;
    ocd:rif_deputato ?deputato .

  OPTIONAL { ?voto dc:description ?infoAssenza }

  ?deputato foaf:surname ?cognome ;
    foaf:firstName ?nome .
    `.trim();

    const instance = new CameraVotazioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome',
    });
  }

  /**
   * Get voting details
   */
  static getVotingDetails(votingUri: string): string {
    const select = `
SELECT DISTINCT ?votazione ?titolo ?descrizione ?data ?numeroVotazione
  ?votanti ?favorevoli ?contrari ?astenuti ?approvato ?votazioneFinale
  ?attoCollegato
    `.trim();

    const where = `
  BIND(<${votingUri}> as ?votazione)

  ?votazione a ocd:votazione ;
    dc:date ?data .

  OPTIONAL { ?votazione dc:title ?titolo }
  OPTIONAL { ?votazione dc:description ?descrizione }
  OPTIONAL { ?votazione dc:identifier ?numeroVotazione }
  OPTIONAL { ?votazione ocd:votanti ?votanti }
  OPTIONAL { ?votazione ocd:favorevoli ?favorevoli }
  OPTIONAL { ?votazione ocd:contrari ?contrari }
  OPTIONAL { ?votazione ocd:astenuti ?astenuti }
  OPTIONAL { ?votazione ocd:approvato ?approvato }
  OPTIONAL { ?votazione ocd:votazioneFinale ?votazioneFinale }
  OPTIONAL { ?votazione ocd:rif_attoCamera ?attoCollegato }
    `.trim();

    const instance = new CameraVotazioniQueries();
    return instance.buildQuery(select, where);
  }

  /**
   * Get deputy's voting statistics
   */
  static getDeputyVotingStats(params: VoteStatsParams): string {
    const {
      surname,
      firstName,
      legislature = 19,
      voteType,
      dateFrom,
      dateTo,
    } = params;

    const legislatureUri = `http://dati.camera.it/ocd/legislatura.rdf/repubblica_${legislature}`;

    let nameFilter = `FILTER(REGEX(?cognome, '^${surname}', 'i'))`;
    if (firstName) {
      nameFilter += `\n  FILTER(REGEX(?nome, '^${firstName}', 'i'))`;
    }

    let dateFilter = '';
    if (dateFrom && dateTo) {
      dateFilter = `FILTER(REGEX(?date, '^${dateFrom.substring(0, 6)}', 'i'))`;
    }

    let voteTypeFilter = '';
    if (voteType) {
      voteTypeFilter = `FILTER(REGEX(?espressione, '${voteType}', 'i'))`;
    }

    const select = `
SELECT DISTINCT ?cognome ?nome ?espressione (COUNT(DISTINCT ?votazione) as ?numero)
    `.trim();

    const where = `
  ?deputato foaf:surname ?cognome ;
    foaf:firstName ?nome ;
    ocd:rif_leg <${legislatureUri}> .

  ${nameFilter}

  ?votazione a ocd:votazione ;
    dc:date ?date .

  ${dateFilter}

  ?voto a ocd:voto ;
    ocd:rif_votazione ?votazione ;
    dc:type ?espressione ;
    ocd:rif_deputato ?deputato ;
    dc:identifier ?numero .

  ${voteTypeFilter}
    `.trim();

    const instance = new CameraVotazioniQueries();
    return instance.buildQuery(select, where, {
      groupBy: '?cognome ?nome ?espressione',
      orderBy: 'DESC(?numero) ASC(?cognome) ASC(?nome)',
      limit: 1000,
    });
  }

  /**
   * Get deputy's votes in a date range
   */
  static getDeputyVotes(params: {
    surname: string;
    firstName?: string;
    legislature?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): string {
    const {
      surname,
      firstName,
      legislature = 19,
      dateFrom,
      dateTo,
      limit = 100,
    } = params;

    const legislatureUri = `http://dati.camera.it/ocd/legislatura.rdf/repubblica_${legislature}`;

    let nameFilter = `FILTER(REGEX(?cognome, '^${surname}', 'i'))`;
    if (firstName) {
      nameFilter += `\n  FILTER(REGEX(?nome, '^${firstName}', 'i'))`;
    }

    let dateFilter = '';
    if (dateFrom) {
      dateFilter += `FILTER(?data >= "${dateFrom}")\n  `;
    }
    if (dateTo) {
      dateFilter += `FILTER(?data <= "${dateTo}")\n  `;
    }

    const select = `
SELECT DISTINCT ?votazione ?data ?titoloVotazione ?espressione ?motivoAssenza
    `.trim();

    const where = `
  ?deputato foaf:surname ?cognome ;
    foaf:firstName ?nome ;
    ocd:rif_leg <${legislatureUri}> .

  ${nameFilter}

  ?voto a ocd:voto ;
    ocd:rif_votazione ?votazione ;
    dc:type ?espressione ;
    ocd:rif_deputato ?deputato .

  OPTIONAL { ?voto dc:description ?motivoAssenza }

  ?votazione dc:date ?data .
  OPTIONAL { ?votazione rdfs:label ?titoloVotazione }

  ${dateFilter}
    `.trim();

    const instance = new CameraVotazioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: 'DESC(?data)',
      limit,
    });
  }

  /**
   * Get voting participation statistics
   */
  static getVotingParticipationStats(params: {
    legislature?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {}): string {
    const { legislature = 19, dateFrom, dateTo } = params;

    let dateFilter = '';
    if (dateFrom) {
      dateFilter += `FILTER(?data >= "${dateFrom}")\n  `;
    }
    if (dateTo) {
      dateFilter += `FILTER(?data <= "${dateTo}")\n  `;
    }

    const select = `
SELECT ?data (COUNT(DISTINCT ?votazione) as ?numeroVotazioni)
  (AVG(?votanti) as ?mediaPartecipanti)
    `.trim();

    const where = `
  ?votazione a ocd:votazione ;
    dc:date ?data ;
    ocd:votanti ?votanti .

  ${dateFilter}
    `.trim();

    const instance = new CameraVotazioniQueries();
    return instance.buildQuery(select, where, {
      groupBy: '?data',
      orderBy: 'DESC(?data)',
      limit: 100,
    });
  }
}
