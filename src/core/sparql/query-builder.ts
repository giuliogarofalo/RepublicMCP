/**
 * Base Query Builder - classe astratta per costruzione query SPARQL
 */

import type { IQueryBuilder, QueryOptions } from '../types/common.js';

/**
 * Base abstract class for SPARQL query builders
 */
export abstract class BaseQueryBuilder implements IQueryBuilder {
  /**
   * Prefissi SPARQL da includere in tutte le query
   * Le classi derivate devono definire i propri prefissi
   */
  protected abstract getPrefixesArray(): string[];

  /**
   * Ottiene i prefissi come stringa
   */
  getPrefixes(): string {
    return this.getPrefixesArray().join('\n');
  }

  /**
   * Costruisce una query SPARQL completa
   */
  buildQuery(select: string, where: string, options: QueryOptions = {}): string {
    const {
      distinct = true,
      limit,
      offset,
      orderBy,
      orderDirection = 'ASC',
      groupBy,
    } = options;

    const parts: string[] = [];

    // Prefissi
    parts.push(this.getPrefixes());
    parts.push('');

    // SELECT
    const distinctKeyword = distinct ? 'DISTINCT ' : '';
    parts.push(`SELECT ${distinctKeyword}${select}`);

    // WHERE
    parts.push('WHERE {');
    parts.push(this.indentLines(where, 2));
    parts.push('}');

    // GROUP BY
    if (groupBy) {
      parts.push(`GROUP BY ${groupBy}`);
    }

    // ORDER BY
    if (orderBy) {
      // Handle multiple variables in ORDER BY (e.g., "?cognome ?nome")
      const variables = orderBy.trim().split(/\s+/);
      if (variables.length > 1) {
        // Multiple variables: ORDER BY ?var1 ?var2
        parts.push(`ORDER BY ${orderBy}`);
      } else {
        // Single variable: ORDER BY ASC(?var) or DESC(?var)
        parts.push(`ORDER BY ${orderDirection}(${orderBy})`);
      }
    }

    // LIMIT
    if (limit !== undefined) {
      parts.push(`LIMIT ${limit}`);
    }

    // OFFSET
    if (offset !== undefined) {
      parts.push(`OFFSET ${offset}`);
    }

    return parts.join('\n');
  }

  /**
   * Costruisce una query ASK
   */
  buildAskQuery(where: string): string {
    const parts: string[] = [];

    parts.push(this.getPrefixes());
    parts.push('');
    parts.push('ASK {');
    parts.push(this.indentLines(where, 2));
    parts.push('}');

    return parts.join('\n');
  }

  /**
   * Costruisce una query CONSTRUCT
   */
  buildConstructQuery(template: string, where: string, options: QueryOptions = {}): string {
    const { limit, offset } = options;

    const parts: string[] = [];

    parts.push(this.getPrefixes());
    parts.push('');
    parts.push('CONSTRUCT {');
    parts.push(this.indentLines(template, 2));
    parts.push('} WHERE {');
    parts.push(this.indentLines(where, 2));
    parts.push('}');

    if (limit !== undefined) {
      parts.push(`LIMIT ${limit}`);
    }

    if (offset !== undefined) {
      parts.push(`OFFSET ${offset}`);
    }

    return parts.join('\n');
  }

  /**
   * Helper: indenta righe
   */
  protected indentLines(text: string, spaces: number): string {
    const indent = ' '.repeat(spaces);
    return text
      .split('\n')
      .map((line) => (line.trim() ? indent + line : line))
      .join('\n');
  }

  /**
   * Helper: costruisce filtro OPTIONAL con FILTER(!bound())
   */
  protected buildActiveFilter(variable: string, endDateProperty: string): string {
    return `
  OPTIONAL { ${variable} ${endDateProperty} ?${variable}_end }
  FILTER(!bound(?${variable}_end))
    `.trim();
  }

  /**
   * Helper: costruisce filtro data range
   */
  protected buildDateRangeFilter(
    variable: string,
    dateFrom?: string,
    dateTo?: string
  ): string {
    const filters: string[] = [];

    if (dateFrom) {
      filters.push(`FILTER(xsd:date(str(${variable})) >= xsd:date("${dateFrom}"))`);
    }

    if (dateTo) {
      filters.push(`FILTER(xsd:date(str(${variable})) <= xsd:date("${dateTo}"))`);
    }

    return filters.join('\n  ');
  }

  /**
   * Helper: costruisce filtro REGEX per ricerca testuale
   */
  protected buildRegexFilter(
    variable: string,
    value: string,
    caseInsensitive: boolean = true
  ): string {
    const flags = caseInsensitive ? ', "i"' : '';
    return `FILTER(REGEX(${variable}, "${this.escapeSparqlString(value)}"${flags}))`;
  }

  /**
   * Helper: escape stringa per SPARQL
   */
  protected escapeSparqlString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Helper: costruisce UNION di pattern multipli
   */
  protected buildUnion(patterns: string[]): string {
    return patterns
      .map((pattern, index) => {
        const prefix = index === 0 ? '' : 'UNION ';
        return `${prefix}{\n${this.indentLines(pattern, 2)}\n}`;
      })
      .join('\n');
  }

  /**
   * Helper: costruisce VALUES clause
   */
  protected buildValues(variable: string, values: string[]): string {
    const formattedValues = values.map((v) => `"${this.escapeSparqlString(v)}"`).join(' ');
    return `VALUES ${variable} { ${formattedValues} }`;
  }
}
