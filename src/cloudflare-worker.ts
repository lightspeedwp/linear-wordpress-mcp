import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { LinearClient } from './linear/client.js'
import { WordPressClient } from './wordpress/client.js'
import { tools } from './tools/index.js'
import type { Env } from './types/index.js'

// Cloudflare Workers environment type
interface CloudflareEnv {
  LINEAR_API_KEY: string
  WORDPRESS_REST_API_URL: string
  WORDPRESS_AUTH_USER: string
  WORDPRESS_AUTH_PASSWORD: string
  MCP_AUTH_TOKEN: string
  USER_EMAIL?: string
  ENVIRONMENT?: 'production' | 'staging'
}

// Timing-safe comparison for authentication tokens
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function handleRequest(request: Request, env: CloudflareEnv): Promise<Response> {
  // Only accept POST to /mcp endpoint
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  if (!url.pathname.endsWith('/mcp')) {
    return new Response('Not found', { status: 404 })
  }

  // Verify authentication token is properly configured
  if (!env.MCP_AUTH_TOKEN || env.MCP_AUTH_TOKEN.length < 32) {
    console.error('MCP_AUTH_TOKEN not configured or too short')
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Server misconfigured' },
        id: null
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Require authentication token
  const authHeader = request.headers.get('Authorization')
  const expectedAuth = `Bearer ${env.MCP_AUTH_TOKEN}`
  if (!authHeader || !timingSafeEqual(authHeader, expectedAuth)) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Unauthorized' },
        id: null
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return new Response('Content-Type must be application/json', { status: 400 })
    }

    const body = await request.json() as Record<string, unknown>

    // Validate JSON-RPC 2.0 structure
    if (!body.jsonrpc || body.jsonrpc !== '2.0') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' },
          id: body.id
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (typeof body.method !== 'string') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request: method is required' },
          id: body.id
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize clients with environment variables
    const linearClient = new LinearClient({
      LINEAR_API_KEY: env.LINEAR_API_KEY
    } as Env)

    const wordPressClient = new WordPressClient({
      WORDPRESS_REST_API_URL: env.WORDPRESS_REST_API_URL,
      WORDPRESS_AUTH_USER: env.WORDPRESS_AUTH_USER,
      WORDPRESS_AUTH_PASSWORD: env.WORDPRESS_AUTH_PASSWORD
    } as Env)

    // Create MCP server
    const server = new Server({
      name: 'linear-wordpress-mcp',
      version: '1.0.0'
    })

    // Handle different MCP methods
    const method = body.method as string
    const params = body.params as Record<string, unknown> | undefined
    const id = body.id

    let result: unknown

    if (method === 'tools/list') {
      result = {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      }
    } else if (method === 'tools/call') {
      const toolName = (params?.name as string) || ''
      const toolArgs = (params?.arguments as Record<string, unknown>) || {}

      const tool = tools.find(t => t.name === toolName)
      if (!tool) {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32601, message: `Tool not found: ${toolName}` },
            id
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Call the tool handler
      const toolResult = await tool.handler(
        toolArgs,
        linearClient,
        wordPressClient,
        {
          env: {
            LINEAR_API_KEY: env.LINEAR_API_KEY,
            WORDPRESS_REST_API_URL: env.WORDPRESS_REST_API_URL,
            USER_EMAIL: env.USER_EMAIL || 'unknown@example.com'
          } as Env,
          userEmail: env.USER_EMAIL || 'unknown@example.com'
        }
      )

      result = {
        content: [
          {
            type: 'text',
            text: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2)
          }
        ]
      }
    } else {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        result,
        id
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''

    console.error('MCP Error:', errorMessage, errorStack)

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: {
            error: errorMessage,
            environment: env.ENVIRONMENT || 'unknown'
          }
        },
        id: (typeof body === 'object' && body !== null && 'id' in body) ? (body as Record<string, unknown>).id : null
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// Cloudflare Workers handler
export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    return handleRequest(request, env)
  }
}
