# 🔍 Quick Test Guide - Highlights Not Showing

## Problem
Highlights are not displaying in the Highlights tab on the analyze page.

## Immediate Testing Steps

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/frontend
npm run dev
```

### Step 2: Test the UI Rendering First

1. Open `http://localhost:3000` in your browser
2. Open DevTools Console (F12 or Cmd+Option+I)
3. Select any video from dropdown and click "Generate Reel"
4. On the analyze page, you'll see debug controls

**Click the "🧪 Load Test Data" button**

This will load 3 test highlights directly into the state without calling the API.

#### ✅ If Test Data Shows Up:
- **The UI rendering is working correctly**
- Problem is with the API response or data flow
- Check browser console for API response logs
- Check backend terminal for highlight parsing logs

#### ❌ If Test Data Doesn't Show Up:
- **There's a React rendering issue**
- Check browser console for React errors
- The Tabs component might have an issue
- Try refreshing the page

### Step 3: Check API Response

After loading the page, look for these console logs:

```javascript
🔍 Fetching highlights for video: <video_id>
[API] Calling highlights endpoint: http://127.0.0.1:5000/api/highlights/<video_id>
[API] Highlights response: {...}
📦 Highlights API Response: {...}
✅ Success: true/false
📊 Highlights data: [...]
📈 Highlights count: X
🔍 Highlights array check: true/false
```

**Key Things to Check:**

1. **Is `success: true`?**
   - If false, check the error message
   - Might be API key issue

2. **Is `highlights` an array?**
   - Should be: `Array(X)`
   - If not, the response format is wrong

3. **Is the count > 0?**
   - If 0, no highlights were parsed from analysis
   - Check backend logs

### Step 4: Check Backend Logs

In the backend terminal, look for:

```
============================================================
🔍 GENERATING HIGHLIGHTS FOR VIDEO: <video_id>
============================================================

============================================================
📦 RAW ANALYSIS RESPONSE:
============================================================
<This is the actual text from TwelveLabs>
============================================================

============================================================
✨ PARSED HIGHLIGHTS: X found
============================================================
  1. Title [start ~ end]
  2. Title [start ~ end]
============================================================
```

**Common Issues:**

#### No Highlights Parsed (0 found)

**Cause:** The TwelveLabs response doesn't match the expected format.

**Expected format:**
```
**Highlight Title**: [0s~30s]
**Another Highlight**: [35s~60s]
```

**Check:** Look at the "RAW ANALYSIS RESPONSE" - does it have timestamps in square brackets?

**Fix:** If the format is different, we need to update the regex in:
`backend/service/twelvelabs_service.py` line 131

#### API Key Error

```
Error: TwelveLabs API key is required
```

**Fix:**
```bash
cd /Users/hrishikesh/Desktop/video-to-reel/backend
echo "TWELVELABS_API_KEY=your_actual_key_here" >> .env
```

### Step 5: Manual Refresh

On the analyze page, click the **"🔄 Refresh Highlights"** button.

This will manually trigger the highlights API call. Watch the console for logs.

### Step 6: Check Network Tab

In DevTools:
1. Go to **Network** tab
2. Filter by "highlights"
3. Click "🔄 Refresh Highlights"
4. Click on the `highlights/<video_id>` request
5. Check the **Response** tab

**You should see:**
```json
{
  "success": true,
  "highlights": [
    {
      "title": "...",
      "start": 0,
      "end": 15
    }
  ],
  "video_id": "...",
  "summary": "..."
}
```

## Quick Diagnostics

### Scenario A: Test Data Works, Real Data Doesn't
**Diagnosis:** API response issue
**Action:** Share the Network tab response with me

### Scenario B: Nothing Shows (Even Test Data)
**Diagnosis:** React rendering issue
**Action:** Check browser console for errors

### Scenario C: Backend Shows Highlights, Frontend Doesn't Receive
**Diagnosis:** Network/CORS issue
**Action:** Check if backend URL is correct (should be http://127.0.0.1:5000)

### Scenario D: Highlights Parsed = 0
**Diagnosis:** TwelveLabs response format mismatch
**Action:** Share the "RAW ANALYSIS RESPONSE" from backend logs

## Debug Controls on UI

The analyze page now has these debug buttons:

- **🔄 Refresh Highlights** - Manually trigger API call
- **🧪 Load Test Data** - Load 3 test highlights (bypasses API)
- **🗑️ Clear** - Clear all highlights

Plus a status display showing:
```
State: X highlights | Loading: true/false | Array: yes/no
```

## Expected Successful Output

### Frontend Console:
```
🔄 Highlights state changed: 3 highlights
📋 Current highlights: (3) [{…}, {…}, {…}]
```

### UI Display:
```
Highlights (3)

Debug: 3 highlights loaded

Found 3 highlights ready to convert into reels

[Card 1]
[Card 2]
[Card 3]
```

## Next Steps Based on Results

Please try the test steps above and let me know:

1. ✅ Does the "🧪 Load Test Data" button work?
2. ✅ What do you see in the browser console when the page loads?
3. ✅ What appears in the backend terminal?
4. ✅ What does the Network tab show for the highlights response?

With this information, I can pinpoint the exact issue! 🎯

