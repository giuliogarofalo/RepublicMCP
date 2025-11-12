/**
 * Camera dei Deputati - SPARQL Client
 * Configured client for Camera endpoint
 */

import { SparqlClient } from '../../core/sparql/client.js';
import { INSTITUTIONS } from '../../config/endpoints.js';
import type { ISparqlClient, SparqlResult } from '../../core/types/common.js';

/**
 * Camera-specific client wrapper
 */
export class CameraClient implements ISparqlClient {
  private client: SparqlClient;
  public readonly endpoint: string;

  constructor() {
    const config = INSTITUTIONS.camera;
    this.endpoint = config.endpoint;
    this.client = new SparqlClient({ endpoint: this.endpoint });
  }

  /**
   * Execute a SELECT query
   */
  async select(query: string): Promise<SparqlResult> {
    return this.client.select(query);
  }

  /**
   * Execute a CONSTRUCT query
   */
  async construct(query: string): Promise<any> {
    return this.client.construct(query);
  }

  /**
   * Execute an ASK query
   */
  async ask(query: string): Promise<boolean> {
    return this.client.ask(query);
  }
}

/**
 * Singleton instance
 */
export const cameraClient = new CameraClient();
