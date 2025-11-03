# Caption Testing Guide

## How to Test the New Caption Improvements

Your caption improvements are implemented and ready to test! Here's how to verify they're working:

---

## Option 1: Test via cURL (Command Line)

### Step 1: Check API Health
```bash
curl https://video2reel.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Video2Reel API is running"
}
```

---

### Step 2: Get Existing Videos
```bash
curl -X POST https://video2reel.onrender.com/api/videos \
  -H "Content-Type: application/json" \
  -d '{"page": 1}'
```

**Expected Response:**
```json
{
  "success": true,
  "videos": [
    {
      "_id": "video_id_here",
      "metadata": {
        "filename": "your_video.mp4"
      }
    }
  ]
}
```

---

### Step 3: Process Video with Captions
```bash
curl -X POST https://video2reel.onrender.com/api/workflow/select-and-process/VIDEO_ID \
  -H "Content-Type: application/json" \
  -d '{
    "add_captions": true,
    "resize_method": "crop"
  }'
```

Replace `VIDEO_ID` with the actual video ID from step 2.

**Expected Response:**
```json
{
  "success": true,
  "workflow": "select-and-process",
  "video_id": "...",
  "highlights_count": 5,
  "captions_count": 42,
  "reels_created": 5,
  "reels": [
    {
      "filename": "reel_1_Introduction.mp4",
      "download_url": "/api/download-reel/reel_1_Introduction.mp4"
    }
  ]
}
```

---

### Step 4: Download and View Reel
```bash
curl -O https://video2reel.onrender.com/api/download-reel/FILENAME.mp4
```

Replace `FILENAME.mp4` with the actual filename from step 3.

**Watch the video** and verify captions have:
- 🟡 Yellow text with black stroke
- 📍 Bottom-centered position
- ⏱️  Synchronized with speech
- 🔤 UPPERCASE formatting

---

## Option 2: Test via Postman

### 1. Health Check
- **Method:** GET
- **URL:** `https://video2reel.onrender.com/health`
- **Click:** Send

### 2. Get Videos
- **Method:** POST
- **URL:** `https://video2reel.onrender.com/api/videos`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "page": 1
}
```
- **Click:** Send

### 3. Process Video
- **Method:** POST
- **URL:** `https://video2reel.onrender.com/api/workflow/select-and-process/VIDEO_ID`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "add_captions": true,
  "resize_method": "crop"
}
```
- **Click:** Send

### 4. Download Reel
- **Method:** GET
- **URL:** `https://video2reel.onrender.com/api/download-reel/FILENAME.mp4`
- **Click:** Send and Download

---

## Option 3: Test by Uploading New Video

### Upload and Process in One Step
```bash
curl -X POST https://video2reel.onrender.com/api/workflow/upload-and-process \
  -F "file=@/path/to/your/video.mp4" \
  -F "add_captions=true" \
  -F "resize_method=crop"
```

**This will:**
1. Upload your video
2. Index it with TwelveLabs
3. Generate highlights
4. Get transcription
5. Create reels with captions
6. Return download URLs

**Expected Response:**
```json
{
  "success": true,
  "workflow": "upload-and-process",
  "video_id": "new_video_id",
  "highlights_count": 5,
  "captions_count": 35,
  "reels_created": 5,
  "reels": [...]
}
```

---

## Option 4: Test via Python Script

Create a file `test_caption.py`:

```python
import requests

API_URL = "https://video2reel.onrender.com"

# Step 1: Get videos
print("Getting videos...")
response = requests.post(f"{API_URL}/api/videos", json={"page": 1})
videos = response.json().get('videos', [])

if not videos:
    print("No videos found. Upload a video first.")
    exit()

# Step 2: Process first video
video_id = videos[0]['_id']
video_name = videos[0]['metadata']['filename']
print(f"Processing: {video_name}")

response = requests.post(
    f"{API_URL}/api/workflow/select-and-process/{video_id}",
    json={
        "add_captions": True,
        "resize_method": "crop"
    },
    timeout=600
)

result = response.json()
if result.get('success'):
    print(f"✅ Success!")
    print(f"   Reels created: {result.get('reels_created')}")
    print(f"   Captions: {result.get('captions_count')}")
    
    for reel in result.get('reels', []):
        print(f"\n   Download: {API_URL}{reel['download_url']}")
else:
    print(f"❌ Failed: {result.get('error')}")
```

Run it:
```bash
python test_caption.py
```

---

## What to Look For in the Generated Reels

When you download and watch the generated reel, verify these caption features:

### ✅ Visual Styling
- [ ] Text is **bright yellow color**
- [ ] Text has **black outline/stroke** (3px width)
- [ ] Text is **UPPERCASE**
- [ ] Font is **bold** (Impact or Arial Bold)
- [ ] Text is **easily readable** on mobile

### ✅ Positioning
- [ ] Captions appear at the **bottom center** of the video
- [ ] Positioned at ~85% from the top
- [ ] Similar to **TikTok/Instagram Reels** style
- [ ] Doesn't obstruct main content

### ✅ Synchronization
- [ ] Captions **change as words are spoken**
- [ ] Timing is **precise** (not too early or late)
- [ ] No caption **overlap**
- [ ] Smooth **transitions** between captions

### ✅ Formatting
- [ ] Long text is broken into **2-3 words per line**
- [ ] Text is **centered horizontally**
- [ ] **Readable** on small screens
- [ ] Professional appearance

---

## Visual Example

**What you should see:**

```
┌─────────────────────────────────┐
│                                 │
│      [Video Content]            │
│                                 │
│                                 │
│                                 │
│                                 │
│       WELCOME TO OUR            │  ← Yellow text
│         PLATFORM                │     Black stroke
│                                 │     Bottom center
└─────────────────────────────────┘
```

**Caption should:**
- Appear exactly when "Welcome to our platform" is spoken
- Be bright yellow with black outline
- Be positioned at bottom center
- Be in UPPERCASE
- Be easy to read on mobile

---

## Troubleshooting

### Issue: No captions appear
**Solution:** Ensure `add_captions: true` is in your request

### Issue: Captions are white on black background
**Solution:** Old reels from before the improvements. Process a new video.

### Issue: Captions not synchronized
**Solution:** Check that transcription is available for the video

### Issue: API returns error
**Solution:** Check API logs or contact backend team

### Issue: Timeout error
**Solution:** Processing takes time. Increase timeout to 10 minutes (600 seconds)

---

## Quick Test Checklist

- [ ] API is running (health check passes)
- [ ] Video exists in index (or upload new one)
- [ ] Process video with `add_captions: true`
- [ ] Download generated reel
- [ ] Watch reel and verify:
  - [ ] Yellow text with black stroke
  - [ ] Bottom-centered position
  - [ ] Synchronized with speech
  - [ ] Uppercase formatting
  - [ ] Mobile-friendly layout

---

## Sample Test Video

If you don't have a video, you can test with any short video (30-60 seconds) that has:
- Clear speech/dialogue
- Good audio quality
- Content suitable for portrait format

---

## Expected Results

After processing a video with captions enabled:

1. **Highlights generated:** 3-8 segments depending on video length
2. **Captions retrieved:** 20-50+ caption segments with precise timestamps
3. **Reels created:** One reel per highlight
4. **Caption styling:** Modern yellow/black style, bottom-centered
5. **Synchronization:** Captions appear/disappear with speech

---

## Support

If captions don't work as expected:

1. Check the API logs for errors
2. Verify environment variables are set:
   - `TWELVELABS_API_KEY`
   - `TWELVELABS_INDEX_ID`
3. Ensure video has transcription available
4. Try with a different video
5. Contact backend team with video ID and error message

---

## Summary

**Caption improvements are live and ready to use!** 🎉

Simply process any video with `add_captions: true` and the new caption styling will be automatically applied:

- 🟡 Yellow text with black stroke
- 📍 Bottom-centered positioning  
- ⏱️ Speech-synchronized timing
- 🔤 Uppercase bold formatting
- 📱 Mobile-optimized layout

**Happy testing!** 🎥✨

