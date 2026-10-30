/**
 * WordPress REST API client
 * Handles all interactions with WordPress sites
 */

import { AppErrorImpl, type Env, type WordPressPost } from "../types/index.js";

export class WordPressClient {
  private baseUrl: string;
  private auth: string;

  constructor(env: Env) {
    if (!env.WORDPRESS_REST_API_URL) {
      throw new AppErrorImpl(
        "config_error",
        "WORDPRESS_REST_API_URL is not configured",
        500
      );
    }
    if (!env.WORDPRESS_AUTH_USER || !env.WORDPRESS_AUTH_PASSWORD) {
      throw new AppErrorImpl(
        "config_error",
        "WordPress authentication credentials are not configured",
        500
      );
    }

    this.baseUrl = env.WORDPRESS_REST_API_URL.replace(/\/$/, "");
    const credentials = `${env.WORDPRESS_AUTH_USER}:${env.WORDPRESS_AUTH_PASSWORD}`;
    this.auth = `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  private async fetch(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        authorization: this.auth,
        "content-type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new AppErrorImpl(
        "wordpress_error",
        `WordPress returned ${response.status}: ${errorBody}`,
        response.status
      );
    }

    return response;
  }

  async getPost(id: number): Promise<WordPressPost> {
    const response = await this.fetch(`/wp-json/wp/v2/posts/${id}`);
    const data = (await response.json()) as Record<string, unknown>;

    if ("code" in data) {
      throw new AppErrorImpl(
        "wordpress_error",
        `Post not found: ${data.message || "Unknown error"}`,
        404
      );
    }

    return this.mapWordPressPost(data);
  }

  async listPosts(
    page = 1,
    perPage = 10,
    search?: string
  ): Promise<{ posts: WordPressPost[]; total: number }> {
    let path = `/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}`;
    if (search) {
      path += `&search=${encodeURIComponent(search)}`;
    }

    const response = await this.fetch(path);
    const data = (await response.json()) as Record<string, unknown>[];

    const total = parseInt(
      response.headers.get("x-wp-total") || "0",
      10
    );

    return {
      posts: data.map((post) => this.mapWordPressPost(post)),
      total,
    };
  }

  async searchPosts(query: string): Promise<WordPressPost[]> {
    const response = await this.fetch(
      `/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=100`
    );
    const data = (await response.json()) as Record<string, unknown>[];

    return data.map((post) => this.mapWordPressPost(post));
  }

  async createPost(
    title: string,
    content: string,
    status: "publish" | "draft" | "pending" = "draft",
    excerpt?: string
  ): Promise<WordPressPost> {
    const body = {
      title,
      content,
      status,
      excerpt: excerpt || "",
    };

    const response = await this.fetch("/wp-json/wp/v2/posts", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as Record<string, unknown>;
    return this.mapWordPressPost(data);
  }

  async updatePost(
    id: number,
    updates: {
      title?: string;
      content?: string;
      status?: string;
      excerpt?: string;
    }
  ): Promise<WordPressPost> {
    const response = await this.fetch(`/wp-json/wp/v2/posts/${id}`, {
      method: "POST",
      body: JSON.stringify(updates),
    });

    const data = (await response.json()) as Record<string, unknown>;
    return this.mapWordPressPost(data);
  }

  async getPostMeta(postId: number): Promise<Record<string, unknown>> {
    const response = await this.fetch(
      `/wp-json/wp/v2/posts/${postId}/meta`
    );
    return (await response.json()) as Record<string, unknown>;
  }

  async updatePostMeta(
    postId: number,
    metaKey: string,
    metaValue: unknown
  ): Promise<void> {
    await this.fetch(`/wp-json/wp/v2/posts/${postId}/meta`, {
      method: "POST",
      body: JSON.stringify({ key: metaKey, value: metaValue }),
    });
  }

  private mapWordPressPost(data: Record<string, unknown>): WordPressPost {
    const titleData = data.title as Record<string, unknown> | undefined;
    const contentData = data.content as Record<string, unknown> | undefined;
    const excerptData = data.excerpt as Record<string, unknown> | undefined;

    return {
      id: Number(data.id),
      title: String(titleData?.rendered || ""),
      content: String(contentData?.rendered || ""),
      status: String(data.status || "draft") as "publish" | "draft" | "pending" | "private",
      date: String(data.date || ""),
      modified: String(data.modified || ""),
      author: Number(data.author || 0),
      excerpt: String(excerptData?.rendered || ""),
      link: String(data.link || ""),
      type: String(data.type || "post"),
    };
  }
}
