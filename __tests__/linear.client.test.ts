import { LinearClient } from '../src/linear/client'
import type { Env } from '../src/types'

describe('LinearClient', () => {
  let client: LinearClient
  const mockEnv: Env = {
    LINEAR_API_KEY: 'lin_api_test_key_12345',
    WORDPRESS_REST_API_URL: 'https://example.com/wp-json/wp/v2',
    WORDPRESS_AUTH_USER: 'testuser',
    WORDPRESS_AUTH_PASSWORD: 'testpass'
  }

  beforeEach(() => {
    client = new LinearClient(mockEnv)
  })

  describe('initialization', () => {
    it('should initialize with valid API key', () => {
      expect(client).toBeDefined()
      expect(client).toBeInstanceOf(LinearClient)
    })

    it('should throw error with invalid API key', () => {
      const invalidEnv = { ...mockEnv, LINEAR_API_KEY: 'invalid_key' }
      expect(() => new LinearClient(invalidEnv)).toThrow()
    })

    it('should throw error with missing API key', () => {
      const noKeyEnv = { ...mockEnv, LINEAR_API_KEY: '' }
      expect(() => new LinearClient(noKeyEnv)).toThrow()
    })
  })

  describe('searchIssues', () => {
    it('should search issues with valid query', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            issueConnection: {
              edges: [
                {
                  node: {
                    id: 'LW-1',
                    identifier: 'LW-1',
                    title: 'Test issue',
                    description: 'Test description',
                    state: { name: 'In Progress' },
                    priority: 1,
                    estimate: 5,
                    assignee: null,
                    team: { name: 'Engineering' }
                  }
                }
              ]
            }
          }
        })
      })
      global.fetch = mockFetch

      const results = await client.searchIssues('payment')
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveProperty('title', 'Test issue')
    })

    it('should handle empty search results', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            issueConnection: { edges: [] }
          }
        })
      })
      global.fetch = mockFetch

      const results = await client.searchIssues('nonexistent')
      expect(results).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })
      global.fetch = mockFetch

      await expect(client.searchIssues('test')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch

      await expect(client.searchIssues('test')).rejects.toThrow('Network error')
    })
  })

  describe('getIssue', () => {
    it('should get issue by ID', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            issue: {
              id: 'LW-123',
              identifier: 'LW-123',
              title: 'Test issue',
              description: 'Test description',
              state: { name: 'In Progress' },
              priority: 1,
              estimate: 5,
              assignee: null,
              team: { name: 'Engineering' }
            }
          }
        })
      })
      global.fetch = mockFetch

      const issue = await client.getIssue('LW-123')
      expect(issue).toHaveProperty('id', 'LW-123')
      expect(issue).toHaveProperty('title', 'Test issue')
    })

    it('should handle not found error', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      })
      global.fetch = mockFetch

      await expect(client.getIssue('LW-999')).rejects.toThrow()
    })
  })

  describe('getTeams', () => {
    it('should get all teams', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            teams: {
              edges: [
                {
                  node: {
                    id: 'team-1',
                    name: 'Engineering',
                    key: 'ENG'
                  }
                },
                {
                  node: {
                    id: 'team-2',
                    name: 'Product',
                    key: 'PROD'
                  }
                }
              ]
            }
          }
        })
      })
      global.fetch = mockFetch

      const teams = await client.getTeams()
      expect(teams).toHaveLength(2)
      expect(teams[0]).toHaveProperty('name', 'Engineering')
      expect(teams[1]).toHaveProperty('name', 'Product')
    })

    it('should handle empty teams list', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { teams: { edges: [] } }
        })
      })
      global.fetch = mockFetch

      const teams = await client.getTeams()
      expect(teams).toHaveLength(0)
    })
  })

  describe('createIssue', () => {
    it('should create issue with required fields', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            issueCreate: {
              issue: {
                id: 'LW-456',
                identifier: 'LW-456',
                title: 'New issue',
                description: 'New description',
                state: { name: 'Backlog' },
                priority: 3,
                estimate: null,
                assignee: null,
                team: { name: 'Engineering' }
              }
            }
          }
        })
      })
      global.fetch = mockFetch

      const issue = await client.createIssue({
        title: 'New issue',
        description: 'New description',
        teamId: 'team-1'
      })
      expect(issue).toHaveProperty('title', 'New issue')
      expect(issue).toHaveProperty('state.name', 'Backlog')
    })

    it('should create issue with all fields', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            issueCreate: {
              issue: {
                id: 'LW-456',
                identifier: 'LW-456',
                title: 'New issue',
                description: 'High priority task',
                state: { name: 'Backlog' },
                priority: 1,
                estimate: 5,
                assignee: null,
                team: { name: 'Engineering' }
              }
            }
          }
        })
      })
      global.fetch = mockFetch

      const issue = await client.createIssue({
        title: 'New issue',
        description: 'High priority task',
        teamId: 'team-1',
        priority: 1,
        estimate: 5
      })
      expect(issue).toHaveProperty('priority', 1)
      expect(issue).toHaveProperty('estimate', 5)
    })

    it('should handle creation errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request' })
      })
      global.fetch = mockFetch

      await expect(
        client.createIssue({
          title: 'New issue',
          teamId: 'team-1'
        })
      ).rejects.toThrow()
    })
  })
})
