/**
 * SPARQL Queries for Commissioni (Commissions)
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { SENATO_PREFIXES } from '../ontology/prefixes.js';
import type { CommissioneSearchParams } from '../ontology/types.js';
import { QUERY_LIMITS } from '../../../config/constants.js';

export class SenatoCommissioniQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return SENATO_PREFIXES;
  }

  /**
   * Get active commissions
   */
  static getCommissioniAttive(params: CommissioneSearchParams = {}): string {
    const {
      ordinale,
      limit = QUERY_LIMITS.default,
    } = params;

    const select = '?commissione ?titolo ?categoria ?ordinale ?sottotitolo';

    let where = `
  ?commissione a osr:Commissione ;
    osr:denominazione ?den .

  ?den osr:titolo ?titolo .

  # Only active denominations (no end date)
  OPTIONAL { ?den osr:fine ?fineDen }
  FILTER(!bound(?fineDen))

  OPTIONAL { ?commissione osr:categoriaCommissione ?categoria }
  OPTIONAL { ?commissione osr:ordinale ?ordinale_val }
  OPTIONAL { ?commissione osr:sottotitolo ?sottotitolo }
    `.trim();

    if (ordinale) {
      where += `\n  FILTER(?ordinale_val = "${ordinale}")`;
    }

    // Use ordinale_val in WHERE but return as ordinale in SELECT
    where = where.replace('?ordinale_val', '?ordinale');

    const instance = new SenatoCommissioniQueries();
    return instance.buildQuery(select, where, {
      limit,
      orderBy: '?ordinale',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get commission composition (members)
   */
  static getComposizioneCommissione(params: {
    ordinale?: string;
    commissioneUri?: string;
    active?: boolean;
  }): string {
    const {
      ordinale,
      commissioneUri,
      active = true,
    } = params;

    if (!ordinale && !commissioneUri) {
      throw new Error('Either ordinale or commissioneUri is required');
    }

    const select = `?commissione ?nomeCommissione
                    ?senatore ?cognome ?nome ?carica ?inizio ?fine`;

    let where = `
  # Commission
  ?commissione a osr:Commissione ;
    osr:denominazione/osr:titolo ?nomeCommissione .

  ${ordinale ? `?commissione osr:ordinale "${ordinale}" .` : ''}
  ${commissioneUri ? `FILTER(?commissione = <${commissioneUri}>)` : ''}

  # Membership (afferenza)
  ?senatore osr:afferisce ?afferenza .

  ?afferenza osr:commissione ?commissione ;
    osr:inizio ?inizio .

  OPTIONAL { ?afferenza osr:carica ?carica }
  OPTIONAL { ?afferenza osr:fine ?fine }

  # Senator info
  ?senatore foaf:firstName ?nome ;
    foaf:lastName ?cognome .
    `.trim();

    if (active) {
      where += '\n\n  # Only active memberships\n  FILTER(!bound(?fine))';
    }

    const instance = new SenatoCommissioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get senator's commissions
   */
  static getCommissioniSenatore(params: {
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
                    ?commissione ?nomeCommissione ?carica
                    ?inizio ?fine`;

    let where = `
  # Find senator
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  FILTER(REGEX(?cognome, "${lastName}", "i"))
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}

  # Find memberships
  ?senatore osr:afferisce ?afferenza .

  ?afferenza osr:commissione ?commissione ;
    osr:inizio ?inizio .

  OPTIONAL { ?afferenza osr:carica ?carica }
  OPTIONAL { ?afferenza osr:fine ?fine }

  # Commission name
  ?commissione osr:denominazione ?den .
  ?den osr:titolo ?nomeCommissione .
    `.trim();

    if (active) {
      where += '\n\n  # Only active memberships\n  FILTER(!bound(?fine))';
    }

    const instance = new SenatoCommissioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?inizio',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get commission by name (search)
   */
  static searchCommissioni(searchTerm: string): string {
    const select = '?commissione ?titolo ?categoria ?ordinale';

    const where = `
  ?commissione a osr:Commissione ;
    osr:denominazione ?den .

  ?den osr:titolo ?titolo .

  FILTER(REGEX(?titolo, "${searchTerm}", "i"))

  # Only active
  OPTIONAL { ?den osr:fine ?fineDen }
  FILTER(!bound(?fineDen))

  OPTIONAL { ?commissione osr:categoriaCommissione ?categoria }
  OPTIONAL { ?commissione osr:ordinale ?ordinale }
    `.trim();

    const instance = new SenatoCommissioniQueries();
    return instance.buildQuery(select, where, {
      limit: QUERY_LIMITS.default,
      orderBy: '?ordinale',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get commission presidents/leadership
   */
  static getLeadershipCommissione(params: {
    ordinale?: string;
    commissioneUri?: string;
  }): string {
    const {
      ordinale,
      commissioneUri,
    } = params;

    if (!ordinale && !commissioneUri) {
      throw new Error('Either ordinale or commissioneUri is required');
    }

    const select = `?commissione ?nomeCommissione
                    ?senatore ?cognome ?nome ?carica ?inizio`;

    const where = `
  ?commissione a osr:Commissione ;
    osr:denominazione/osr:titolo ?nomeCommissione .

  ${ordinale ? `?commissione osr:ordinale "${ordinale}" .` : ''}
  ${commissioneUri ? `FILTER(?commissione = <${commissioneUri}>)` : ''}

  ?senatore osr:afferisce ?afferenza .

  ?afferenza osr:commissione ?commissione ;
    osr:inizio ?inizio ;
    osr:carica ?carica .

  # Only positions (not simple members)
  FILTER(BOUND(?carica))

  # Only active
  OPTIONAL { ?afferenza osr:fine ?fine }
  FILTER(!bound(?fine))

  ?senatore foaf:firstName ?nome ;
    foaf:lastName ?cognome .
    `.trim();

    const instance = new SenatoCommissioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?carica',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get commission statistics
   */
  static getStatisticheCommissioni(): string {
    const select = `?commissione ?nomeCommissione ?ordinale
                    (COUNT(DISTINCT ?senatore) as ?num_membri)`;

    const where = `
  ?commissione a osr:Commissione ;
    osr:denominazione ?den .

  ?den osr:titolo ?nomeCommissione .

  # Only active
  OPTIONAL { ?den osr:fine ?fineDen }
  FILTER(!bound(?fineDen))

  OPTIONAL { ?commissione osr:ordinale ?ordinale }

  # Count members
  OPTIONAL {
    ?senatore osr:afferisce ?afferenza .
    ?afferenza osr:commissione ?commissione .
    OPTIONAL { ?afferenza osr:fine ?fine }
    FILTER(!bound(?fine))
  }
    `.trim();

    const instance = new SenatoCommissioniQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?ordinale',
      orderDirection: 'ASC',
      distinct: false,
    }) + '\nGROUP BY ?commissione ?nomeCommissione ?ordinale';
  }
}
