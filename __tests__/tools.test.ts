import { tools, getToolByName } from '../src/tools'
import type { ToolContext } from '../src/types'

describe('Tools', () => {
  let mockLinearClient: any
  let mockWordPressClient: any
  let context: ToolContext

  beforeEach(() => {
    mockLinearClient = {
      searchIssues: jest.fn(),
      getIssue: jest.fn(),
      getTeams: jest.fn(),
      createIssue: jest.fn()
    }

    mockWordPressClient = {
      searchPosts: jest.fn(),
      getPost: jest.fn(),
      createPost: jest.fn(),
      updatePostMeta: jest.fn()
    }

    context = {
      env: {
        LINEAR_API_KEY: 'test-key',
        WORDPRESS_REST_API_URL: 'https://example.com/wp-json/wp/v2',
        WORDPRESS_AUTH_USER: 'admin',
        WORDPRESS_AUTH_PASSWORD: 'pass'
      },
      userEmail: 'test@example.com'
    }
  })

  describe('tool list', () => {
    it('should have 8 tools defined', () => {
      expect(tools).toHaveLength(8)
    })

    it('should have all required tools', () => {
      const toolNames = tools.map(t => t.name)
      expect(toolNames).toContain('search_linear_issues')
      expect(toolNames).toContain('get_linear_issue')
      expect(toolNames).toContain('get_linear_teams')
      expect(toolNames).toContain('create_linear_issue')
      expect(toolNames).toContain('search_wordpress_posts')
      expect(toolNames).toContain('get_wordpress_post')
      expect(toolNames).toContain('create_wordpress_post')
      expect(toolNames).toContain('link_issue_to_post')
    })

    it('should have valid input schemas', () => {
      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined()
        expect(tool.description).toBeDefined()
        expect(typeof tool.description).toBe('string')
      })
    })
  })

  describe('getToolByName', () => {
    it('should get tool by exact name', () => {
      const tool = getToolByName('search_linear_issues')
      expect(tool).toBeDefined()
      expect(tool?.name).toBe('search_linear_issues')
    })

    it('should return undefined for unknown tool', () => {
      const tool = getToolByName('unknown_tool')
      expect(tool).toBeUndefined()
    })

    it('should get all tools by name', () => {
      const toolNames = ['search_linear_issues', 'get_linear_issue', 'get_linear_teams', 'create_linear_issue', 'search_wordpress_posts', 'get_wordpress_post', 'create_wordpress_post', 'link_issue_to_post']
      toolNames.forEach(name => {
        const tool = getToolByName(name)
        expect(tool).toBeDefined()
        expect(tool?.name).toBe(name)
      })
    })
  })

  describe('search_linear_issues', () => {
    it('should validate input schema', () => {
      const searchTool = getToolByName('search_linear_issues')!
      const validInput = { query: 'payment', limit: 10 }
      const parsed = searchTool.inputSchema.parse(validInput)
      expect(parsed).toEqual(validInput)
    })

    it('should reject empty query', () => {
      const searchTool = getToolByName('search_linear_issues')!
      expect(() => searchTool.inputSchema.parse({ query: '' })).toThrow()
    })

    it('should reject limit over 100', () => {
      const searchTool = getToolByName('search_linear_issues')!
      expect(() => searchTool.inputSchema.parse({ query: 'test', limit: 101 })).toThrow()
    })

    it('should have default limit of 10', () => {
      const searchTool = getToolByName('search_linear_issues')!
      const parsed = searchTool.inputSchema.parse({ query: 'test' })
      expect(parsed.limit).toBe(10)
    })
  })

  describe('create_linear_issue', () => {
    it('should validate required fields', () => {
      const createTool = getToolByName('create_linear_issue')!
      expect(() => createTool.inputSchema.parse({ title: 'Test' })).toThrow()
    })

    it('should accept valid input', () => {
      const createTool = getToolByName('create_linear_issue')!
      const validInput = {
        title: 'New Issue',
        team_id: 'team-1',
        description: 'Test'
      }
      const parsed = createTool.inputSchema.parse(validInput)
      expect(parsed).toHaveProperty('title')
      expect(parsed).toHaveProperty('team_id')
    })

    it('should have default priority of 3', () => {
      const createTool = getToolByName('create_linear_issue')!
      const parsed = createTool.inputSchema.parse({
        title: 'Test',
        team_id: 'team-1'
      })
      expect(parsed.priority).toBe(3)
    })
  })

  describe('search_wordpress_posts', () => {
    it('should validate input schema', () => {
      const searchTool = getToolByName('search_wordpress_posts')!
      const validInput = { keyword: 'tutorial', limit: 5 }
      const parsed = searchTool.inputSchema.parse(validInput)
      expect(parsed).toEqual(validInput)
    })

    it('should reject empty keyword', () => {
      const searchTool = getToolByName('search_wordpress_posts')!
      expect(() => searchTool.inputSchema.parse({ keyword: '' })).toThrow()
    })

    it('should have default status of publish', () => {
      const searchTool = getToolByName('search_wordpress_posts')!
      const parsed = searchTool.inputSchema.parse({ keyword: 'test' })
      expect(parsed.status).toBe('publish')
    })

    it('should validate status values', () => {
      const searchTool = getToolByName('search_wordpress_posts')!
      expect(() => searchTool.inputSchema.parse({
        keyword: 'test',
        status: 'invalid'
      })).toThrow()
    })
  })

  describe('create_wordpress_post', () => {
    it('should validate required fields', () => {
      const createTool = getToolByName('create_wordpress_post')!
      expect(() => createTool.inputSchema.parse({ title: 'Test' })).toThrow()
      expect(() => createTool.inputSchema.parse({ content: 'Content' })).toThrow()
    })

    it('should accept valid input', () => {
      const createTool = getToolByName('create_wordpress_post')!
      const validInput = {
        title: 'New Post',
        content: '<p>Content here</p>'
      }
      const parsed = createTool.inputSchema.parse(validInput)
      expect(parsed).toHaveProperty('title')
      expect(parsed).toHaveProperty('content')
    })

    it('should have default status of draft', () => {
      const createTool = getToolByName('create_wordpress_post')!
      const parsed = createTool.inputSchema.parse({
        title: 'Test',
        content: 'Content'
      })
      expect(parsed.status).toBe('draft')
    })

    it('should accept optional excerpt', () => {
      const createTool = getToolByName('create_wordpress_post')!
      const validInput = {
        title: 'Test',
        content: 'Content',
        excerpt: 'Short summary'
      }
      const parsed = createTool.inputSchema.parse(validInput)
      expect(parsed).toHaveProperty('excerpt', 'Short summary')
    })
  })

  describe('link_issue_to_post', () => {
    it('should validate required fields', () => {
      const linkTool = getToolByName('link_issue_to_post')!
      expect(() => linkTool.inputSchema.parse({ issue_id: 'LW-1' })).toThrow()
      expect(() => linkTool.inputSchema.parse({ post_id: 1 })).toThrow()
    })

    it('should accept valid input', () => {
      const linkTool = getToolByName('link_issue_to_post')!
      const validInput = {
        issue_id: 'LW-123',
        post_id: 456
      }
      const parsed = linkTool.inputSchema.parse(validInput)
      expect(parsed).toEqual(validInput)
    })

    it('should validate issue_id format', () => {
      const linkTool = getToolByName('link_issue_to_post')!
      expect(() => linkTool.inputSchema.parse({
        issue_id: 'invalid',
        post_id: 1
      })).toThrow()
    })

    it('should validate post_id is number', () => {
      const linkTool = getToolByName('link_issue_to_post')!
      expect(() => linkTool.inputSchema.parse({
        issue_id: 'LW-123',
        post_id: 'not-a-number'
      })).toThrow()
    })
  })

  describe('tool descriptions', () => {
    it('should have non-empty descriptions', () => {
      tools.forEach(tool => {
        expect(tool.description).toBeTruthy()
        expect(tool.description.length).toBeGreaterThan(0)
      })
    })

    it('should have descriptions that start with action verb', () => {
      const actionVerbs = ['Search', 'Get', 'Create', 'Link', 'Update', 'Delete', 'List']
      tools.forEach(tool => {
        const startsWithAction = actionVerbs.some(verb =>
          tool.description.startsWith(verb)
        )
        expect(startsWithAction).toBe(true)
      })
    })
  })
})
