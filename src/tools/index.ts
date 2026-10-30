/**
 * MCP Tool definitions for Linear-WordPress integration
 */

import { z } from "zod";
import { LinearClient } from "../linear/client.js";
import { WordPressClient } from "../wordpress/client.js";
import type { ToolContext } from "../types/index.js";

// Define schemas for tool inputs
const SearchLinearIssuesSchema = z.object({
  query: z.string().describe("Search query for Linear issues"),
  team_id: z.string().optional().describe("Optional Linear team ID to filter by"),
});

const GetLinearIssueSchema = z.object({
  issue_id: z.string().describe("Linear issue ID"),
});

const GetLinearTeamsSchema = z.object({}).strict();

const SearchWordPressPostsSchema = z.object({
  query: z.string().describe("Search query for WordPress posts"),
  per_page: z.number().int().min(1).max(100).optional().default(10).describe("Number of results per page"),
});

const GetWordPressPostSchema = z.object({
  post_id: z.number().describe("WordPress post ID"),
});

const CreateWordPressPostSchema = z.object({
  title: z.string().describe("Post title"),
  content: z.string().describe("Post content (HTML or plain text)"),
  status: z.enum(["publish", "draft", "pending"]).optional().default("draft").describe("Post status"),
  excerpt: z.string().optional().describe("Post excerpt"),
});

const CreateLinearIssueSchema = z.object({
  team_id: z.string().describe("Linear team ID"),
  title: z.string().describe("Issue title"),
  description: z.string().optional().describe("Issue description"),
  priority: z.number().int().min(0).max(4).optional().describe("Issue priority (0-4)"),
});

const LinkIssueToPostSchema = z.object({
  issue_id: z.string().describe("Linear issue ID"),
  post_id: z.number().describe("WordPress post ID"),
});

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
  handler: (
    input: unknown,
    linearClient: LinearClient | null,
    wordPressClient: WordPressClient | null,
    context?: ToolContext
  ) => Promise<unknown>;
}

// Linear tools

const searchLinearIssues: ToolDefinition = {
  name: "search_linear_issues",
  description:
    "Search for Linear issues by title, description, or identifier. Returns matching issues with details.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (searches title, description, identifier)",
      },
      team_id: {
        type: "string",
        description: "Optional Linear team ID to filter results",
      },
    },
    required: ["query"],
  },
  async handler(input, linearClient) {
    if (!linearClient) throw new Error("Linear client not configured");
    const parsed = SearchLinearIssuesSchema.parse(input);
    const issues = await linearClient.searchIssues(
      parsed.query,
      parsed.team_id
    );
    return { issues };
  },
};

const getLinearIssue: ToolDefinition = {
  name: "get_linear_issue",
  description:
    "Retrieve detailed information about a specific Linear issue by ID.",
  inputSchema: {
    type: "object",
    properties: {
      issue_id: {
        type: "string",
        description: "Linear issue ID",
      },
    },
    required: ["issue_id"],
  },
  async handler(input, linearClient) {
    if (!linearClient) throw new Error("Linear client not configured");
    const parsed = GetLinearIssueSchema.parse(input);
    const issue = await linearClient.getIssue(parsed.issue_id);
    return { issue };
  },
};

const getLinearTeams: ToolDefinition = {
  name: "get_linear_teams",
  description:
    "Retrieve all teams in your Linear workspace. Returns team info including name, key, and issue count.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  async handler(input, linearClient) {
    if (!linearClient) throw new Error("Linear client not configured");
    GetLinearTeamsSchema.parse(input);
    const teams = await linearClient.getTeams();
    return { teams };
  },
};

const createLinearIssue: ToolDefinition = {
  name: "create_linear_issue",
  description:
    "Create a new issue in Linear. Requires team ID, title, and optionally description and priority.",
  inputSchema: {
    type: "object",
    properties: {
      team_id: {
        type: "string",
        description: "Linear team ID where issue will be created",
      },
      title: {
        type: "string",
        description: "Issue title",
      },
      description: {
        type: "string",
        description: "Issue description (markdown supported)",
      },
      priority: {
        type: "number",
        description: "Priority level (0=No priority, 1=Low, 2=Medium, 3=High, 4=Urgent)",
        minimum: 0,
        maximum: 4,
      },
    },
    required: ["team_id", "title"],
  },
  async handler(input, linearClient) {
    if (!linearClient) throw new Error("Linear client not configured");
    const parsed = CreateLinearIssueSchema.parse(input);
    const issue = await linearClient.createIssue(
      parsed.team_id,
      parsed.title,
      parsed.description,
      parsed.priority
    );
    return { issue };
  },
};

// WordPress tools

const searchWordPressPosts: ToolDefinition = {
  name: "search_wordpress_posts",
  description:
    "Search for WordPress posts by title, content, or excerpt. Returns matching posts with metadata.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (searches title, content, excerpt)",
      },
      per_page: {
        type: "number",
        description: "Number of results per page (1-100)",
        minimum: 1,
        maximum: 100,
        default: 10,
      },
    },
    required: ["query"],
  },
  async handler(input, _linearClient, wordPressClient) {
    if (!wordPressClient) throw new Error("WordPress client not configured");
    const parsed = SearchWordPressPostsSchema.parse(input);
    const posts = await wordPressClient.searchPosts(parsed.query);
    return { posts: posts.slice(0, parsed.per_page) };
  },
};

const getWordPressPost: ToolDefinition = {
  name: "get_wordpress_post",
  description:
    "Retrieve detailed information about a specific WordPress post by ID.",
  inputSchema: {
    type: "object",
    properties: {
      post_id: {
        type: "number",
        description: "WordPress post ID",
      },
    },
    required: ["post_id"],
  },
  async handler(input, _linearClient, wordPressClient) {
    if (!wordPressClient) throw new Error("WordPress client not configured");
    const parsed = GetWordPressPostSchema.parse(input);
    const post = await wordPressClient.getPost(parsed.post_id);
    return { post };
  },
};

const createWordPressPost: ToolDefinition = {
  name: "create_wordpress_post",
  description:
    "Create a new WordPress post. Can be published immediately or saved as draft.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Post title",
      },
      content: {
        type: "string",
        description: "Post content (HTML or plain text)",
      },
      status: {
        type: "string",
        enum: ["publish", "draft", "pending"],
        description: "Post status (default: draft)",
        default: "draft",
      },
      excerpt: {
        type: "string",
        description: "Post excerpt (optional summary)",
      },
    },
    required: ["title", "content"],
  },
  async handler(input, _linearClient, wordPressClient) {
    if (!wordPressClient) throw new Error("WordPress client not configured");
    const parsed = CreateWordPressPostSchema.parse(input);
    const post = await wordPressClient.createPost(
      parsed.title,
      parsed.content,
      parsed.status,
      parsed.excerpt
    );
    return { post };
  },
};

const linkIssueToPost: ToolDefinition = {
  name: "link_issue_to_post",
  description:
    "Link a Linear issue to a WordPress post by storing the relationship in post metadata. This creates a bidirectional link for tracking.",
  inputSchema: {
    type: "object",
    properties: {
      issue_id: {
        type: "string",
        description: "Linear issue ID",
      },
      post_id: {
        type: "number",
        description: "WordPress post ID",
      },
    },
    required: ["issue_id", "post_id"],
  },
  async handler(input, linearClient, wordPressClient) {
    if (!wordPressClient) throw new Error("WordPress client not configured");
    if (!linearClient) throw new Error("Linear client not configured");

    const parsed = LinkIssueToPostSchema.parse(input);

    // Get issue details for the link
    const issue = await linearClient.getIssue(parsed.issue_id);
    const post = await wordPressClient.getPost(parsed.post_id);

    // Store link in WordPress post metadata
    const linkData = {
      linear_issue_id: issue.id,
      linear_issue_identifier: issue.identifier,
      linear_issue_url: issue.url,
      linked_at: new Date().toISOString(),
    };

    await wordPressClient.updatePostMeta(
      parsed.post_id,
      "_linear_issue_link",
      JSON.stringify(linkData)
    );

    return {
      success: true,
      message: `Linked Linear issue ${issue.identifier} to WordPress post "${post.title}"`,
      link: {
        issue_id: issue.id,
        issue_identifier: issue.identifier,
        issue_url: issue.url,
        post_id: post.id,
        post_url: post.link,
        linked_at: linkData.linked_at,
      },
    };
  },
};

// Export all tools
export const tools: ToolDefinition[] = [
  searchLinearIssues,
  getLinearIssue,
  getLinearTeams,
  createLinearIssue,
  searchWordPressPosts,
  getWordPressPost,
  createWordPressPost,
  linkIssueToPost,
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.name === name);
}
