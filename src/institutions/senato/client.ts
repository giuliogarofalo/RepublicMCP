/**
 * Senato della Repubblica SPARQL Client
 */

import { SparqlClient } from '../../core/sparql/client.js';
import { INSTITUTIONS } from '../../config/endpoints.js';
import type { SparqlResult } from '../../core/types/common.js';

/**
 * Senato-specific SPARQL client wrapper
 */
export class SenatoClient {
  private client: SparqlClient;
  public readonly endpoint: string;
  public readonly name: string;

  constructor() {
    const config = INSTITUTIONS.senato;
    this.endpoint = config.endpoint;
    this.name = config.name;
    this.client = new SparqlClient({
      endpoint: config.endpoint,
    });
  }

  /**
   * Execute SPARQL SELECT query
   */
  async select(query: string): Promise<SparqlResult> {
    return this.client.select(query);
  }

  /**
   * Execute SPARQL ASK query
   */
  async ask(query: string): Promise<boolean> {
    return this.client.ask(query);
  }

  /**
   * Execute SPARQL CONSTRUCT query
   */
  async construct(query: string): Promise<any> {
    return this.client.construct(query);
  }

  /**
   * Get endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Get institution name
   */
  getName(): string {
    return this.name;
  }
}

/**
 * Singleton instance
 */
export const senatoClient = new SenatoClient();
