/**
 * MCP Tool Types
 */

import type { Institution } from '../types/common.js';

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description: string;
  institution: Institution | 'both';
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<ToolResult>;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  content: ToolContent[];
  isError?: boolean;
}

/**
 * Tool content types
 */
export type ToolContent = TextContent | ImageContent | ResourceContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface ResourceContent {
  type: 'resource';
  resource: {
    uri: string;
    mimeType?: string;
    text?: string;
  };
}

/**
 * Tool registry interface
 */
export interface IToolRegistry {
  register(tool: MCPTool): void;
  unregister(name: string): boolean;
  get(name: string): MCPTool | undefined;
  getAll(): MCPTool[];
  getByInstitution(institution: Institution): MCPTool[];
  has(name: string): boolean;
  count(): number;
}

/**
 * Tool metadata
 */
export interface ToolMetadata {
  name: string;
  institution: Institution | 'both';
  category: string;
  version: string;
  deprecated?: boolean;
}
