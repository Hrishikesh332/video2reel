"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Play, Sparkles, FileText, Zap } from "lucide-react"
import { api } from "@/lib/api"
import { HLSVideoPlayer } from "@/components/hls-video-player"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VideoDetails {
  id: string
  name: string
  duration: number
  video_url?: string
  thumbnail_url?: string
  width?: number
  height?: number
  metadata?: any
}

interface Highlight {
  title: string
  start: number
  end: number
}

export default function AnalyzePage() {
  const router = useRouter()
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
  const [analysis, setAnalysis] = useState<string>("")
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [isLoadingVideo, setIsLoadingVideo] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
  const [isGeneratingReels, setIsGeneratingReels] = useState(false)
  const [error, setError] = useState<string>("")
  const [indexId, setIndexId] = useState<string>("")

  // Debug: Log highlights state changes
  useEffect(() => {
    console.log("🔄 Highlights state changed:", highlights.length, "highlights")
    console.log("📋 Current highlights:", highlights)
  }, [highlights])

  useEffect(() => {
    const loadVideoDetails = async () => {
      const videoId = sessionStorage.getItem("selectedVideoId")
      const storedIndexId = sessionStorage.getItem("indexId") || "69091350754d7f2962cb7284"
      setIndexId(storedIndexId)

      console.log("🎬 Loading video details...")
      console.log("📹 Video ID:", videoId)
      console.log("📁 Index ID:", storedIndexId)

      if (!videoId) {
        console.warn("⚠️ No video ID found, redirecting to home")
        router.push("/")
        return
      }

      try {
        setIsLoadingVideo(true)
        const result = await api.getVideoDetails(storedIndexId, videoId)

        console.log("📦 Video Details Response:", result)

        if (result.success && result.video_details) {
          const details = result.video_details
          setVideoDetails({
            id: videoId,
            name: details.metadata?.filename || details.title || "Video",
            duration: details.metadata?.duration || 0,
            video_url: details.hls?.video_url,
            thumbnail_url: details.hls?.thumbnail_urls?.[0],
            width: details.metadata?.width,
            height: details.metadata?.height,
            metadata: details.metadata,
          })

          console.log("✅ Video details loaded successfully")
          console.log("🚀 Starting analysis and highlights...")

          // Auto-start analysis and highlights
          await startAnalysis(videoId)
          await loadHighlights(videoId)
        } else {
          console.error("❌ Failed to load video details")
          setError("Failed to load video details")
        }
      } catch (err) {
        console.error("❌ Error loading video:", err)
        setError("Error loading video details")
      } finally {
        setIsLoadingVideo(false)
      }
    }

    loadVideoDetails()
  }, [router])

  const startAnalysis = async (videoId: string) => {
    setIsAnalyzing(true)
    try {
      console.log("🔍 Analyzing video:", videoId)
      const result = await api.analyzeVideo(
        videoId,
        "Analyze this video and identify the key moments, main topics, and highlight-worthy segments. Describe what makes each moment engaging and suitable for short-form content."
      )

      console.log("📦 Analysis API Response:", result)
      console.log("✅ Analysis Success:", result.success)
      console.log("📝 Analysis text:", result.analysis)

      if (result.success) {
        setAnalysis(result.analysis || "Analysis completed successfully.")
        console.log("✨ Analysis set successfully")
      } else {
        setAnalysis("Unable to generate detailed analysis at this time.")
        console.warn("⚠️ Analysis failed or no analysis text")
      }
    } catch (err) {
      console.error("❌ Analysis error:", err)
      setAnalysis("Analysis completed. Ready to generate reels.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadHighlights = async (videoId: string) => {
    setIsLoadingHighlights(true)
    try {
      console.log("🔍 Fetching highlights for video:", videoId)
      const result = await api.generateHighlights(videoId)
      
      console.log("📦 Highlights API Response:", JSON.stringify(result, null, 2))
      console.log("✅ Success:", result.success)
      console.log("📊 Highlights data:", result.highlights)
      console.log("📈 Highlights count:", result.highlights?.length)
      console.log("🔍 Highlights array check:", Array.isArray(result.highlights))

      if (result.success && result.highlights && Array.isArray(result.highlights)) {
        console.log("✨ Setting highlights:", result.highlights)
        setHighlights(result.highlights)
        console.log("✅ Highlights state updated")
      } else {
        console.warn("⚠️ No highlights in response or success=false or not an array")
        console.warn("Result structure:", Object.keys(result))
        // Set empty array to clear loading state
        setHighlights([])
      }
    } catch (err) {
      console.error("❌ Highlights error:", err)
      setHighlights([])
    } finally {
      console.log("🏁 Setting isLoadingHighlights to false")
      setIsLoadingHighlights(false)
    }
  }

  const handleEditIntoReel = async () => {
    const videoId = sessionStorage.getItem("selectedVideoId")
    if (!videoId) return

    setIsGeneratingReels(true)

    try {
      const result = await api.selectAndProcess(videoId, {
        index_id: indexId,
        add_captions: true,
        resize_method: "crop",
      })

      if (result.success) {
        sessionStorage.setItem("generatedReels", JSON.stringify(result.reels))
        sessionStorage.setItem("reelsCount", result.reels_created.toString())
        sessionStorage.setItem("analysisText", analysis)
        router.push("/generating")
      } else {
        alert(`Error: ${result.error || "Failed to generate reels"}`)
        setIsGeneratingReels(false)
      }
    } catch (err) {
      console.error("Error generating reels:", err)
      alert("An error occurred while generating reels. Please try again.")
      setIsGeneratingReels(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e8f5e3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e8f5e3] flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg" />
            <span className="font-bold text-lg">Reelify</span>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            Cancel
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Analysis</h1>
            <p className="text-gray-600">
              Analyzing your video to identify the best moments for reels
            </p>
          </div>

          {isLoadingVideo ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading video details...</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Side - Video Player */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900">Video Preview</h2>
                </div>

                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    {videoDetails?.video_url ? (
                      <HLSVideoPlayer
                        src={videoDetails.video_url}
                        poster={videoDetails.thumbnail_url}
                        alt={videoDetails.name}
                        className="w-full h-full"
                      />
                    ) : videoDetails?.thumbnail_url ? (
                      <img
                        src={videoDetails.thumbnail_url}
                        alt={videoDetails.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  {videoDetails && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{videoDetails.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            Duration: {Math.floor(videoDetails.duration / 60)}:
                            {String(Math.floor(videoDetails.duration % 60)).padStart(2, "0")}
                          </span>
                          {videoDetails.width && videoDetails.height && (
                            <span>
                              Resolution: {videoDetails.width}×{videoDetails.height}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Analysis with Tabs */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
                </div>

                {isAnalyzing && isLoadingHighlights ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 text-center mb-2">Analyzing video content...</p>
                    <p className="text-sm text-gray-500 text-center">
                      AI is identifying key moments and highlights
                    </p>
                  </div>
                ) : (
                  <>
                    <Tabs defaultValue="highlights" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="highlights" className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Highlights ({highlights.length})
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Analysis
                        </TabsTrigger>
                      </TabsList>

                      {/* Highlights Tab */}
                      <TabsContent value="highlights" className="space-y-4 mt-2">
                        {/* Debug Info */}
                        <div className="text-xs text-gray-400 mb-2 px-2 font-mono">
                          Debug: {isLoadingHighlights ? "Loading..." : `${highlights.length} highlights loaded`}
                        </div>
                        
                        {isLoadingHighlights ? (
                          <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Loading highlights...</span>
                            </div>
                          </div>
                        ) : highlights.length > 0 ? (
                          <>
                            <div className="text-sm text-gray-600 mb-3 px-1">
                              Found {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} ready to convert into reels
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                              {highlights.map((highlight, index) => (
                                <div
                                  key={index}
                                  className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 text-base mb-2 leading-tight" title={highlight.title}>
                                        {highlight.title}
                                      </p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="flex items-center gap-1.5 text-gray-700 bg-green-100 px-3 py-1.5 rounded-full font-medium text-xs border border-green-300">
                                          <svg
                                            className="w-3.5 h-3.5 text-green-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <span className="font-semibold">{Math.floor(highlight.start)}s - {Math.floor(highlight.end)}s</span>
                                        </span>
                                        <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-semibold text-xs border border-green-200">
                                          <svg
                                            className="w-3.5 h-3.5 text-green-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                          {Math.floor(highlight.end - highlight.start)}s duration
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No highlights detected yet</p>
                            <p className="text-sm mt-1">Waiting for AI to analyze the video...</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Analysis Tab */}
                      <TabsContent value="analysis" className="space-y-4 mt-2">
                        {isAnalyzing ? (
                          <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Analyzing...</span>
                            </div>
                          </div>
                        ) : analysis ? (
                          <div className="bg-gray-50 rounded-2xl p-6 max-h-96 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">{analysis}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No analysis available</p>
                            <p className="text-sm mt-1">AI analysis will appear here...</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Debug & Test Controls */}
                    <div className="pt-4 mt-4 border-t border-b pb-4 bg-gray-50 rounded-lg p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const videoId = sessionStorage.getItem("selectedVideoId")
                              if (videoId) {
                                console.log("🧪 Manual highlights refresh triggered")
                                loadHighlights(videoId)
                              }
                            }}
                            disabled={isLoadingHighlights}
                          >
                            {isLoadingHighlights ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Refreshing...
                              </>
                            ) : (
                              <>🔄 Refresh Highlights</>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log("🧪 Loading test highlights data")
                              const testHighlights: Highlight[] = [
                                { title: "Test Highlight 1", start: 0, end: 15 },
                                { title: "Test Highlight 2", start: 20, end: 35 },
                                { title: "Test Highlight 3", start: 40, end: 60 }
                              ]
                              setHighlights(testHighlights)
                              console.log("✅ Test highlights set:", testHighlights)
                            }}
                          >
                            🧪 Load Test Data
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log("🧪 Clearing highlights")
                              setHighlights([])
                            }}
                          >
                            🗑️ Clear
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                          <strong>State:</strong> {highlights.length} highlights | 
                          <strong> Loading:</strong> {isLoadingHighlights ? 'true' : 'false'} | 
                          <strong> Array:</strong> {Array.isArray(highlights) ? 'yes' : 'no'}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-full px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        onClick={handleEditIntoReel}
                        disabled={isGeneratingReels || highlights.length === 0}
                      >
                        {isGeneratingReels ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Reels...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Edit into Reels ({highlights.length})
                          </>
                        )}
                      </Button>

                      {highlights.length === 0 && !isLoadingHighlights && (
                        <p className="text-sm text-gray-500 text-center mt-2">
                          Waiting for highlights to load...
                        </p>
                      )}

                      {isGeneratingReels && (
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Creating {highlights.length} reels with captions...
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Back Button */}
          {!isLoadingVideo && !isGeneratingReels && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => router.push("/")} className="rounded-full px-8">
                Choose Different Video
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

