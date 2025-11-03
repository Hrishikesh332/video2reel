# Backend-Frontend Integration Summary

This document provides a complete overview of how the backend API is integrated with the frontend application.

## 🎯 Integration Status: COMPLETE ✅

All backend endpoints have been successfully integrated with the frontend through a centralized API service.

## 📁 Files Structure

```
frontend/
├── lib/
│   └── api.ts                    # Centralized API service (NEW)
├── app/
│   ├── page.tsx                  # Landing page (UPDATED)
│   ├── video/
│   │   └── page.tsx             # Video preview page (UPDATED)
│   └── generating/
│       └── page.tsx             # Results page (UPDATED)
├── components/
│   └── api-examples.tsx         # Example components (NEW)
├── .env.local                    # Environment config (NEW)
└── API_INTEGRATION.md           # Integration docs (NEW)
```

## 🔗 Active Integrations

### 1. Landing Page (`app/page.tsx`)

**Endpoints Used:**
- ✅ `POST /api/videos` → `api.getVideos(indexId, page)`
  - Fetches videos from the library on component mount
  - Displays in dropdown selector

- ✅ `POST /api/workflow/select-and-process/:video_id` → `api.selectAndProcess(videoId, options)`
  - Processes selected video into reels
  - Redirects to generating page with results

**Code Example:**
```typescript
// Fetch videos
const data = await api.getVideos("6908f3065289027faefed556", 1)

// Process selected video
const data = await api.selectAndProcess(videoId, {
  add_captions: true,
  resize_method: "crop",
})
```

### 2. Video Page (`app/video/page.tsx`)

**Endpoints Used:**
- ✅ `POST /api/workflow/upload-and-process` → `api.uploadAndProcess(file, options)`
  - Uploads video file
  - Generates highlights and captions
  - Processes into reels
  - Redirects to generating page

**Code Example:**
```typescript
const data = await api.uploadAndProcess(videoFile, {
  add_captions: true,
  resize_method: "crop",
})
```

### 3. Generating Page (`app/generating/page.tsx`)

**Endpoints Used:**
- ✅ `GET /api/download-reel/:filename` → `api.downloadReel(filename)` and `api.getDownloadUrl(filename)`
  - Downloads individual reels
  - Downloads all reels at once
  - Streams video in preview player

**Code Example:**
```typescript
// Download single reel
api.downloadReel(filename)

// Get video URL for player
const videoUrl = api.getDownloadUrl(filename)
```

## 📚 Available But Not Yet Used in UI

These endpoints are fully integrated in the API service but not yet used in the UI. You can add them to new pages/features:

### Configuration
- `api.setTwelveLabsConfig(apiKey)` - Validate and set API key
- `api.getTwelveLabsConfig()` - Get config status
- `api.clearTwelveLabsConfig()` - Clear API key

### Indexes & Videos
- `api.getIndexes()` - Get all indexes
- `api.getVideoDetails(indexId, videoId)` - Get video details
- `api.uploadVideo(file)` - Upload without processing

### Analysis & Transcription
- `api.analyzeVideo(videoId, prompt)` - Analyze with custom prompt
- `api.generateHighlights(videoId, prompt?)` - Generate highlights
- `api.getTranscription(indexId, videoId)` - Get transcription

### Advanced Processing
- `api.processSingleReel(params)` - Process single highlight
- `api.processMultipleReels(params)` - Process multiple highlights
- `api.processHighlightsToReels(videoId, params)` - Highlights workflow

### Health & Info
- `api.healthCheck()` - Check API health
- `api.getApiInfo()` - Get API information

## 🔧 Configuration

### Environment Variables

Create `/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://video2reel.onrender.com
```

For local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### API Service Usage

```typescript
import { api } from '@/lib/api'

// Set API key (optional, uses environment key by default)
api.setApiKey('your-twelvelabs-api-key')

// Use any endpoint
const result = await api.getVideos(indexId, page)
```

## 🎨 User Flow

### Flow 1: Upload New Video
```
Landing Page
    ↓ [Upload button clicked]
Video Page
    ↓ [Video uploaded, Generate Reels clicked]
    ↓ api.uploadAndProcess(file)
Generating Page
    ↓ [Shows progress, then reels]
    ↓ api.downloadReel(filename)
Download Reels
```

### Flow 2: Select from Library
```
Landing Page
    ↓ [Video selected from dropdown]
    ↓ api.getVideos(indexId, page)
    ↓ api.selectAndProcess(videoId)
Generating Page
    ↓ [Shows progress, then reels]
    ↓ api.downloadReel(filename)
Download Reels
```

## 📊 Data Flow

```
Frontend (React)
    ↓
API Service (lib/api.ts)
    ↓ HTTPS
Backend (Flask)
    ↓
TwelveLabs API
    ↓
Video Processing
    ↓
Generated Reels
```

## 🛠️ How It Works

### 1. Centralized API Service
All API calls go through `/frontend/lib/api.ts`, which:
- Handles authentication (API keys)
- Constructs proper request URLs
- Manages request/response formatting
- Provides type safety with TypeScript

### 2. Environment-Based URLs
The base URL is configured via environment variables:
- Production: `https://video2reel.onrender.com`
- Development: Can be set to `http://localhost:5000`

### 3. Type Safety
All API methods are fully typed:
```typescript
interface ApiResponse {
  success: boolean
  error?: string
  [key: string]: any
}
```

### 4. Error Handling
Consistent error handling across all endpoints:
```typescript
const result = await api.uploadAndProcess(file)
if (result.success) {
  // Success path
} else {
  // Error path - result.error contains message
}
```

## 🚀 Usage Examples

See `/frontend/components/api-examples.tsx` for complete working examples:
- API Key Configuration
- Video Analysis
- Highlight Generation
- Transcription Viewer
- Index Selector
- Video Uploader
- Health Check

## 📝 Documentation

- **API Integration Guide**: `/frontend/API_INTEGRATION.md`
- **Backend API Docs**: `/backend/API_DOCUMENTATION.md`
- **Example Components**: `/frontend/components/api-examples.tsx`

## ✨ Benefits of This Integration

1. **Centralized**: All API logic in one place
2. **Type Safe**: Full TypeScript support
3. **Maintainable**: Easy to update endpoints
4. **Testable**: Can mock the API service
5. **Flexible**: Easy to add new endpoints
6. **Consistent**: Same patterns everywhere
7. **Environment-Aware**: Works in dev and prod

## 🎉 Ready to Use

The integration is complete and ready for production use. All pages are updated to use the centralized API service, and you have comprehensive documentation and examples for adding new features.

## 🔮 Future Enhancements

Consider adding:
1. API key management UI
2. Advanced video analysis page
3. Custom highlight generation
4. Transcription viewer with timeline
5. Progress tracking with websockets
6. Error toast notifications
7. Index management interface
8. Batch video processing
9. Reel preview before download
10. Custom caption styling

---

**Status**: ✅ COMPLETE AND PRODUCTION READY
**Last Updated**: November 3, 2025

