# Backend URL Configuration

## Current Configuration

The frontend is now configured to connect to the local backend by default.

### Default URL
```
http://127.0.0.1:5000
```

## Configuration Files

### 1. `/frontend/.env.local` (Current)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

This file is used for local development and is ignored by git.

### 2. `/frontend/lib/api.ts`
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'
```

The fallback URL is now set to local backend.

## Usage Scenarios

### Local Development (Current Setup)
```env
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

### Production Deployment
When deploying to Vercel/Netlify, set environment variable:
```env
NEXT_PUBLIC_API_URL=https://video2reel.onrender.com
```

## Starting the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
python app.py
```
Backend runs on: `http://127.0.0.1:5000`

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

The frontend will automatically connect to `http://127.0.0.1:5000`

## Testing the Connection

### Check Backend Health
```bash
curl http://127.0.0.1:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T...",
  "message": "Video2Reel API is running",
  "version": "1.0.1"
}
```

### Check Frontend Connection
1. Open browser: `http://localhost:3000`
2. Open browser console (F12)
3. Check for API calls to `http://127.0.0.1:5000`
4. Should see successful responses (status 200)

## Switching Between Local and Production

### Option 1: Environment Variable (Recommended)
Edit `/frontend/.env.local`:

```env
# For local backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000

# For production backend
# NEXT_PUBLIC_API_URL=https://video2reel.onrender.com
```

After changing, restart the frontend server:
```bash
npm run dev
```

### Option 2: Temporary Override
Set environment variable when starting:
```bash
NEXT_PUBLIC_API_URL=https://video2reel.onrender.com npm run dev
```

## CORS Configuration

Make sure your backend (`backend/app.py`) has CORS enabled for localhost:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://your-frontend-domain.com"
        ]
    }
})
```

## Deployment Configuration

### Vercel (Frontend)
Environment Variables:
```
NEXT_PUBLIC_API_URL=https://video2reel.onrender.com
```

### Render (Backend)
Environment Variables:
```
TWELVELABS_API_KEY=your_api_key
TWELVELABS_INDEX_ID=your_index_id
FLASK_ENV=production
```

## Troubleshooting

### Issue: Cannot connect to backend
**Check:**
1. Backend is running: `curl http://127.0.0.1:5000/health`
2. Frontend `.env.local` has correct URL
3. Restart frontend after changing `.env.local`
4. Check browser console for CORS errors

### Issue: CORS errors
**Solution:**
- Add your frontend URL to backend CORS configuration
- Common URLs to allow:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`

### Issue: 404 errors
**Check:**
1. Backend routes are registered correctly
2. URL paths match (check `/api/` prefix)
3. Backend is running on correct port (5000)

## URL Differences

### `localhost` vs `127.0.0.1`

Both refer to the local machine, but there are subtle differences:

- **`localhost`**: Domain name that resolves to 127.0.0.1 (may have DNS lookup delay)
- **`127.0.0.1`**: Direct IP address (faster, no DNS lookup)

We use `127.0.0.1` for:
- ✅ Faster connection (no DNS lookup)
- ✅ More reliable
- ✅ Consistent behavior across systems

## Quick Reference

| Environment | Backend URL | Frontend URL |
|-------------|-------------|--------------|
| Local Dev | `http://127.0.0.1:5000` | `http://localhost:3000` |
| Production | `https://video2reel.onrender.com` | `https://your-domain.vercel.app` |

## Summary

✅ **Current Setup**: Frontend connects to local backend at `http://127.0.0.1:5000`  
✅ **For Production**: Set `NEXT_PUBLIC_API_URL` environment variable on deployment platform  
✅ **Testing**: Start both backend (port 5000) and frontend (port 3000)

---

**Last Updated**: November 3, 2025  
**Status**: Configured for Local Development

