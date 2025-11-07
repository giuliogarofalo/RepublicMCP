/**
 * SPARQL Client for Camera dei Deputati endpoint
 */

// @ts-ignore - sparql-http-client doesn't have type definitions
import ParsingClient from "sparql-http-client/ParsingClient.js";
import type { SparqlResult } from "../types/ontology.js";

export class CameraSparqlClient {
  private client: ParsingClient;
  private endpoint: string;

  constructor(endpoint: string = "https://dati.camera.it/sparql") {
    this.endpoint = endpoint;
    this.client = new ParsingClient({
      endpointUrl: endpoint,
    });
  }

  /**
   * Execute a SPARQL SELECT query
   */
  async select(query: string): Promise<SparqlResult> {
    try {
      const stream = await this.client.query.select(query);
      const bindings: any[] = [];

      for await (const row of stream) {
        // Convert the row to a plain object
        const binding: any = {};
        for (const [key, value] of Object.entries(row)) {
          const term = value as any;
          binding[key] = {
            type: term.termType === "NamedNode" ? "uri" : "literal",
            value: term.value,
          };
        }
        bindings.push(binding);
      }

      // Extract variable names from the first binding or the query
      const vars = bindings.length > 0 ? Object.keys(bindings[0]) : [];

      return {
        head: { vars },
        results: { bindings },
      };
    } catch (error) {
      throw new Error(`SPARQL query failed: ${error}`);
    }
  }

  /**
   * Execute a SPARQL CONSTRUCT query
   */
  async construct(query: string): Promise<any> {
    try {
      const stream = await this.client.query.construct(query);
      const triples: any[] = [];

      for await (const quad of stream) {
        triples.push({
          subject: quad.subject.value,
          predicate: quad.predicate.value,
          object: quad.object.value,
        });
      }

      return triples;
    } catch (error) {
      throw new Error(`SPARQL CONSTRUCT query failed: ${error}`);
    }
  }

  /**
   * Execute a SPARQL ASK query
   */
  async ask(query: string): Promise<boolean> {
    try {
      const result = await this.client.query.ask(query);
      return result;
    } catch (error) {
      throw new Error(`SPARQL ASK query failed: ${error}`);
    }
  }

  /**
   * Get the endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }
}

// Singleton instance
export const cameraClient = new CameraSparqlClient();
