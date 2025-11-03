# 🚀 Quick Start Guide

Get the Video-to-Reel application up and running in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- TwelveLabs API key ([Get one here](https://twelvelabs.io/))

## ⚡ Quick Setup

### 1. Clone & Navigate

```bash
cd video-to-reel
```

### 2. Backend Setup (Terminal 1)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
TWELVELABS_API_KEY=your_twelvelabs_api_key_here
TWELVELABS_INDEX_ID=your_default_index_id_here
FLASK_ENV=development
EOF

# Run backend
python app.py
```

Backend will start at `http://localhost:5000`

### 3. Frontend Setup (Terminal 2)

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

# Run frontend
npm run dev
```

Frontend will start at `http://localhost:3000`

### 4. Open Browser

Visit: **http://localhost:3000**

## 🎯 First Use

### Option 1: Upload New Video

1. Click **"Upload Your Video — It's Free"**
2. Select a video file from your computer
3. Review video details on the next page
4. Click **"Generate reels"**
5. Wait for processing (30-60 seconds)
6. Download your reels!

### Option 2: Use Library Video

1. Click the dropdown **"Select a video"**
2. Choose a video from your TwelveLabs library
3. Processing starts automatically
4. Wait for reels to generate
5. Download your reels!

## 🎬 What Happens Behind the Scenes?

```
Your Video
    ↓
[Upload/Select]
    ↓
TwelveLabs AI Analysis
    ↓
Highlight Detection
    ↓
Automatic Captioning
    ↓
Portrait Format Conversion
    ↓
Generated Reels (9:16)
    ↓
Download & Share!
```

## 📊 API Endpoints (Already Connected!)

All these are ready to use through the frontend:

✅ **Video Library** - Loads your indexed videos  
✅ **Upload & Process** - Uploads and generates reels  
✅ **Select & Process** - Processes library videos  
✅ **Download Reels** - Downloads generated content  

**Plus many more advanced endpoints available!**

See `frontend/API_INTEGRATION.md` for complete list.

## 🔧 Configuration Files

### Backend `.env`
```env
TWELVELABS_API_KEY=your_key_here
TWELVELABS_INDEX_ID=your_index_id_here
FLASK_ENV=development
```

### Frontend `.env.local`
```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:5000

# Production (when deploying)
# NEXT_PUBLIC_API_URL=https://video2reel.onrender.com
```

## 🎨 Key Features

- ✅ **AI-Powered Analysis** - TwelveLabs multimodal understanding
- ✅ **Auto Highlights** - Finds the best moments
- ✅ **Smart Captions** - Generates accurate timestamps
- ✅ **Portrait Format** - Perfect for Instagram, TikTok, YouTube Shorts
- ✅ **Batch Processing** - Multiple reels from one video
- ✅ **Easy Download** - Individual or bulk download

## 📱 Example Workflow

### Scenario: Marketing Team

**Goal**: Turn a 10-minute product demo into 5 short reels

1. **Upload** the full product demo video
2. **Wait** ~60 seconds for AI analysis
3. **Receive** 5 highlight reels with captions
4. **Download** all reels
5. **Post** to social media platforms

**Time saved**: Hours of manual editing! 🎉

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Frontend Won't Start
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### API Connection Error
- Check backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors

### Video Upload Fails
- Ensure TwelveLabs API key is valid
- Check video format (MP4 recommended)
- Verify index ID is correct

## 📚 Next Steps

### Explore Advanced Features

1. **Custom Prompts**: Specify what highlights to find
2. **Video Analysis**: Ask questions about your videos
3. **Transcriptions**: Get full transcripts with timestamps
4. **Multiple Indexes**: Organize videos by project

See `frontend/components/api-examples.tsx` for code examples!

### Deployment

**Backend**: Deploy to Render, Heroku, or AWS  
**Frontend**: Deploy to Vercel, Netlify, or AWS

See deployment guides in respective README files.

## 📖 Documentation

- **Frontend**: `/frontend/README.md`
- **Backend**: `/backend/README.md`
- **API Integration**: `/frontend/API_INTEGRATION.md`
- **Complete Overview**: `/INTEGRATION_SUMMARY.md`

## 🎓 Learn More

### How It Works

1. **Video Upload**: File sent to TwelveLabs for indexing
2. **AI Analysis**: Multimodal AI analyzes video, audio, text
3. **Highlight Generation**: AI identifies engaging moments
4. **Caption Extraction**: Transcription with timestamps
5. **Video Processing**: FFmpeg cuts & formats reels
6. **Caption Overlay**: Stylized captions burned into video
7. **Output**: Ready-to-share 9:16 reels

### Tech Stack

**Frontend**:
- Next.js 16 (React)
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend**:
- Flask (Python)
- TwelveLabs SDK
- FFmpeg
- MoviePy

## 💡 Tips

1. **Video Quality**: Higher quality input = better results
2. **Video Length**: 5-30 minutes ideal for multiple reels
3. **Audio**: Clear audio improves caption accuracy
4. **Custom Prompts**: Use specific prompts for targeted highlights
5. **Batch Processing**: Process multiple videos overnight

## 🆘 Need Help?

1. Check the logs:
   - Backend: Terminal 1 output
   - Frontend: Browser console
   
2. Review documentation:
   - `frontend/API_INTEGRATION.md`
   - `backend/API_DOCUMENTATION.md`

3. Common issues solved in README files

## ✨ Success!

You're now ready to transform long videos into engaging reels!

**Happy Reeling! 🎬**

---

⭐ Star this project if you find it useful!  
🐛 Found a bug? Open an issue!  
🤝 Want to contribute? Submit a PR!

