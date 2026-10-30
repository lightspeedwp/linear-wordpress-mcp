#!/usr/bin/env node

/**
 * Linear-WordPress MCP Server
 * Enables Claude to interact with Linear issues and WordPress posts
 * Supports multiple MCPs simultaneously
 */

import {
  Server,
  type Tool,
} from "@modelcontextprotocol/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio.js";
import { LinearClient } from "./linear/client.js";
import { WordPressClient } from "./wordpress/client.js";
import { tools, getToolByName } from "./tools/index.js";
import type { Env, ToolContext } from "./types/index.js";

// Initialize MCP server
const server = new Server({
  name: "linear-wordpress-mcp",
  version: "1.0.0",
});

// Global clients (initialized with environment variables)
let linearClient: LinearClient | null = null;
let wordPressClient: WordPressClient | null = null;

// Initialize clients from environment
function initializeClients(): void {
  const env = {
    LINEAR_API_KEY: process.env.LINEAR_API_KEY || "",
    WORDPRESS_REST_API_URL: process.env.WORDPRESS_REST_API_URL || "",
    WORDPRESS_AUTH_USER: process.env.WORDPRESS_AUTH_USER || "",
    WORDPRESS_AUTH_PASSWORD: process.env.WORDPRESS_AUTH_PASSWORD || "",
  } as Env;

  try {
    if (env.LINEAR_API_KEY) {
      linearClient = new LinearClient(env);
      console.error("[MCP] Linear client initialized");
    }
  } catch (error) {
    console.error(
      "[MCP] Failed to initialize Linear client:",
      error instanceof Error ? error.message : String(error)
    );
  }

  try {
    if (
      env.WORDPRESS_REST_API_URL &&
      env.WORDPRESS_AUTH_USER &&
      env.WORDPRESS_AUTH_PASSWORD
    ) {
      wordPressClient = new WordPressClient(env);
      console.error("[MCP] WordPress client initialized");
    }
  } catch (error) {
    console.error(
      "[MCP] Failed to initialize WordPress client:",
      error instanceof Error ? error.message : String(error)
    );
  }

  if (!linearClient && !wordPressClient) {
    console.error("[MCP] Warning: No clients initialized. Set environment variables:");
    console.error("  LINEAR_API_KEY - Linear API key");
    console.error("  WORDPRESS_REST_API_URL - WordPress REST API URL");
    console.error("  WORDPRESS_AUTH_USER - WordPress username");
    console.error("  WORDPRESS_AUTH_PASSWORD - WordPress application password");
  }
}

// Convert tool definitions to MCP Tool format
function toolsToMCPTools(): Tool[] {
  return tools.map((toolDef) => ({
    name: toolDef.name,
    description: toolDef.description,
    inputSchema: toolDef.inputSchema,
  }));
}

// Handle tool calls
server.setRequestHandler(async (request) => {
  if (request.method === "tools/list") {
    return {
      tools: toolsToMCPTools(),
    };
  }

  if (request.method === "tools/call") {
    const { name, arguments: args } = request.params;
    const toolDef = getToolByName(name as string);

    if (!toolDef) {
      throw new Error(`Tool not found: ${name}`);
    }

    const context: ToolContext = {
      env: {
        LINEAR_API_KEY: process.env.LINEAR_API_KEY || "",
        WORDPRESS_REST_API_URL: process.env.WORDPRESS_REST_API_URL || "",
        WORDPRESS_AUTH_USER: process.env.WORDPRESS_AUTH_USER || "",
        WORDPRESS_AUTH_PASSWORD: process.env.WORDPRESS_AUTH_PASSWORD || "",
      },
      userEmail: process.env.USER_EMAIL,
    };

    try {
      const result = await toolDef.handler(
        args,
        linearClient,
        wordPressClient,
        context
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[MCP] Tool error in ${name}:`, errorMessage);
      throw new Error(`Tool execution failed: ${errorMessage}`);
    }
  }

  throw new Error(`Unknown method: ${request.method}`);
});

// Main server startup
async function main() {
  console.error("[MCP] Starting Linear-WordPress MCP server...");

  // Initialize clients
  initializeClients();

  // Start transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[MCP] Server connected and ready");
}

// Run server
main().catch((error) => {
  console.error("[MCP] Fatal error:", error);
  process.exit(1);
});
