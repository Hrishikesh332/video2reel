# 🔍 Debug Instructions for Highlights Issue

## What I've Added

### Frontend Debug Logging (`frontend/app/analyze/page.tsx`)
- ✅ Console logs when fetching highlights
- ✅ Console logs showing API response
- ✅ Console logs for highlights count
- ✅ Visual debug indicator showing highlights count in UI
- ✅ Detailed analysis response logging

### Backend Debug Logging (`backend/routes/api_routes.py` & `backend/service/twelvelabs_service.py`)
- ✅ Logs showing highlights service response
- ✅ Logs showing extracted highlights list
- ✅ Logs showing raw analysis response from TwelveLabs
- ✅ Logs showing parsed highlights with titles and timestamps

## How to Test

### 1. Start Backend Server
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/backend
python app.py
```

**Watch for these logs in the backend terminal:**
```
🔍 GENERATING HIGHLIGHTS FOR VIDEO: <video_id>
📦 RAW ANALYSIS RESPONSE:
<analysis text from TwelveLabs>
✨ PARSED HIGHLIGHTS: X found
  1. Title [start ~ end]
  2. Title [start ~ end]
```

### 2. Start Frontend Server
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/frontend
npm run dev
```

### 3. Open Browser DevTools
- Open `http://localhost:3000`
- Press `F12` or `Cmd+Option+I` to open DevTools
- Go to **Console** tab

### 4. Test the Flow
1. Select a video from the dropdown on the home page
2. Click "Generate Reel" button
3. You'll be redirected to `/analyze` page

**Watch for these logs in the browser console:**
```
🎬 Loading video details...
📹 Video ID: <video_id>
📁 Index ID: <index_id>
📦 Video Details Response: {...}
✅ Video details loaded successfully
🚀 Starting analysis and highlights...
🔍 Analyzing video: <video_id>
📦 Analysis API Response: {...}
📝 Analysis text: <text>
🔍 Fetching highlights for video: <video_id>
📦 Highlights API Response: {...}
📊 Highlights data: [...]
📈 Highlights count: X
✨ Setting highlights: [...]
```

**On the UI, you should see:**
- Debug info: `Debug: X highlights loaded`
- Highlights displayed in green-highlighted cards

## Common Issues & Solutions

### Issue 1: No Highlights Generated
**Symptoms:** `📈 Highlights count: 0`

**Cause:** TwelveLabs API response doesn't contain parseable timestamps

**Solution:** Check the backend logs for "RAW ANALYSIS RESPONSE". The format should be:
```
**Title**: [0s~30s]
**Another Title**: [35s~60s]
```

If the format is different, update the regex pattern in `backend/service/twelvelabs_service.py` line 131.

### Issue 2: API Key Error
**Symptoms:** `Error: TwelveLabs API key is required`

**Solution:** Make sure you have set `TWELVELABS_API_KEY` in your backend `.env` file:
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/backend
echo "TWELVELABS_API_KEY=your_key_here" >> .env
```

### Issue 3: Index ID Not Found
**Symptoms:** `Failed to load video details`

**Solution:** Make sure you're selecting a video from the dropdown (which auto-sets the index ID).

### Issue 4: Highlights Not Showing in UI
**Symptoms:** Backend shows highlights, but UI is empty

**Checks:**
1. Browser console shows `📈 Highlights count: 0` → API response issue
2. UI shows `Debug: 0 highlights loaded` → Data not reaching component
3. Check if `highlights` state is being set correctly

## Expected Complete Flow

### Backend Terminal:
```
============================================================
🔍 GENERATING HIGHLIGHTS FOR VIDEO: 673e5de99a0e16c4e175f37d
📝 Prompt: Create a detailed list of the top 5 most...
============================================================

============================================================
📦 RAW ANALYSIS RESPONSE:
============================================================
**Opening Scene**: [0s~15s]
The video opens with an engaging introduction that...

**Main Content**: [20s~45s]
Key information is presented with clear visuals...
============================================================

============================================================
✨ PARSED HIGHLIGHTS: 2 found
============================================================
  1. Opening Scene [0.0s ~ 15.0s]
  2. Main Content [20.0s ~ 45.0s]
============================================================

[DEBUG] Highlights response from service: {'id': '673e5de99a0e16c4e175f37d', 'highlights': [...]}
[DEBUG] Extracted highlights list: [{'title': 'Opening Scene', 'start': 0.0, 'end': 15.0}, ...]
[DEBUG] Highlights count: 2
```

### Browser Console:
```
🎬 Loading video details...
📹 Video ID: 673e5de99a0e16c4e175f37d
📁 Index ID: 6908f3065289027faefed556
📦 Video Details Response: {success: true, video_details: {...}}
✅ Video details loaded successfully
🚀 Starting analysis and highlights...
🔍 Analyzing video: 673e5de99a0e16c4e175f37d
📦 Analysis API Response: {success: true, analysis: "..."}
✨ Analysis set successfully
🔍 Fetching highlights for video: 673e5de99a0e16c4e175f37d
📦 Highlights API Response: {success: true, highlights: Array(2)}
✅ Success: true
📊 Highlights data: (2) [{…}, {…}]
📈 Highlights count: 2
✨ Setting highlights: (2) [{…}, {…}]
```

### UI Display:
```
Debug: 2 highlights loaded

Found 2 highlights ready to convert into reels

┌─────────────────────────────────────────────┐
│ 1  Opening Scene                            │
│    [0s - 15s] 15s duration                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 2  Main Content                             │
│    [20s - 45s] 25s duration                 │
└─────────────────────────────────────────────┘
```

## Files Modified

1. `frontend/app/analyze/page.tsx` - Added debug logging to all API calls
2. `backend/routes/api_routes.py` - Added logging to highlights endpoint
3. `backend/service/twelvelabs_service.py` - Added detailed logging to highlight generation

## Next Steps

1. **Run both servers** (backend & frontend)
2. **Open browser DevTools console**
3. **Test the flow** and watch the logs
4. **Share the logs** with me if you see any issues

The logs will tell us exactly where the problem is! 🎯

