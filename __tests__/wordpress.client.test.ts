import { WordPressClient } from '../src/wordpress/client'
import type { Env } from '../src/types'

describe('WordPressClient', () => {
  let client: WordPressClient
  const mockEnv: Env = {
    LINEAR_API_KEY: 'lin_api_test_key',
    WORDPRESS_REST_API_URL: 'https://example.com/wp-json/wp/v2',
    WORDPRESS_AUTH_USER: 'testuser',
    WORDPRESS_AUTH_PASSWORD: 'testpass1234'
  }

  beforeEach(() => {
    client = new WordPressClient(mockEnv)
  })

  describe('initialization', () => {
    it('should initialize with valid credentials', () => {
      expect(client).toBeDefined()
      expect(client).toBeInstanceOf(WordPressClient)
    })

    it('should throw error with missing URL', () => {
      const noUrlEnv = { ...mockEnv, WORDPRESS_REST_API_URL: '' }
      expect(() => new WordPressClient(noUrlEnv)).toThrow()
    })

    it('should throw error with missing username', () => {
      const noUserEnv = { ...mockEnv, WORDPRESS_AUTH_USER: '' }
      expect(() => new WordPressClient(noUserEnv)).toThrow()
    })

    it('should throw error with missing password', () => {
      const noPassEnv = { ...mockEnv, WORDPRESS_AUTH_PASSWORD: '' }
      expect(() => new WordPressClient(noPassEnv)).toThrow()
    })
  })

  describe('searchPosts', () => {
    it('should search posts by keyword', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            title: { rendered: 'Payment Integration' },
            content: { rendered: '<p>How to integrate payments</p>' },
            excerpt: { rendered: 'Payment guide' },
            status: 'publish',
            author: 1,
            link: 'https://example.com/payment'
          }
        ]
      })
      global.fetch = mockFetch

      const results = await client.searchPosts('payment')
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveProperty('title', 'Payment Integration')
    })

    it('should handle empty search results', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      })
      global.fetch = mockFetch

      const results = await client.searchPosts('nonexistent')
      expect(results).toHaveLength(0)
    })

    it('should search with limit parameter', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 1, title: { rendered: 'Post 1' }, content: { rendered: '' }, excerpt: { rendered: '' }, status: 'publish', author: 1, link: '' },
          { id: 2, title: { rendered: 'Post 2' }, content: { rendered: '' }, excerpt: { rendered: '' }, status: 'publish', author: 1, link: '' }
        ]
      })
      global.fetch = mockFetch

      const results = await client.searchPosts('test', 2)
      expect(mockFetch).toHaveBeenCalled()
      expect(results).toHaveLength(2)
    })

    it('should filter by status', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            title: { rendered: 'Draft Post' },
            content: { rendered: '' },
            excerpt: { rendered: '' },
            status: 'draft',
            author: 1,
            link: ''
          }
        ]
      })
      global.fetch = mockFetch

      const results = await client.searchPosts('test', 10, 'draft')
      expect(results[0]).toHaveProperty('status', 'draft')
    })

    it('should handle API errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      })
      global.fetch = mockFetch

      await expect(client.searchPosts('test')).rejects.toThrow()
    })
  })

  describe('getPost', () => {
    it('should get post by ID', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 123,
          title: { rendered: 'Test Post' },
          content: { rendered: '<p>Test content</p>' },
          excerpt: { rendered: 'Test excerpt' },
          status: 'publish',
          author: 1,
          link: 'https://example.com/test-post'
        })
      })
      global.fetch = mockFetch

      const post = await client.getPost(123)
      expect(post).toHaveProperty('id', 123)
      expect(post).toHaveProperty('title', 'Test Post')
      expect(post).toHaveProperty('status', 'publish')
    })

    it('should handle not found error', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' })
      })
      global.fetch = mockFetch

      await expect(client.getPost(999)).rejects.toThrow()
    })

    it('should handle malformed response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 123,
          title: null,
          content: null
        })
      })
      global.fetch = mockFetch

      await expect(client.getPost(123)).rejects.toThrow()
    })
  })

  describe('createPost', () => {
    it('should create post with required fields', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 456,
          title: { rendered: 'New Post' },
          content: { rendered: '<p>New content</p>' },
          excerpt: { rendered: '' },
          status: 'draft',
          author: 1,
          link: 'https://example.com/new-post'
        })
      })
      global.fetch = mockFetch

      const post = await client.createPost({
        title: 'New Post',
        content: '<p>New content</p>'
      })
      expect(post).toHaveProperty('id', 456)
      expect(post).toHaveProperty('title', 'New Post')
      expect(post).toHaveProperty('status', 'draft')
    })

    it('should create published post', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 456,
          title: { rendered: 'Published Post' },
          content: { rendered: '<p>Content</p>' },
          excerpt: { rendered: '' },
          status: 'publish',
          author: 1,
          link: 'https://example.com/published'
        })
      })
      global.fetch = mockFetch

      const post = await client.createPost({
        title: 'Published Post',
        content: '<p>Content</p>',
        status: 'publish'
      })
      expect(post).toHaveProperty('status', 'publish')
    })

    it('should create post with excerpt', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 456,
          title: { rendered: 'Post with Excerpt' },
          content: { rendered: '<p>Content</p>' },
          excerpt: { rendered: 'Summary here' },
          status: 'draft',
          author: 1,
          link: ''
        })
      })
      global.fetch = mockFetch

      const post = await client.createPost({
        title: 'Post with Excerpt',
        content: '<p>Content</p>',
        excerpt: 'Summary here'
      })
      expect(post).toHaveProperty('excerpt', 'Summary here')
    })

    it('should handle creation errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid request' })
      })
      global.fetch = mockFetch

      await expect(
        client.createPost({
          title: 'Test',
          content: ''
        })
      ).rejects.toThrow()
    })
  })

  describe('updatePostMeta', () => {
    it('should update post metadata', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          meta: {
            _linear_issue_id: 'LW-123'
          }
        })
      })
      global.fetch = mockFetch

      const result = await client.updatePostMeta(456, '_linear_issue_id', 'LW-123')
      expect(result).toHaveProperty('meta._linear_issue_id', 'LW-123')
    })

    it('should handle meta update errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' })
      })
      global.fetch = mockFetch

      await expect(
        client.updatePostMeta(456, '_linear_issue_id', 'LW-123')
      ).rejects.toThrow()
    })
  })
})
