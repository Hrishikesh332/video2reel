# Video to Reel - Frontend

A modern Next.js application that transforms long-form videos into engaging short-form reels using AI-powered analysis.

## 🚀 Features

- **Video Upload**: Upload videos directly from your device
- **Video Library**: Select from previously indexed videos
- **AI-Powered Highlights**: Automatic highlight detection using TwelveLabs
- **Auto Captions**: Generate captions with timestamps
- **Portrait Format**: Automatically converts to 9:16 aspect ratio
- **Batch Processing**: Generate multiple reels from one video
- **Download**: Download individual reels or all at once

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **API Integration**: Custom fetch wrapper

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see `/backend` directory)
- TwelveLabs API key (optional, can use environment key)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Production backend
NEXT_PUBLIC_API_URL=https://video2reel.onrender.com

# Or for local development
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
frontend/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Landing page (video library & upload)
│   ├── video/
│   │   └── page.tsx          # Video preview & details
│   ├── generating/
│   │   └── page.tsx          # Processing & results
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/                # React components
│   ├── ui/                   # shadcn/ui components
│   └── api-examples.tsx      # API usage examples
├── lib/                      # Utilities
│   ├── api.ts               # Centralized API service ⭐
│   └── utils.ts             # Helper functions
├── public/                   # Static assets
├── .env.local               # Environment variables (create this)
├── .env.local.example       # Environment template
├── API_INTEGRATION.md       # API integration docs
└── README.md                # This file
```

## 🔗 API Integration

All backend API calls are centralized in `lib/api.ts`. This provides:

- ✅ Type safety with TypeScript
- ✅ Consistent error handling
- ✅ Environment-based configuration
- ✅ Easy maintenance and testing

### Usage Example

```typescript
import { api } from '@/lib/api'

// Get videos from library
const result = await api.getVideos(indexId, page)

// Upload and process video
const result = await api.uploadAndProcess(file, {
  add_captions: true,
  resize_method: 'crop'
})

// Download reel
api.downloadReel(filename)
```

See `API_INTEGRATION.md` for complete documentation.

## 🎨 Pages Overview

### 1. Landing Page (`/`)

- **Purpose**: Main entry point
- **Features**:
  - Video library dropdown
  - Upload new video button
  - Hero section with stats
- **API Calls**:
  - `api.getVideos()` - Load library
  - `api.selectAndProcess()` - Process selected video

### 2. Video Page (`/video`)

- **Purpose**: Preview uploaded video
- **Features**:
  - Video player with controls
  - Metadata display (size, resolution, duration, etc.)
  - Generate reels button
- **API Calls**:
  - `api.uploadAndProcess()` - Upload and process

### 3. Generating Page (`/generating`)

- **Purpose**: Show processing status and results
- **Features**:
  - Loading animation
  - Generated reels preview
  - Download buttons (individual & all)
- **API Calls**:
  - `api.downloadReel()` - Download reels
  - `api.getDownloadUrl()` - Get video URLs

## 🧩 Components

### UI Components (shadcn/ui)

Located in `components/ui/`:
- Button, Input, Select, Skeleton, etc.
- Fully customizable with Tailwind
- See [shadcn/ui docs](https://ui.shadcn.com/)

### Example Components

`components/api-examples.tsx` contains working examples of:
- API Key Configuration
- Video Analysis
- Highlight Generation
- Transcription Viewer
- Index Selector
- Health Check

Copy these patterns into your own components!

## 🎯 User Flow

### Upload Flow
```
1. User clicks "Upload Your Video"
2. File picker opens
3. User selects video
   ↓
4. Redirected to /video page
5. Video preview shown with metadata
6. User clicks "Generate reels"
   ↓
7. api.uploadAndProcess() called
8. Redirected to /generating page
9. Loading animation shown
   ↓
10. Reels appear when ready
11. User can preview & download
```

### Library Flow
```
1. User selects video from dropdown
2. api.selectAndProcess() called
3. Processing starts
   ↓
4. Redirected to /generating page
5. Loading animation shown
   ↓
6. Reels appear when ready
7. User can preview & download
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://video2reel.onrender.com` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: Optimized spacing
- **Desktop**: Full featured layout

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Theme**: Custom green theme (`bg-[#e8f5e3]`)
- **Components**: shadcn/ui with custom styling
- **Icons**: Lucide React

### Custom Colors

```css
/* Main background */
bg-[#e8f5e3]  /* Light green */

/* Accent */
bg-gradient-to-br from-blue-600 to-green-500  /* Logo gradient */
```

## 🔒 Security

- API keys stored in environment variables (never committed)
- HTTPS for all API calls
- Session storage for temporary data only
- No sensitive data in localStorage

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

Build and deploy the `.next` folder:

```bash
npm run build
# Deploy the .next folder and package.json
```

## 📊 Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: React.lazy where appropriate
- **Caching**: Built-in Next.js caching

## 🐛 Troubleshooting

### Module Not Found Error

```bash
rm -rf node_modules package-lock.json
npm install
```

### API Connection Failed

Check:
1. Backend is running
2. `NEXT_PUBLIC_API_URL` is correct in `.env.local`
3. CORS is enabled on backend

### Video Upload Fails

Check:
1. File is a valid video format
2. TwelveLabs API key is configured
3. Backend logs for detailed error

## 📚 Additional Resources

- **API Integration**: See `API_INTEGRATION.md`
- **Backend API**: See `/backend/API_DOCUMENTATION.md`
- **Integration Summary**: See `/INTEGRATION_SUMMARY.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

[Your License Here]

## 👨‍💻 Support

For issues or questions:
- Check documentation in `/frontend/API_INTEGRATION.md`
- Review example components in `/frontend/components/api-examples.tsx`
- Check backend logs for API errors

---

**Happy coding! 🎉**

