/**
 * Linear GraphQL API client
 * Handles all interactions with Linear's API
 */

import { AppErrorImpl, type Env, type LinearIssue, type LinearTeam } from "../types/index.js";

interface LinearGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code: string } }>;
}

export class LinearClient {
  private apiKey: string;
  private baseUrl = "https://api.linear.app/graphql";

  constructor(env: Env) {
    if (!env.LINEAR_API_KEY) {
      throw new AppErrorImpl(
        "config_error",
        "LINEAR_API_KEY is not configured",
        500
      );
    }
    this.apiKey = env.LINEAR_API_KEY.trim();
  }

  private getAuthHeader(): string {
    // Support both bare API keys and Bearer tokens
    return /^bearer\s+/i.test(this.apiKey)
      ? this.apiKey.replace(/^bearer\s+/i, "Bearer ")
      : this.apiKey;
  }

  async query<T>(
    operation: string,
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          authorization: this.getAuthHeader(),
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables: variables || {},
          operationName: operation,
        }),
      });

      if (!response.ok) {
        throw new AppErrorImpl(
          "linear_upstream_error",
          `Linear returned ${response.status}`,
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data = (await response.json()) as LinearGraphQLResponse<T>;

      if (data.errors?.length) {
        throw new AppErrorImpl(
          "linear_graphql_error",
          data.errors[0].message,
          502
        );
      }

      if (data.data === undefined || data.data === null) {
        throw new AppErrorImpl(
          "linear_graphql_error",
          "Linear returned no data",
          502
        );
      }

      return data.data;
    } catch (error) {
      if (error instanceof AppErrorImpl) {
        throw error;
      }
      throw new AppErrorImpl(
        "linear_error",
        `Failed to query Linear: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  async getIssue(id: string): Promise<LinearIssue> {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          state {
            name
          }
          priority
          url
          createdAt
          updatedAt
          team {
            id
          }
          assignee {
            id
          }
        }
      }
    `;

    interface GetIssueResponse {
      issue: {
        id: string;
        identifier: string;
        title: string;
        description?: string;
        state: { name: string };
        priority: number;
        url: string;
        createdAt: string;
        updatedAt: string;
        team: { id: string };
        assignee?: { id: string };
      };
    }

    const result = await this.query<GetIssueResponse>(
      "GetIssue",
      query,
      { id }
    );

    return {
      id: result.issue.id,
      identifier: result.issue.identifier,
      title: result.issue.title,
      description: result.issue.description,
      status: result.issue.state.name,
      priority: result.issue.priority,
      url: result.issue.url,
      createdAt: result.issue.createdAt,
      updatedAt: result.issue.updatedAt,
      teamId: result.issue.team.id,
      assigneeId: result.issue.assignee?.id,
    };
  }

  async searchIssues(query: string, teamId?: string): Promise<LinearIssue[]> {
    const searchQuery = `
      query SearchIssues($filter: IssueFilter, $first: Int) {
        issues(filter: $filter, first: $first) {
          nodes {
            id
            identifier
            title
            description
            state {
              name
            }
            priority
            url
            createdAt
            updatedAt
            team {
              id
            }
            assignee {
              id
            }
          }
        }
      }
    `;

    interface SearchIssuesResponse {
      issues: {
        nodes: Array<{
          id: string;
          identifier: string;
          title: string;
          description?: string;
          state: { name: string };
          priority: number;
          url: string;
          createdAt: string;
          updatedAt: string;
          team: { id: string };
          assignee?: { id: string };
        }>;
      };
    }

    const filter: Record<string, unknown> = {
      searchableContent: { containsIgnoreCase: query },
    };

    if (teamId) {
      filter.team = { id: { eq: teamId } };
    }

    const result = await this.query<SearchIssuesResponse>(
      "SearchIssues",
      searchQuery,
      { filter, first: 50 }
    );

    return result.issues.nodes.map((issue) => ({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      status: issue.state.name,
      priority: issue.priority,
      url: issue.url,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      teamId: issue.team.id,
      assigneeId: issue.assignee?.id,
    }));
  }

  async getTeams(): Promise<LinearTeam[]> {
    const query = `
      query GetTeams {
        teams(first: 100) {
          nodes {
            id
            name
            key
            description
            issueCount
          }
        }
      }
    `;

    interface GetTeamsResponse {
      teams: {
        nodes: Array<{
          id: string;
          name: string;
          key: string;
          description?: string;
          issueCount: number;
        }>;
      };
    }

    const result = await this.query<GetTeamsResponse>(
      "GetTeams",
      query
    );

    return result.teams.nodes.map((team) => ({
      id: team.id,
      name: team.name,
      key: team.key,
      description: team.description,
      issueCount: team.issueCount,
    }));
  }

  async createIssue(
    teamId: string,
    title: string,
    description?: string,
    priority?: number
  ): Promise<LinearIssue> {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          issue {
            id
            identifier
            title
            description
            state {
              name
            }
            priority
            url
            createdAt
            updatedAt
            team {
              id
            }
            assignee {
              id
            }
          }
        }
      }
    `;

    interface CreateIssueResponse {
      issueCreate: {
        issue: {
          id: string;
          identifier: string;
          title: string;
          description?: string;
          state: { name: string };
          priority: number;
          url: string;
          createdAt: string;
          updatedAt: string;
          team: { id: string };
          assignee?: { id: string };
        };
      };
    }

    const input = {
      teamId,
      title,
      description,
      priority,
    };

    const result = await this.query<CreateIssueResponse>(
      "CreateIssue",
      mutation,
      { input }
    );

    return {
      id: result.issueCreate.issue.id,
      identifier: result.issueCreate.issue.identifier,
      title: result.issueCreate.issue.title,
      description: result.issueCreate.issue.description,
      status: result.issueCreate.issue.state.name,
      priority: result.issueCreate.issue.priority,
      url: result.issueCreate.issue.url,
      createdAt: result.issueCreate.issue.createdAt,
      updatedAt: result.issueCreate.issue.updatedAt,
      teamId: result.issueCreate.issue.team.id,
      assigneeId: result.issueCreate.issue.assignee?.id,
    };
  }
}
