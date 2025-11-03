# ✅ Minimum Highlight Duration Feature Added

## What Changed

I've added a **minimum duration filter** to ensure all highlights are at least **20 seconds long** (configurable).

### Why This Matters

Short highlights (under 20 seconds) don't work well as reels because:
- ❌ Too short for engaging content
- ❌ Viewers don't have time to understand the context
- ❌ TikTok/Instagram Reels perform better with 20-60 second content
- ❌ Captions and transitions need time to be effective

## Changes Made

### 1. Updated Prompt (`backend/service/twelvelabs_service.py`)

**Before:**
```python
prompt = "Create a detailed list... Focus on moments that would make great short-form social media content of 15-60 seconds each."
```

**After:**
```python
prompt = "Create a detailed list... IMPORTANT: Each moment must be at least 20-60 seconds long to work well as a reel."
```

This instructs the AI to generate longer highlights from the start.

### 2. Added Duration Filter (`backend/service/twelvelabs_service.py`)

```python
def _parse_highlights_from_analysis(self, analysis_text, min_duration=20):
    """Filter highlights to only include those >= min_duration seconds"""
    
    for match in matches:
        duration = end - start
        
        if duration >= min_duration:
            highlights.append({...})  # ✅ Keep it
            print(f"✅ Kept (duration: {duration}s >= {min_duration}s)")
        else:
            filtered_count += 1
            print(f"⏭️ Filtered out (duration: {duration}s < {min_duration}s)")
```

### 3. Added API Parameter (`backend/routes/api_routes.py`)

The highlights endpoint now accepts an optional `min_duration` parameter:

```python
POST /api/highlights/<video_id>
{
  "api_key": "...",
  "prompt": "...",
  "min_duration": 20  // Optional, defaults to 20 seconds
}
```

### 4. Enhanced Logging

Backend now logs:
```
⏱️  Minimum Duration: 20 seconds
✅ Kept (duration: 25s >= 20s)
⏭️  Filtered out (duration: 15s < 20s)
✨ PARSED HIGHLIGHTS: 3 found (min 20s)
  1. Title [0s ~ 25s] (25s)
  2. Title [30s ~ 55s] (25s)
```

## How It Works

### Step 1: AI Generation
The TwelveLabs AI is instructed to generate highlights of 20-60 seconds.

### Step 2: Parsing
All highlights are extracted from the AI response.

### Step 3: Filtering
Any highlight shorter than 20 seconds is automatically filtered out.

### Step 4: Response
Only highlights ≥ 20 seconds are returned to the frontend.

## Configuration

### Default: 20 Seconds
```python
# Backend default
min_duration = 20  # seconds
```

### Custom Duration
You can change the minimum duration by modifying the API call:

**Frontend (`frontend/lib/api.ts`):**
```typescript
async generateHighlights(videoId: string, prompt?: string, minDuration: number = 20): Promise<ApiResponse> {
  const response = await fetch(`${this.baseUrl}/api/highlights/${videoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: this.apiKey,
      prompt,
      min_duration: minDuration  // Add this parameter
    }),
  })
  return response.json()
}
```

## Example Output

### Before (No Filter):
```
Highlights: 5
1. Intro [0s ~ 8s] (8s) ❌ Too short
2. Main Content [10s ~ 35s] (25s) ✅ Good
3. Transition [40s ~ 43s] (3s) ❌ Too short
4. Key Moment [50s ~ 75s] (25s) ✅ Good
5. Outro [80s ~ 100s] (20s) ✅ Good
```

### After (20s Filter):
```
Highlights: 3
1. Main Content [10s ~ 35s] (25s) ✅
2. Key Moment [50s ~ 75s] (25s) ✅
3. Outro [80s ~ 100s] (20s) ✅

Filtered out: 2 (too short)
```

## Testing

### Backend Logs to Check:
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/backend
python app.py
```

When highlights are generated, you'll see:
```
============================================================
⏱️  Minimum Duration: 20 seconds
============================================================

[DEBUG] Matched - Title: 'Introduction', Start: 0s, End: 8s, Duration: 8s
  ⏭️  Filtered out (duration: 8s < 20s)

[DEBUG] Matched - Title: 'Main Content', Start: 10s, End: 35s, Duration: 25s
  ✅ Kept (duration: 25s >= 20s)

✨ PARSED HIGHLIGHTS: 1 found (min 20s)
  1. Main Content [10s ~ 35s] (25s)
```

### Frontend Response:
```json
{
  "success": true,
  "highlights": [
    {
      "title": "Main Content",
      "start": 10,
      "end": 35
    }
  ],
  "min_duration": 20,
  "video_id": "..."
}
```

## Benefits

✅ **Better Quality Reels**: All clips are long enough to be engaging  
✅ **No Manual Filtering**: Automatic removal of too-short segments  
✅ **Configurable**: Change min_duration as needed  
✅ **Clear Logging**: See exactly what's filtered and why  
✅ **API Transparency**: Response includes min_duration used  

## Quick Start

1. **Restart Backend** to apply changes:
   ```bash
   cd /Users/hrishikesh/Desktop/video-to-reel/backend
   python app.py
   ```

2. **Test It**:
   - Go to your frontend
   - Select a video
   - Generate highlights
   - Check backend logs for duration filtering
   - Only highlights ≥ 20 seconds will appear in the UI

3. **Verify**:
   - Each highlight in the Highlights tab should show duration
   - All durations should be ≥ 20 seconds
   - Backend logs show filtering in action

## Customization

Want different minimum durations? Update these files:

**Backend Service:**
```python
# backend/service/twelvelabs_service.py, line 134
def _parse_highlights_from_analysis(self, analysis_text, min_duration=30):  # Change 20 to 30
```

**Backend Route:**
```python
# backend/routes/api_routes.py, line 310
min_duration = data.get('min_duration', 30)  # Change 20 to 30
```

**Frontend API:**
```typescript
// frontend/lib/api.ts
body: JSON.stringify({
  api_key: this.apiKey,
  prompt,
  min_duration: 30  // Add this line
})
```

Perfect for creating high-quality reels! 🎥✨

