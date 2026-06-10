// @ts-nocheck - Temporary: disable type checking for Docker build compatibility

/**
 * OpenPolis MCP Tools - Export Index
 */

import { openpolisTools } from './openpolis.tools.js';
import type { MCPTool } from '../../../core/mcp/types.js';

export { openpolisTools };

export const OPENPOLIS_TOOL_COUNT = {
  total: openpolisTools.length,
};
