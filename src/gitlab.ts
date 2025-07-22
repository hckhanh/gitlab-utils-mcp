import { type $Fetch, ofetch } from 'ofetch'

export interface GitLabUploadResponse {
  alt: string
  full_path: string
  id: number
  markdown: string
  url: string
}

export class GitLabClient {
  private readonly client: $Fetch

  constructor(baseURL: string, token: string) {
    this.client = ofetch.create({
      baseURL,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async uploadMarkdownFile(
    projectId: number | string,
    fileContent: ArrayBuffer | string,
    fileName: string,
  ): Promise<GitLabUploadResponse> {
    const formData = new FormData()

    try {
      let blob: Blob
      if (typeof fileContent === 'string') {
        // Handle base64 encoded content
        if (fileContent.startsWith('data:')) {
          const response = await fetch(fileContent)
          blob = await response.blob()
        } else {
          // Handle plain text content
          blob = new Blob([fileContent], { type: 'text/plain' })
        }
      } else {
        // Handle ArrayBuffer
        blob = new Blob([fileContent])
      }

      formData.append('file', blob, fileName)

      const response = await this.client(`/projects/${projectId}/uploads`, {
        method: 'POST',
        body: formData,
      })

      return response as GitLabUploadResponse
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`)
    }
  }
}
