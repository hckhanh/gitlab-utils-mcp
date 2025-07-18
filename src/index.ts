import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { joinURL } from 'ufo'
import { z } from 'zod'

// Define configuration schema to require configuration at connection time
export const configSchema = z.object({
  gitlabApiUrl: z
    .string()
    .nonempty()
    .default('https://gitlab.com/api/v4')
    .describe('GitLab API base URL'),
  gitlabPersonalAccessToken: z
    .string()
    .nonempty()
    .describe('GitLab personal access token for authentication'),
})

interface StatelessServerParams {
  config: z.infer<typeof configSchema>
}

export default function createStatelessServer({
  config,
}: StatelessServerParams) {
  const server = new McpServer({
    name: 'Gitlab Utils MCP Server',
    version: '0.0.1',
  })

  server.tool(
    'get_upload_file',
    'Get the uploads which are uploaded files in a project that can be referenced as links in Markdown text in an issue, merge request, snippet, or wiki page (https://docs.gitlab.com/security/user_file_uploads/)',
    {
      projectId: z
        .number()
        .int()
        .or(z.string())
        .describe(
          'ID or URL-encoded path of the project (https://docs.gitlab.com/api/rest/#namespaced-paths)',
        ),
      secret: z
        .string()
        .length(32)
        .describe('32-character secret of the upload'),
      filename: z.string().describe('Filename of the upload'),
    },
    ({ filename, projectId, secret }) => {
      const url = joinURL(
        config.gitlabApiUrl,
        'projects',
        projectId,
        'uploads',
        secret,
        filename,
        `?access_token=${config.gitlabPersonalAccessToken}`,
      )

      return { content: [{ type: 'text', text: `Image URL: ${url}` }] }
    },
  )

  return server.server
}
