import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { joinURL } from 'ufo'
import { z } from 'zod'

import { prompt } from '@/utils'

import { GitLabClient } from './gitlab'

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

  const gitlabClient = new GitLabClient(
    config.gitlabApiUrl,
    config.gitlabPersonalAccessToken,
  )

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

  server.tool(
    'upload_markdown_file',
    'Upload a file to GitLab project for use in Markdown content. Accepts file content as base64 data URL or plain text. Returns upload details including markdown link format.',
    {
      projectId: z
        .number()
        .int()
        .or(z.string())
        .describe(
          'ID or URL-encoded path of the project (https://docs.gitlab.com/api/rest/#namespaced-paths)',
        ),
      fileContent: z
        .string()
        .describe(
          'File content as base64 data URL (data:image/png;base64,...) or plain text',
        ),
      fileName: z
        .string()
        .describe('Name of the file to upload (e.g., image.png, document.txt)'),
    },
    async ({ fileContent, fileName, projectId }) => {
      try {
        const uploadResult = await gitlabClient.uploadMarkdownFile(
          projectId,
          fileContent,
          fileName,
        )

        return {
          content: [
            {
              type: 'text',
              text: prompt`
                File uploaded successfully!
    
                Upload Details:
                - ID: ${uploadResult.id}
                - URL: ${uploadResult.url}  
                - Full Path: ${uploadResult.full_path}
                - Markdown: ${uploadResult.markdown}
              `,
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to upload file: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        }
      }
    },
  )

  return server.server
}
