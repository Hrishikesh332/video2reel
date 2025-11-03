/**
 * Centralized API service for all backend endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://video2reel.onrender.com'

interface ApiResponse<T = any> {
  success: boolean
  error?: string
  [key: string]: any
}

class VideoToReelAPI {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Set TwelveLabs API key for authenticated requests
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Get TwelveLabs API key
   */
  getApiKey(): string | undefined {
    return this.apiKey
  }

  /**
   * Clear TwelveLabs API key
   */
  clearApiKey() {
    this.apiKey = undefined
  }

  // ==================== CONFIG ENDPOINTS ====================

  /**
   * Validate and set TwelveLabs API key
   */
  async setTwelveLabsConfig(apiKey: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/config/twelvelabs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: apiKey }),
    })
    const data = await response.json()
    if (data.success) {
      this.setApiKey(apiKey)
    }
    return data
  }

  /**
   * Get TwelveLabs configuration status
   */
  async getTwelveLabsConfig(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/config/twelvelabs`, {
      method: 'GET',
    })
    return response.json()
  }

  /**
   * Clear TwelveLabs API key (switch to environment key)
   */
  async clearTwelveLabsConfig(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/config/twelvelabs`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (data.success) {
      this.clearApiKey()
    }
    return data
  }

  // ==================== INDEX & VIDEO ENDPOINTS ====================

  /**
   * Get all indexes from TwelveLabs
   */
  async getIndexes(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
      }),
    })
    return response.json()
  }

  /**
   * Get videos from a specific index
   */
  async getVideos(indexId: string, page: number = 1): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        index_id: indexId,
        page,
      }),
    })
    return response.json()
  }

  /**
   * Get video details
   */
  async getVideoDetails(indexId: string, videoId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/video/${indexId}/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
      }),
    })
    return response.json()
  }

  /**
   * Upload a video file
   */
  async uploadVideo(file: File): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  }

  // ==================== ANALYSIS ENDPOINTS ====================

  /**
   * Analyze video with a custom prompt
   */
  async analyzeVideo(videoId: string, prompt: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/analyze/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        prompt,
      }),
    })
    return response.json()
  }

  /**
   * Generate highlights for a video
   */
  async generateHighlights(videoId: string, prompt?: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/highlights/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        prompt,
      }),
    })
    return response.json()
  }

  /**
   * Get video transcription
   */
  async getTranscription(indexId: string, videoId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/transcription/${indexId}/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
      }),
    })
    return response.json()
  }

  // ==================== REEL PROCESSING ENDPOINTS ====================

  /**
   * Process a single highlight into a reel
   */
  async processSingleReel(params: {
    video_url?: string
    video_path?: string
    start_time: number
    end_time: number
    captions?: Array<{ text: string; start: number; end: number }>
    resize_method?: 'crop' | 'pad'
    add_captions?: boolean
    output_filename?: string
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/process-reel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    return response.json()
  }

  /**
   * Process multiple highlights into reels
   */
  async processMultipleReels(params: {
    video_url?: string
    video_path?: string
    highlights: Array<{ start: number; end: number; title?: string }>
    captions?: Array<{ text: string; start: number; end: number }>
    resize_method?: 'crop' | 'pad'
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/process-reels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    return response.json()
  }

  /**
   * Process highlights to reels (complete workflow)
   */
  async processHighlightsToReels(
    videoId: string,
    params: {
      index_id?: string
      video_url: string
      highlight_prompt?: string
      add_captions?: boolean
      resize_method?: 'crop' | 'pad'
    }
  ): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/process-highlights-to-reels/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        ...params,
      }),
    })
    return response.json()
  }

  // ==================== WORKFLOW ENDPOINTS ====================

  /**
   * Complete workflow: Upload video and process into reels
   */
  async uploadAndProcess(
    file: File,
    options: {
      highlight_prompt?: string
      add_captions?: boolean
      resize_method?: 'crop' | 'pad'
    } = {}
  ): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options.highlight_prompt) {
      formData.append('highlight_prompt', options.highlight_prompt)
    }
    formData.append('add_captions', options.add_captions !== false ? 'true' : 'false')
    formData.append('resize_method', options.resize_method || 'crop')

    const response = await fetch(`${this.baseUrl}/api/workflow/upload-and-process`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  }

  /**
   * Complete workflow: Select video from library and process into reels
   */
  async selectAndProcess(
    videoId: string,
    options: {
      index_id?: string
      highlight_prompt?: string
      add_captions?: boolean
      resize_method?: 'crop' | 'pad'
    } = {}
  ): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/workflow/select-and-process/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        add_captions: options.add_captions !== false,
        resize_method: options.resize_method || 'crop',
        ...options,
      }),
    })
    return response.json()
  }

  // ==================== DOWNLOAD ENDPOINTS ====================

  /**
   * Get download URL for a reel
   */
  getDownloadUrl(filename: string): string {
    return `${this.baseUrl}/api/download-reel/${filename}`
  }

  /**
   * Download a reel file
   */
  downloadReel(filename: string) {
    window.open(this.getDownloadUrl(filename), '_blank')
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }

  /**
   * Get API info
   */
  async getApiInfo(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/`)
    return response.json()
  }
}

// Export singleton instance
export const api = new VideoToReelAPI()

// Export class for custom instances
export { VideoToReelAPI }

// Export types
export type { ApiResponse }

