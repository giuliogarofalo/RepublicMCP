/**
 * MCP Tool Registry
 * Central registry for managing MCP tools across institutions
 */

import type { MCPTool, IToolRegistry } from './types.js';
import type { Institution } from '../types/common.js';

/**
 * Tool Registry Implementation
 * Manages registration, discovery, and filtering of MCP tools
 */
export class ToolRegistry implements IToolRegistry {
  private tools: Map<string, MCPTool>;

  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a new tool
   * @throws Error if tool with same name already exists
   */
  register(tool: MCPTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name "${tool.name}" is already registered`);
    }

    // Validate tool structure
    this.validateTool(tool);

    this.tools.set(tool.name, tool);
  }

  /**
   * Register multiple tools at once
   */
  registerMany(tools: MCPTool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Unregister a tool by name
   * @returns true if tool was found and removed, false otherwise
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a specific tool by name
   */
  get(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools for a specific institution
   */
  getByInstitution(institution: Institution): MCPTool[] {
    return this.getAll().filter(
      (tool) => tool.institution === institution || tool.institution === 'both'
    );
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get total count of registered tools
   */
  count(): number {
    return this.tools.size;
  }

  /**
   * Get count by institution
   */
  countByInstitution(institution: Institution): number {
    return this.getByInstitution(institution).length;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Get tool names grouped by institution
   */
  getToolNamesByInstitution(): Record<Institution | 'both', string[]> {
    const result: Record<Institution | 'both', string[]> = {
      camera: [],
      senato: [],
      both: [],
    };

    for (const tool of this.getAll()) {
      result[tool.institution].push(tool.name);
    }

    return result;
  }

  /**
   * Get registry statistics
   */
  getStatistics(): RegistryStatistics {
    const all = this.getAll();
    const byInstitution: Record<Institution | 'both', number> = {
      camera: 0,
      senato: 0,
      both: 0,
    };

    for (const tool of all) {
      byInstitution[tool.institution]++;
    }

    return {
      total: all.length,
      byInstitution,
      toolNames: all.map((t) => t.name),
    };
  }

  /**
   * Validate tool structure
   * @throws Error if tool is invalid
   */
  private validateTool(tool: MCPTool): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('Tool must have a valid name');
    }

    if (!tool.description || typeof tool.description !== 'string') {
      throw new Error(`Tool "${tool.name}" must have a description`);
    }

    if (!tool.institution || !['camera', 'senato', 'both'].includes(tool.institution)) {
      throw new Error(`Tool "${tool.name}" must have a valid institution (camera, senato, or both)`);
    }

    if (!tool.inputSchema || tool.inputSchema.type !== 'object') {
      throw new Error(`Tool "${tool.name}" must have a valid inputSchema with type 'object'`);
    }

    if (!tool.handler || typeof tool.handler !== 'function') {
      throw new Error(`Tool "${tool.name}" must have a handler function`);
    }
  }
}

/**
 * Registry statistics
 */
export interface RegistryStatistics {
  total: number;
  byInstitution: Record<Institution | 'both', number>;
  toolNames: string[];
}

/**
 * Global singleton registry instance
 */
export const toolRegistry = new ToolRegistry();

/**
 * Helper function to register tools from an institution module
 */
export function registerInstitutionTools(
  institution: Institution,
  tools: any[]
): void {
  const mcpTools: MCPTool[] = tools.map((tool) => ({
    ...tool,
    institution: tool.institution || institution,
  }));

  toolRegistry.registerMany(mcpTools);
}
