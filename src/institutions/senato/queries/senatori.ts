/**
 * SPARQL Queries for Senatori (Senators)
 */

import { BaseQueryBuilder } from '../../../core/sparql/query-builder.js';
import { SENATO_PREFIXES } from '../ontology/prefixes.js';
import type { SenatoreSearchParams } from '../ontology/types.js';
import { QUERY_LIMITS, CURRENT_LEGISLATURE } from '../../../config/constants.js';

export class SenatoSenatoriQueries extends BaseQueryBuilder {
  protected getPrefixesArray(): string[] {
    return SENATO_PREFIXES;
  }

  /**
   * Get current senators (active mandates)
   */
  static getCurrentSenators(params: SenatoreSearchParams = {}): string {
    const {
      lastName,
      firstName,
      legislature = CURRENT_LEGISLATURE,
      limit = QUERY_LIMITS.members,
      offset,
    } = params;

    const select = '?senatore ?cognome ?nome ?legislatura ?inizioMandato ?tipoMandato';

    const where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:legislatura ?legislatura ;
    osr:inizio ?inizioMandato ;
    osr:tipoMandato ?tipoMandato .

  # Only active mandates (no end date)
  OPTIONAL { ?mandato osr:fine ?fineMandato }
  FILTER(!bound(?fineMandato))

  ${legislature ? `FILTER(?legislatura = ${legislature})` : ''}
  ${lastName ? `FILTER(REGEX(?cognome, "${lastName}", "i"))` : ''}
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}
    `.trim();

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }

  /**
   * Search senators by name
   */
  static searchSenators(params: SenatoreSearchParams): string {
    const {
      lastName,
      firstName,
      legislature,
      active = true,
      mandateType,
      region,
      limit = QUERY_LIMITS.default,
      offset,
    } = params;

    const select = `?senatore ?cognome ?nome ?foto ?dataNascita
                    ?legislatura ?inizioMandato ?fineMandato ?tipoMandato`;

    let where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:legislatura ?legislatura ;
    osr:inizio ?inizioMandato ;
    osr:tipoMandato ?tipoMandato .

  OPTIONAL { ?mandato osr:fine ?fineMandato }
  OPTIONAL { ?senatore foaf:depiction ?foto }
  OPTIONAL { ?senatore osr:dataNascita ?dataNascita }
    `.trim();

    const filters: string[] = [];

    if (active) {
      filters.push('FILTER(!bound(?fineMandato))');
    }

    if (legislature) {
      filters.push(`FILTER(?legislatura = ${legislature})`);
    }

    if (lastName) {
      filters.push(`FILTER(REGEX(?cognome, "${lastName}", "i"))`);
    }

    if (firstName) {
      filters.push(`FILTER(REGEX(?nome, "${firstName}", "i"))`);
    }

    if (mandateType) {
      filters.push(`FILTER(?tipoMandato = "${mandateType}")`);
    }

    if (region) {
      where += '\n  OPTIONAL { ?mandato osr:regioneElezione ?regione }';
      filters.push(`FILTER(REGEX(?regione, "${region}", "i"))`);
    }

    if (filters.length > 0) {
      where += '\n\n  ' + filters.join('\n  ');
    }

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, {
      limit,
      offset,
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get senator details (complete profile)
   */
  static getSenatoreDetails(lastName: string, firstName?: string): string {
    const select = `?senatore ?cognome ?nome ?foto ?genere
                    ?dataNascita ?cittaNascita ?provinciaNascita ?nazioneNascita
                    ?cittaResidenza ?provinciaResidenza ?nazioneResidenza`;

    let where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  FILTER(REGEX(?cognome, "${lastName}", "i"))
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}

  OPTIONAL { ?senatore foaf:depiction ?foto }
  OPTIONAL { ?senatore foaf:gender ?genere }
  OPTIONAL { ?senatore osr:dataNascita ?dataNascita }
  OPTIONAL { ?senatore osr:cittaNascita ?cittaNascita }
  OPTIONAL { ?senatore osr:provinciaNascita ?provinciaNascita }
  OPTIONAL { ?senatore osr:nazioneNascita ?nazioneNascita }
  OPTIONAL { ?senatore osr:cittaResidenza ?cittaResidenza }
  OPTIONAL { ?senatore osr:provinciaResidenza ?provinciaResidenza }
  OPTIONAL { ?senatore osr:nazioneResidenza ?nazioneResidenza }
    `.trim();

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, { limit: 10 });
  }

  /**
   * Get senator mandates (historical)
   */
  static getSenatoreMandate(lastName: string, firstName?: string): string {
    const select = `?senatore ?cognome ?nome
                    ?mandato ?legislatura ?inizioMandato ?fineMandato
                    ?tipoMandato ?dataNomina ?regioneElezione`;

    let where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  FILTER(REGEX(?cognome, "${lastName}", "i"))
  ${firstName ? `FILTER(REGEX(?nome, "${firstName}", "i"))` : ''}

  ?mandato osr:legislatura ?legislatura ;
    osr:inizio ?inizioMandato ;
    osr:tipoMandato ?tipoMandato .

  OPTIONAL { ?mandato osr:fine ?fineMandato }
  OPTIONAL { ?mandato osr:dataNomina ?dataNomina }
  OPTIONAL { ?mandato osr:regioneElezione ?regioneElezione }
    `.trim();

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?legislatura',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get life senators
   */
  static getLifeSenators(legislature?: number): string {
    const select = '?senatore ?cognome ?nome ?tipoMandato ?dataNomina';

    const where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:tipoMandato ?tipoMandato ;
    osr:legislatura ?legislatura .

  # Only life senators
  FILTER(
    ?tipoMandato = "a vita, di nomina del Presidente della Repubblica" ||
    ?tipoMandato = "di diritto e a vita, Presidente emerito della Repubblica"
  )

  OPTIONAL { ?mandato osr:dataNomina ?dataNomina }

  # Only active mandates
  OPTIONAL { ?mandato osr:fine ?fineMandato }
  FILTER(!bound(?fineMandato))

  ${legislature ? `FILTER(?legislatura = ${legislature})` : ''}
    `.trim();

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?dataNomina',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get senators by legislature
   */
  static getSenatoriByLegislature(legislature: number): string {
    const select = '?senatore ?cognome ?nome ?inizioMandato ?fineMandato ?tipoMandato';

    const where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:legislatura ${legislature} ;
    osr:inizio ?inizioMandato ;
    osr:tipoMandato ?tipoMandato .

  OPTIONAL { ?mandato osr:fine ?fineMandato }
    `.trim();

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, {
      limit: QUERY_LIMITS.members,
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }

  /**
   * Get senators by region
   */
  static getSenatoriByRegion(region: string, legislature?: number): string {
    const select = '?senatore ?cognome ?nome ?regione ?inizioMandato';

    const where = `
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:legislatura ?legislatura ;
    osr:inizio ?inizioMandato ;
    osr:regioneElezione ?regione .

  FILTER(REGEX(?regione, "${region}", "i"))
  ${legislature ? `FILTER(?legislatura = ${legislature})` : ''}

  # Only active mandates
  OPTIONAL { ?mandato osr:fine ?fineMandato }
  FILTER(!bound(?fineMandato))
    `.trim();

    const instance = new SenatoSenatoriQueries();
    return instance.buildQuery(select, where, {
      orderBy: '?cognome',
      orderDirection: 'ASC',
    });
  }
}
