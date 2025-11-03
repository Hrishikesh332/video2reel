# API Integration Documentation

This document describes how the frontend is integrated with the backend API endpoints.

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=https://video2reel.onrender.com
```

For local development, you can use:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Service (`lib/api.ts`)

All backend API calls are centralized in the `lib/api.ts` file. This provides a clean, typed interface for all API interactions.

### Usage

```typescript
import { api } from '@/lib/api'

// Use the API methods
const videos = await api.getVideos('index_id', 1)
```

## Backend Endpoints Mapping

### ✅ Currently Integrated Endpoints

| Backend Endpoint | Frontend Usage | Page/Component |
|-----------------|----------------|----------------|
| `POST /api/videos` | `api.getVideos()` | Landing page - Load video library |
| `POST /api/workflow/select-and-process/:video_id` | `api.selectAndProcess()` | Landing page - Process selected video |
| `POST /api/workflow/upload-and-process` | `api.uploadAndProcess()` | Video page - Upload & process new video |
| `GET /api/download-reel/:filename` | `api.downloadReel()` | Generating page - Download reels |

### 📋 Available Endpoints (Not Yet Used in UI)

The following endpoints are available in the API service but not yet used in the UI. You can integrate them as needed:

#### Configuration Endpoints
- `POST /api/config/twelvelabs` - `api.setTwelveLabsConfig(apiKey)`
  - Validate and set TwelveLabs API key
- `GET /api/config/twelvelabs` - `api.getTwelveLabsConfig()`
  - Get configuration status
- `DELETE /api/config/twelvelabs` - `api.clearTwelveLabsConfig()`
  - Clear API key configuration

#### Index & Video Endpoints
- `POST /api/indexes` - `api.getIndexes()`
  - Get all available indexes
- `POST /api/video/:index_id/:video_id` - `api.getVideoDetails(indexId, videoId)`
  - Get detailed video information
- `POST /api/upload` - `api.uploadVideo(file)`
  - Upload video without processing

#### Analysis Endpoints
- `POST /api/analyze/:video_id` - `api.analyzeVideo(videoId, prompt)`
  - Analyze video with custom prompt
- `POST /api/highlights/:video_id` - `api.generateHighlights(videoId, prompt?)`
  - Generate highlights for a video
- `POST /api/transcription/:index_id/:video_id` - `api.getTranscription(indexId, videoId)`
  - Get video transcription

#### Reel Processing Endpoints
- `POST /api/process-reel` - `api.processSingleReel(params)`
  - Process a single highlight into a reel
- `POST /api/process-reels` - `api.processMultipleReels(params)`
  - Process multiple highlights into reels
- `POST /api/process-highlights-to-reels/:video_id` - `api.processHighlightsToReels(videoId, params)`
  - Complete workflow: Get highlights and process to reels

#### Health & Info
- `GET /health` - `api.healthCheck()`
  - Health check endpoint
- `GET /` - `api.getApiInfo()`
  - Get API information and available endpoints

## Usage Examples

### Example 1: Upload and Process Video

```typescript
import { api } from '@/lib/api'

const handleUpload = async (file: File) => {
  try {
    const result = await api.uploadAndProcess(file, {
      add_captions: true,
      resize_method: 'crop',
      highlight_prompt: 'Find the most engaging moments'
    })
    
    if (result.success) {
      console.log('Reels created:', result.reels)
    }
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Example 2: Get Videos from Library

```typescript
import { api } from '@/lib/api'

const fetchVideos = async () => {
  const result = await api.getVideos('your_index_id', 1)
  
  if (result.success) {
    setVideos(result.videos)
  }
}
```

### Example 3: Analyze Video

```typescript
import { api } from '@/lib/api'

const analyzeVideo = async (videoId: string) => {
  const result = await api.analyzeVideo(
    videoId,
    'What are the main topics discussed in this video?'
  )
  
  if (result.success) {
    console.log('Analysis:', result.analysis)
  }
}
```

### Example 4: Generate Highlights with Custom Prompt

```typescript
import { api } from '@/lib/api'

const getHighlights = async (videoId: string) => {
  const result = await api.generateHighlights(
    videoId,
    'Find funny moments and key insights'
  )
  
  if (result.success) {
    console.log('Highlights:', result.highlights)
  }
}
```

### Example 5: Get Video Transcription

```typescript
import { api } from '@/lib/api'

const getTranscript = async (indexId: string, videoId: string) => {
  const result = await api.getTranscription(indexId, videoId)
  
  if (result.success) {
    console.log('Captions:', result.transcription)
  }
}
```

## API Response Format

All API methods return a response object with the following structure:

```typescript
interface ApiResponse {
  success: boolean
  error?: string
  // Additional fields specific to each endpoint
}
```

## Error Handling

```typescript
try {
  const result = await api.uploadAndProcess(file)
  
  if (result.success) {
    // Handle success
  } else {
    // Handle API error
    console.error('API Error:', result.error)
  }
} catch (error) {
  // Handle network or other errors
  console.error('Request failed:', error)
}
```

## Custom API Instance

If you need a custom API instance (e.g., for different base URLs):

```typescript
import { VideoToReelAPI } from '@/lib/api'

const customApi = new VideoToReelAPI('http://localhost:5000')
customApi.setApiKey('your-api-key')

const result = await customApi.getVideos('index_id', 1)
```

## Type Safety

All API methods are fully typed with TypeScript. Your IDE will provide autocomplete and type checking:

```typescript
// TypeScript will autocomplete these parameters
await api.selectAndProcess(videoId, {
  add_captions: true,      // boolean
  resize_method: 'crop',   // 'crop' | 'pad'
  highlight_prompt: '...'  // string | undefined
})
```

## Future Enhancements

Consider adding these features:

1. **API Key Management UI**: Allow users to configure their TwelveLabs API key through the UI
2. **Advanced Video Analysis**: Add a page to analyze videos with custom prompts
3. **Custom Highlight Generation**: Let users specify custom prompts for highlight generation
4. **Transcription Viewer**: Display video transcriptions with timestamps
5. **Index Management**: Allow users to select different indexes or create new ones
6. **Progress Tracking**: Show upload and processing progress with websockets or polling
7. **Error Notifications**: Use toast notifications for better error handling

## Best Practices

1. **Always check `result.success`** before accessing response data
2. **Handle errors gracefully** with user-friendly messages
3. **Use TypeScript types** for better code quality
4. **Store API keys securely** - never commit them to version control
5. **Show loading states** during async operations
6. **Provide feedback** to users on success/failure

