/**
 * Types and interfaces for Linear-WordPress MCP
 */

export interface Env {
  LINEAR_API_KEY: string;
  WORDPRESS_REST_API_URL: string;
  WORDPRESS_AUTH_USER: string;
  WORDPRESS_AUTH_PASSWORD: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  teamId: string;
  assigneeId?: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
  issueCount: number;
}

export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  status: "publish" | "draft" | "pending" | "private";
  date: string;
  modified: string;
  author: number;
  excerpt?: string;
  link: string;
  type: string;
}

export interface LinkedIssuePost {
  linearIssueId: string;
  wordPressPostId: number;
  wordPressUrl: string;
  linkedAt: string;
  linkedBy: string;
}

export interface AppError {
  message: string;
  code: string;
  statusCode?: number;
  retryable?: boolean;
}

export class AppErrorImpl implements AppError {
  message: string;
  code: string;
  statusCode?: number;
  retryable?: boolean;

  constructor(
    code: string,
    message: string,
    statusCode?: number,
    retryable?: boolean
  ) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode || 500;
    this.retryable = retryable || false;
  }
}

export interface ToolContext {
  env: Env;
  userEmail?: string;
}
