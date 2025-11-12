/**
 * Tipi comuni condivisi tra Camera e Senato
 */

/**
 * Istituzione parlamentare
 */
export type Institution = 'camera' | 'senato';

/**
 * Risultato query SPARQL generico
 */
export interface SparqlBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  datatype?: string;
  'xml:lang'?: string;
}

export interface SparqlResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: Record<string, SparqlBinding>[];
  };
}

/**
 * Parametri query comuni
 */
export interface BaseQueryParams {
  limit?: number;
  offset?: number;
}

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface LegislatureParams {
  legislature?: number | string;
}

/**
 * Risultato normalizzato (cross-istituzione)
 */
export interface NormalizedResult {
  success: boolean;
  institution: Institution;
  data: any;
  count?: number;
  error?: string;
}

/**
 * Opzioni client SPARQL
 */
export interface SparqlClientOptions {
  endpoint: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Interfaccia client SPARQL generico
 */
export interface ISparqlClient {
  readonly endpoint: string;
  select(query: string): Promise<SparqlResult>;
  ask(query: string): Promise<boolean>;
  construct?(query: string): Promise<any>;
}

/**
 * Query builder generico
 */
export interface IQueryBuilder {
  buildQuery(select: string, where: string, options?: QueryOptions): string;
  getPrefixes(): string;
}

/**
 * Opzioni costruzione query
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  distinct?: boolean;
  groupBy?: string;
}

/**
 * Metadata query
 */
export interface QueryMetadata {
  institution: Institution;
  queryType: string;
  params: Record<string, any>;
  timestamp: string;
}
