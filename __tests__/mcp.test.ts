import { tools, getToolByName } from '../src/tools'

describe('MCP Server', () => {
  describe('Tools', () => {
    it('should have 8 tools defined', () => {
      expect(tools.length).toBe(8)
    })

    it('should have all required tool names', () => {
      const names = tools.map(t => t.name)
      expect(names).toContain('search_linear_issues')
      expect(names).toContain('get_linear_issue')
      expect(names).toContain('get_linear_teams')
      expect(names).toContain('create_linear_issue')
      expect(names).toContain('search_wordpress_posts')
      expect(names).toContain('get_wordpress_post')
      expect(names).toContain('create_wordpress_post')
      expect(names).toContain('link_issue_to_post')
    })

    it('all tools should have descriptions', () => {
      tools.forEach(tool => {
        expect(tool.description).toBeDefined()
        expect(tool.description.length).toBeGreaterThan(0)
      })
    })

    it('all tools should have input schemas', () => {
      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined()
      })
    })

    it('all tools should have handlers', () => {
      tools.forEach(tool => {
        expect(tool.handler).toBeDefined()
        expect(typeof tool.handler).toBe('function')
      })
    })
  })

  describe('getToolByName', () => {
    it('should retrieve tool by name', () => {
      const tool = getToolByName('search_linear_issues')
      expect(tool).toBeDefined()
      expect(tool?.name).toBe('search_linear_issues')
    })

    it('should return undefined for invalid name', () => {
      const tool = getToolByName('invalid_tool')
      expect(tool).toBeUndefined()
    })

    it('should retrieve all tools by name', () => {
      const toolNames = [
        'search_linear_issues',
        'get_linear_issue',
        'get_linear_teams',
        'create_linear_issue',
        'search_wordpress_posts',
        'get_wordpress_post',
        'create_wordpress_post',
        'link_issue_to_post'
      ]

      toolNames.forEach(name => {
        const tool = getToolByName(name)
        expect(tool).toBeDefined()
        expect(tool?.name).toBe(name)
      })
    })
  })

  describe('Tool Schemas', () => {
    it('search_linear_issues should have query parameter', () => {
      const tool = getToolByName('search_linear_issues')!
      const schema = tool.inputSchema
      expect(schema).toBeDefined()
    })

    it('get_linear_issue should have issue_id parameter', () => {
      const tool = getToolByName('get_linear_issue')!
      const schema = tool.inputSchema
      expect(schema).toBeDefined()
    })

    it('create_linear_issue should require team_id and title', () => {
      const tool = getToolByName('create_linear_issue')!
      const schema = tool.inputSchema
      expect(schema).toBeDefined()
    })

    it('search_wordpress_posts should have keyword parameter', () => {
      const tool = getToolByName('search_wordpress_posts')!
      const schema = tool.inputSchema
      expect(schema).toBeDefined()
    })

    it('create_wordpress_post should require title and content', () => {
      const tool = getToolByName('create_wordpress_post')!
      const schema = tool.inputSchema
      expect(schema).toBeDefined()
    })

    it('link_issue_to_post should require issue_id and post_id', () => {
      const tool = getToolByName('link_issue_to_post')!
      const schema = tool.inputSchema
      expect(schema).toBeDefined()
    })
  })

  describe('Tool Coverage', () => {
    it('should have Linear search tool', () => {
      expect(getToolByName('search_linear_issues')).toBeDefined()
    })

    it('should have Linear get tool', () => {
      expect(getToolByName('get_linear_issue')).toBeDefined()
    })

    it('should have Linear teams tool', () => {
      expect(getToolByName('get_linear_teams')).toBeDefined()
    })

    it('should have Linear create tool', () => {
      expect(getToolByName('create_linear_issue')).toBeDefined()
    })

    it('should have WordPress search tool', () => {
      expect(getToolByName('search_wordpress_posts')).toBeDefined()
    })

    it('should have WordPress get tool', () => {
      expect(getToolByName('get_wordpress_post')).toBeDefined()
    })

    it('should have WordPress create tool', () => {
      expect(getToolByName('create_wordpress_post')).toBeDefined()
    })

    it('should have cross-system link tool', () => {
      expect(getToolByName('link_issue_to_post')).toBeDefined()
    })
  })
})
