/**
 * SPARQL Queries for DDL (Disegni di Legge - Bills)
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { DDL_PREFIXES } from '../ontology/prefixes.js';
import type { DdlSearchParams } from '../ontology/types.js';
import { QUERY_LIMITS, CURRENT_LEGISLATURE_START } from '../../../config/constants.js';

export class SenatoDdlQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return DDL_PREFIXES;
  }

  /**
   * Get recent DDL (bills)
   */
  static getRecentDdl(params: DdlSearchParams = {}): string {
    const {
      legislature,
      stato,
      ramo = 'Senato',
      dateFrom = CURRENT_LEGISLATURE_START,
      dateTo,
      limit = QUERY_LIMITS.acts,
      offset,
    } = params;

    const select = `?ddl ?idDdl ?titolo ?titoloBreve
                    ?dataPres ?stato ?dataStato ?ramo ?legislatura`;

    let where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ?idDdl ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato ;
    osr:dataStatoDdl ?dataStato ;
    osr:ramo ?ramo ;
    osr:legislatura ?legislatura .

  OPTIONAL { ?ddl osr:titoloBreve ?titoloBreve }
    `.trim();

    const filters: string[] = [];

    if (ramo) {
      filters.push(`FILTER(?ramo = "${ramo}")`);
    }

    if (stato) {
      filters.push(`FILTER(REGEX(?stato, "${stato}", "i"))`);
    }

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?dataPres)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?dataPres)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?dataPres',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get DDL by senator (as sponsor/signatory)
   */
  static getDdlBySenatore(params: DdlSearchParams): string {
    const {
      sponsorLastName,
      sponsorFirstName,
      firstSignerOnly = false,
      legislature,
      dateFrom,
      dateTo,
      limit = QUERY_LIMITS.acts,
      offset,
    } = params;

    if (!sponsorLastName) {
      throw new Error('sponsorLastName is required');
    }

    const select = `?ddl ?titolo ?titoloBreve ?dataPres ?stato
                    ?senatore ?cognome ?nome ?primoFirmatario`;

    let where = `
  # Find senator
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  FILTER(REGEX(?cognome, "${sponsorLastName}", "i"))
  ${sponsorFirstName ? `FILTER(REGEX(?nome, "${sponsorFirstName}", "i"))` : ''}

  # Find initiatives
  ?iniziativa osr:presentatore ?senatore .
  ${firstSignerOnly ? '?iniziativa osr:primoFirmatario true .' : ''}

  OPTIONAL { ?iniziativa osr:primoFirmatario ?primoFirmatario }

  # Find DDL
  ?ddl a osr:Ddl ;
    osr:iniziativa ?iniziativa ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato .

  OPTIONAL { ?ddl osr:titoloBreve ?titoloBreve }
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?dataPres)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?dataPres)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?dataPres',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get DDL by status
   */
  static getDdlByStato(stato: string, params: DdlSearchParams = {}): string {
    const {
      ramo = 'Senato',
      dateFrom = CURRENT_LEGISLATURE_START,
      dateTo,
      limit = QUERY_LIMITS.acts,
      offset,
    } = params;

    const select = `?ddl ?idDdl ?titolo ?dataPres ?dataStato ?ramo`;

    let where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ?idDdl ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato ;
    osr:dataStatoDdl ?dataStato ;
    osr:ramo ?ramo .

  FILTER(REGEX(?stato, "${stato}", "i"))
  FILTER(?ramo = "${ramo}")
    `.trim();

    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(?dataPres)) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(?dataPres)) <= xsd:date("${dateTo}"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?dataStato',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get DDL with complete iteration (iter)
   */
  static getDdlWithIter(idDdl: number): string {
    const select = `?ddl ?titolo ?dataPres ?stato
                    ?iter ?progrIter ?numeroFase ?statoFase ?dataStatoFase`;

    const where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ${idDdl} ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato ;
    osr:iter ?iter .

  ?iter osr:idDdl ${idDdl} ;
    osr:fase ?faseIter .

  ?faseIter osr:progrIter ?progrIter ;
    osr:ddl ?faseDdl .

  ?faseDdl osr:numeroFase ?numeroFase ;
    osr:statoDdl ?statoFase ;
    osr:dataStatoDdl ?dataStatoFase .
    `.trim();

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?progrIter',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get DDL with sponsors (iniziative)
   */
  static getDdlWithSponsors(idDdl: number): string {
    const select = `?ddl ?titolo
                    ?senatore ?cognome ?nome ?primoFirmatario
                    ?dataAggiunta ?dataRitiro`;

    const where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ${idDdl} ;
    osr:titolo ?titolo ;
    osr:iniziativa ?iniziativa .

  ?iniziativa osr:presentatore ?senatore .

  ?senatore foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  OPTIONAL { ?iniziativa osr:primoFirmatario ?primoFirmatario }
  OPTIONAL { ?iniziativa osr:dataAggiuntaFirma ?dataAggiunta }
  OPTIONAL { ?iniziativa osr:dataRitiroFirma ?dataRitiro }
    `.trim();

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?primoFirmatario',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get DDL details (complete)
   */
  static getDdlDetails(idDdl: number): string {
    const select = `?ddl ?idDdl ?idFase ?ramo ?legislatura
                    ?numeroFase ?numeroFaseCompatto
                    ?titolo ?titoloBreve ?natura
                    ?presentatoTrasmesso ?dataPres
                    ?stato ?dataStato
                    ?testoPresentato ?testoApprovato`;

    const where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ${idDdl} ;
    osr:idDdl ?idDdl ;
    osr:idFase ?idFase ;
    osr:ramo ?ramo ;
    osr:legislatura ?legislatura ;
    osr:numeroFase ?numeroFase ;
    osr:titolo ?titolo ;
    osr:presentatoTrasmesso ?presentatoTrasmesso ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato ;
    osr:dataStatoDdl ?dataStato .

  OPTIONAL { ?ddl osr:numeroFaseCompatto ?numeroFaseCompatto }
  OPTIONAL { ?ddl osr:titoloBreve ?titoloBreve }
  OPTIONAL { ?ddl osr:natura ?natura }
  OPTIONAL { ?ddl osr:testoPresentato ?testoPresentato }
  OPTIONAL { ?ddl osr:testoApprovato ?testoApprovato }
    `.trim();

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {});
  }

  /**
   * Search DDL by title
   */
  static searchDdlByTitle(searchTerm: string, params: DdlSearchParams = {}): string {
    const {
      ramo = 'Senato',
      dateFrom = CURRENT_LEGISLATURE_START,
      limit = QUERY_LIMITS.acts,
      offset,
    } = params;

    const select = '?ddl ?idDdl ?titolo ?titoloBreve ?dataPres ?stato';

    let where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ?idDdl ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato ;
    osr:ramo ?ramo .

  OPTIONAL { ?ddl osr:titoloBreve ?titoloBreve }

  # Search in title or short title
  FILTER(
    REGEX(?titolo, "${searchTerm}", "i") ||
    REGEX(?titoloBreve, "${searchTerm}", "i")
  )

  FILTER(?ramo = "${ramo}")
  FILTER(xsd:date(str(?dataPres)) >= xsd:date("${dateFrom}"))
    `.trim();

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?dataPres',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get DDL with assignments (assegnazioni)
   */
  static getDdlWithAssignments(idDdl: number): string {
    const select = `?ddl ?titolo
                    ?assegnazione ?commissione ?nomeCommissione ?dataAssegnazione`;

    const where = `
  ?ddl a osr:Ddl ;
    osr:idDdl ${idDdl} ;
    osr:titolo ?titolo ;
    osr:assegnazione ?assegnazione .

  ?assegnazione osr:commissione ?commissione .

  OPTIONAL { ?assegnazione osr:dataAssegnazione ?dataAssegnazione }

  ?commissione osr:denominazione ?den .
  ?den osr:titolo ?nomeCommissione .
    `.trim();

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?dataAssegnazione',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get DDL statistics by legislature
   */
  static getDdlStatistics(legislature?: string): string {
    const select = `?stato (COUNT(?ddl) as ?count)`;

    let where = `
  ?ddl a osr:Ddl ;
    osr:statoDdl ?stato ;
    osr:ramo "Senato" .

  ${legislature ? `?ddl osr:legislatura "${legislature}" .` : ''}
    `.trim();

    const instance = new SenatoDdlQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?count',
      orderDirection: 'DESC',
      distinct: false, // Need grouping
    }) + '\nGROUP BY ?stato';
  }
}
