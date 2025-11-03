# Video2Reel API Documentation

## Overview
The Video2Reel API provides endpoints to upload videos, generate highlights using TwelveLabs AI, and automatically create portrait-format reels with captions.

**Version:** 3.0.0  
**Base URL:** `https://video2reel.onrender.com`

### Key Features
- 🎥 **Automatic video processing** - Upload and get reels back automatically
- 🤖 **AI-powered highlights** - Uses TwelveLabs to find the best moments
- 📱 **Portrait format** - Optimized 9:16 format for social media
- 💬 **Synchronized captions** - Modern styled captions synced with speech
- 🔐 **Secure** - API keys stored server-side, not exposed to frontend

---

## Authentication
The API uses environment variables for authentication. Set these on your server:

```bash
TWELVELABS_API_KEY=your_twelvelabs_api_key_here
TWELVELABS_INDEX_ID=your_default_index_id_here
```

**✅ Simplified for Frontend:** No API keys or index IDs need to be passed in requests - everything is configured server-side for security and simplicity.

---

## Quick Start

### For Frontend Developers
The simplest way to use this API:

1. **Upload a video and get reels:**
   ```javascript
   const formData = new FormData();
   formData.append('file', videoFile);
   
   const response = await fetch('/api/workflow/upload-and-process', {
     method: 'POST',
     body: formData
   });
   
   const data = await response.json();
   // data.reels contains download URLs for all generated reels
   ```

2. **That's it!** The API handles:
   - Video indexing
   - AI highlight generation
   - Transcription and captions
   - Portrait format conversion
   - Video processing

---

## Endpoints

### 1. Health Check

#### `GET /health`

Check if the API is running.

**Input:** None

**Output:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T10:30:00.000Z",
  "message": "Video2Reel API is running",
  "version": "1.0.1"
}
```

---

### 2. API Information

#### `GET /`

Get API information and available endpoints.

**Input:** None

**Output:**
```json
{
  "status": "healthy",
  "message": "Video2Reel API",
  "version": "3.0.0",
  "workflows": {
    "upload_and_process": {
      "endpoint": "POST /api/workflow/upload-and-process",
      "description": "Complete workflow: Upload video → Index → Generate highlights → Get transcripts → Cut videos → Portrait format → Add captions"
    },
    "select_and_process": {
      "endpoint": "POST /api/workflow/select-and-process/<video_id>",
      "description": "Complete workflow: Select video from index → Generate highlights → Get transcripts → Cut videos → Portrait format → Add captions"
    }
  },
  "endpoints": { ... }
}
```

---

## Video Management

### 3. Get Indexes

#### `POST /api/indexes`

Retrieve all available TwelveLabs video indexes.

**Input:** None (or empty JSON object `{}`)

**Output:**
```json
{
  "success": true,
  "indexes": [
    {
      "id": "index_123",
      "name": "My Video Index",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 4. Get Videos from Index

#### `POST /api/videos`

Retrieve videos from a specific index.

**Input:**
```json
{
  "index_id": "index_123",
  "page": 1
}
```
*Note: If `index_id` is not provided, uses the default index from environment*

**Output:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video_456",
      "filename": "my_video.mp4",
      "duration": 120.5,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "page": 1
}
```

---

### 5. Upload Video

#### `POST /api/upload`

Upload and index a video file to the default index.

**Input:** `multipart/form-data`
- `file`: Video file (required)

**Output:**
```json
{
  "success": true,
  "video_id": "video_789",
  "task_id": "task_123",
  "status": "ready",
  "message": "Video indexed successfully with ID: video_789"
}
```

---

### 6. Get Video Details

#### `POST /api/video/<index_id>/<video_id>`

Get detailed information about a specific video.

**Input:** None (or empty JSON object `{}`)

**Output:**
```json
{
  "success": true,
  "video_details": {
    "id": "video_456",
    "metadata": {
      "filename": "my_video.mp4",
      "duration": 120.5
    },
    "hls": {
      "video_url": "https://example.com/video.m3u8"
    }
  }
}
```

---

## Video Analysis

### 7. Analyze Video

#### `POST /api/analyze/<video_id>`

Analyze a video with a custom prompt.

**Input:**
```json
{
  "prompt": "What are the main topics discussed in this video?"
}
```

**Output:**
```json
{
  "success": true,
  "analysis": "The video discusses product features, pricing, and customer testimonials..."
}
```

---

### 8. Generate Highlights

#### `POST /api/highlights/<video_id>`

Generate AI-powered highlights from a video.

**Input:**
```json
{
  "prompt": "Generate highlights for social media"
}
```
*Note: `prompt` is optional. You can send an empty JSON object `{}` to use default highlight generation.*

**Output:**
```json
{
  "success": true,
  "highlights": [
    {
      "title": "Introduction to FundFlow Website",
      "start": 0.0,
      "end": 15.5
    },
    {
      "title": "Creating a New Circle",
      "start": 20.0,
      "end": 35.8
    }
  ]
}
```

---

### 9. Get Video Transcription

#### `POST /api/transcription/<index_id>/<video_id>`

Get timestamped transcription for a video.

**Input:** None (or empty JSON object `{}`)

**Output:**
```json
{
  "success": true,
  "transcription": [
    {
      "text": "Welcome to our platform",
      "start": 0.0,
      "end": 2.5
    },
    {
      "text": "Today we'll show you how to get started",
      "start": 2.5,
      "end": 5.0
    }
  ]
}
```

---

## Reel Processing

### 10. Process Single Reel

#### `POST /api/process-reel`

Process a single video segment into a portrait reel with captions.

**Input:**
```json
{
  "video_url": "https://example.com/video.mp4",
  "start_time": 10.0,
  "end_time": 25.5,
  "captions": [
    {
      "text": "Welcome to our platform",
      "start": 10.0,
      "end": 12.5
    }
  ],
  "add_captions": true,
  "resize_method": "crop",
  "output_filename": "my_reel.mp4"
}
```

**Parameters:**
- `video_url` or `video_path`: Source video (required)
- `start_time`: Start time in seconds (required)
- `end_time`: End time in seconds (required)
- `captions`: Array of caption objects (optional)
- `add_captions`: Whether to add captions (default: true)
- `resize_method`: "crop" or "pad" (default: "crop")
- `output_filename`: Custom filename (optional)

**Output:**
```json
{
  "success": true,
  "reel_path": "/path/to/output/reels/my_reel.mp4",
  "download_url": "/api/download-reel/my_reel.mp4",
  "filename": "my_reel.mp4"
}
```

---

### 11. Process Multiple Reels

#### `POST /api/process-reels`

Process multiple video highlights into reels with captions.

**Input:**
```json
{
  "video_url": "https://example.com/video.mp4",
  "highlights": [
    {
      "title": "Introduction",
      "start": 0.0,
      "end": 15.5
    },
    {
      "title": "Main Content",
      "start": 20.0,
      "end": 35.8
    }
  ],
  "captions": [
    {
      "text": "Welcome!",
      "start": 0.0,
      "end": 2.0
    }
  ],
  "resize_method": "crop"
}
```

**Output:**
```json
{
  "success": true,
  "reels": [
    {
      "path": "/path/to/output/reels/reel_1_Introduction.mp4",
      "filename": "reel_1_Introduction.mp4",
      "download_url": "/api/download-reel/reel_1_Introduction.mp4"
    },
    {
      "path": "/path/to/output/reels/reel_2_Main_Content.mp4",
      "filename": "reel_2_Main_Content.mp4",
      "download_url": "/api/download-reel/reel_2_Main_Content.mp4"
    }
  ],
  "count": 2
}
```

---

### 12. Process Highlights to Reels

#### `POST /api/process-highlights-to-reels/<video_id>`

Complete workflow: Get highlights from TwelveLabs and process them into reels.

**Input:**
```json
{
  "video_url": "https://example.com/video.mp4",
  "highlight_prompt": "Generate engaging social media clips",
  "add_captions": true,
  "resize_method": "crop"
}
```
*Note: Uses default index from environment. All fields except `video_url` are optional.*

**Output:**
```json
{
  "success": true,
  "video_id": "video_456",
  "highlights_count": 5,
  "reels_created": 5,
  "reels": [
    {
      "path": "/path/to/reel_1.mp4",
      "filename": "reel_1_Introduction.mp4",
      "download_url": "/api/download-reel/reel_1_Introduction.mp4",
      "highlight": {
        "title": "Introduction",
        "start": 0.0,
        "end": 15.5
      }
    }
  ]
}
```

---

### 13. Download Reel

#### `GET /api/download-reel/<filename>`

Download a processed reel video file.

**Input:** None (filename in URL path)

**Output:** Video file (MP4)

**Example:**
```
GET /api/download-reel/reel_1_Introduction.mp4
```

---

## Complete Workflows

### 14. Upload and Process Workflow

#### `POST /api/workflow/upload-and-process`

**Complete workflow:** Upload video → Index → Generate highlights → Get transcripts → Cut videos → Portrait format → Add captions

**Input:** `multipart/form-data`
- `file`: Video file (required)
- `highlight_prompt`: Custom prompt for highlights (optional)
- `add_captions`: "true" or "false" (optional, default: "true")
- `resize_method`: "crop" or "pad" (optional, default: "crop")

**Output:**
```json
{
  "success": true,
  "workflow": "upload-and-process",
  "video_id": "video_789",
  "highlights_count": 5,
  "captions_count": 42,
  "reels_created": 5,
  "highlights": [
    {
      "title": "Introduction to FundFlow Website",
      "start": 0.0,
      "end": 15.5
    }
  ],
  "reels": [
    {
      "path": "/path/to/reel_1_Introduction.mp4",
      "filename": "reel_1_Introduction_to_FundFlow_Website.mp4",
      "download_url": "/api/download-reel/reel_1_Introduction_to_FundFlow_Website.mp4",
      "highlight": {
        "title": "Introduction to FundFlow Website",
        "start": 0.0,
        "end": 15.5
      }
    }
  ]
}
```

**Description:**
This is the most comprehensive workflow. It handles everything from upload to final reel creation:
1. Uploads and indexes the video in TwelveLabs
2. Generates AI-powered highlights
3. Retrieves timestamped transcription for captions
4. Downloads the video
5. Processes each highlight into a portrait-format reel with captions

---

### 15. Select and Process Workflow

#### `POST /api/workflow/select-and-process/<video_id>`

**Complete workflow:** Select video from index → Generate highlights → Get transcripts → Cut videos → Portrait format → Add captions

**Input:**
```json
{
  "highlight_prompt": "Generate social media clips",
  "add_captions": true,
  "resize_method": "crop"
}
```
*Note: Uses default index from environment. All fields are optional.*

**Output:**
```json
{
  "success": true,
  "workflow": "select-and-process",
  "video_id": "video_456",
  "video_name": "my_video.mp4",
  "highlights_count": 5,
  "captions_count": 42,
  "reels_created": 5,
  "highlights": [
    {
      "title": "Introduction",
      "start": 0.0,
      "end": 15.5
    }
  ],
  "reels": [
    {
      "path": "/path/to/reel_1.mp4",
      "filename": "reel_1_Introduction.mp4",
      "download_url": "/api/download-reel/reel_1_Introduction.mp4",
      "highlight": {
        "title": "Introduction",
        "start": 0.0,
        "end": 15.5
      }
    }
  ]
}
```

**Description:**
Use this workflow when you already have a video indexed in TwelveLabs:
1. Retrieves video details from the index
2. Generates AI-powered highlights
3. Retrieves timestamped transcription
4. Downloads the video
5. Processes each highlight into a portrait-format reel with captions

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing parameters, invalid input)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Notes for Frontend Implementation

### Recommended Workflow for New Videos
1. **Upload video:** `POST /api/workflow/upload-and-process`
   - This single endpoint handles the complete process
   - Returns reels ready for download

### Recommended Workflow for Existing Videos
1. **Get videos from default index:** `POST /api/videos`
2. **Process selected video:** `POST /api/workflow/select-and-process/<video_id>`
   - Returns reels ready for download

### Caption Format
Captions should be in the following format:
```json
{
  "text": "Caption text",
  "start": 10.5,  // Start time in seconds (absolute time in original video)
  "end": 12.8     // End time in seconds (absolute time in original video)
}
```

**Caption Styling:**
- **Synchronized with speech**: Captions appear and disappear based on the exact timing from transcription
- **Modern design**: Yellow text with black stroke/outline for high visibility
- **Positioned at bottom**: Captions appear at 85% from the top (bottom center)
- **Uppercase formatting**: Text is automatically converted to uppercase for impact
- **Multi-line layout**: Long text is automatically broken into 2-3 words per line for mobile readability
- **Font**: Bold Impact font with letter spacing for better readability

### Resize Methods
- **`crop`**: Crops the video to 9:16 portrait ratio (recommended for mobile)
- **`pad`**: Adds padding to maintain aspect ratio

### File Download
After processing, use the `download_url` field to download the reel:
```javascript
const downloadUrl = response.reels[0].download_url;
window.location.href = `${BASE_URL}${downloadUrl}`;
```

---

## Example Usage

### Example 1: Upload and Create Reels (Complete Workflow)

```javascript
const formData = new FormData();
formData.append('file', videoFile);
formData.append('highlight_prompt', 'Generate 5 engaging clips for Instagram');
formData.append('add_captions', 'true');
formData.append('resize_method', 'crop');

const response = await fetch('http://localhost:5000/api/workflow/upload-and-process', {
  method: 'POST',
  body: formData
});

const data = await response.json();
if (data.success) {
  console.log(`Created ${data.reels_created} reels`);
  data.reels.forEach(reel => {
    console.log(`Download: ${reel.download_url}`);
  });
}
```

### Example 2: Process Existing Video

```javascript
const response = await fetch('http://localhost:5000/api/workflow/select-and-process/video_456', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    add_captions: true,
    resize_method: 'crop',
    highlight_prompt: 'Generate engaging clips for social media'
  })
});

const data = await response.json();
if (data.success) {
  console.log(`Processed ${data.reels_created} reels`);
  data.reels.forEach(reel => {
    console.log(`Download: ${reel.download_url}`);
  });
}
```

### Example 3: Get Highlights Only

```javascript
const response = await fetch('http://localhost:5000/api/highlights/video_456', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Find the most engaging moments'
  })
});

const data = await response.json();
if (data.success) {
  data.highlights.forEach(highlight => {
    console.log(`${highlight.title}: ${highlight.start}s - ${highlight.end}s`);
  });
}
```

### Example 4: Get Videos from Default Index

```javascript
const response = await fetch('http://localhost:5000/api/videos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    page: 1
  })
});

const data = await response.json();
if (data.success) {
  data.videos.forEach(video => {
    console.log(`${video.filename} (${video.id})`);
  });
}
```

---

## Summary for Frontend

### What You Need to Know
1. **No API Keys in Frontend** ✅
   - Don't pass `api_key` in any requests
   - All authentication handled server-side

2. **No Index IDs Needed** ✅
   - Don't pass `index_id` in requests
   - Uses default index configured on server

3. **Two Main Workflows:**
   - **Upload new video:** `POST /api/workflow/upload-and-process`
   - **Process existing video:** `POST /api/workflow/select-and-process/<video_id>`

4. **All Captions are Automatic** ✅
   - Set `add_captions: true` (default)
   - Captions synchronized with speech automatically
   - Modern yellow styling with black stroke

5. **Portrait Format by Default** ✅
   - Videos automatically converted to 9:16 (1080x1920)
   - Use `resize_method: "crop"` (default) or `"pad"`

### Simplified Request Examples

**Upload and Process:**
```javascript
const formData = new FormData();
formData.append('file', videoFile);
// That's all you need! Optionally add:
// formData.append('highlight_prompt', 'Create 5 engaging clips');

fetch('/api/workflow/upload-and-process', {
  method: 'POST',
  body: formData
});
```

**Get Videos:**
```javascript
fetch('/api/videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ page: 1 })
});
```

**Process Existing Video:**
```javascript
fetch(`/api/workflow/select-and-process/${videoId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    add_captions: true,
    resize_method: 'crop'
  })
});
```

---

## Support

For issues or questions, please contact the backend team or refer to the main README.md file.

