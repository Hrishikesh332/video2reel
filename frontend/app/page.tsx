"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, TrendingUp, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { api } from "@/lib/api"

interface VideoType {
  id: string
  name: string
  duration: number
  thumbnail_url?: string
  video_url?: string
  width?: number
  height?: number
  fps?: number
  size?: number
}

export default function LandingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [videos, setVideos] = useState<VideoType[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string>("")

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true)
      try {
        const data = await api.getVideos("69091350754d7f2962cb7284", 1)
        
        if (data.success && data.videos) {
          setVideos(data.videos)
        }
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setIsLoadingVideos(false)
      }
    }

    fetchVideos()
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const preview = URL.createObjectURL(file)
      sessionStorage.setItem("uploadedVideo", preview)
      sessionStorage.setItem("uploadedVideoFile", file.name)
      router.push("/video")
    }
  }

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId)
    const selectedVideo = videos.find((v) => v.id === videoId)
    if (selectedVideo) {
      sessionStorage.setItem("selectedVideoId", videoId)
      sessionStorage.setItem("selectedVideoFilename", selectedVideo.name)
      sessionStorage.setItem("indexId", "69091350754d7f2962cb7284")
    }
  }

  const handleGenerateReel = () => {
    if (!selectedVideoId) {
      alert("Please select a video first")
      return
    }
    router.push("/analyze")
  }

  return (
    <div className="min-h-screen bg-[#e8f5e3] flex flex-col">
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Image
                src="/images/design-mode/logo.png"
                alt="logo"
                width={40}
                height={40}
                className="w-8 h-8"
                priority
              />
              <span className="font-bold text-lg">Reelify</span>
            </div>
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Rating Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <div className="font-bold text-lg">5.0 Rated</div>
                <a href="#" className="text-sm underline hover:no-underline">
                  Read Our Success Stories
                </a>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-7xl lg:text-8xl font-bold leading-none tracking-tight">Reelify</h1>

            <div className="w-full h-px bg-gray-300" />

            {/* Subheading */}
            <p className="text-2xl lg:text-3xl leading-relaxed text-gray-800">
              Engage Viewers, Boost Sales, And Harness User Content With AI{" "}
              <span className="font-bold">30X Faster</span>
            </p>

            {/* Stats */}
            <div className="flex items-start gap-4 p-6 bg-white/50 rounded-2xl border border-gray-200">
              <Sparkles className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <div className="text-lg">
                  Get much as up to <span className="font-bold text-2xl">200%</span>
                  <span className="mx-2">/</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 fill-black" />
                    <span className="font-bold">5.0</span>
                  </span>
                </div>
                <div className="text-gray-600">Viewership.</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <div className="w-full space-y-3">
                <div className="text-sm text-gray-600 font-medium">Or select from our public library</div>
                <div className="flex gap-3 items-center">
                  <Select
                    value={selectedVideoId}
                    onValueChange={handleVideoSelect}
                    disabled={isLoadingVideos}
                  >
                    <SelectTrigger className="flex-1 max-w-md bg-white rounded-full h-12 px-6 border-2 border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50">
                      <SelectValue
                        placeholder={isLoadingVideos ? "Loading videos..." : "Select a video"}
                      />
                    </SelectTrigger>
                  <SelectContent className="max-w-2xl">
                    {videos.map((video) => (
                      <SelectItem key={video.id} value={video.id} className="cursor-pointer">
                        <div className="flex items-center gap-3 py-2">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                  e.currentTarget.parentElement!.innerHTML = `<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`
                                }}
                              />
                            ) : (
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                          {/* Video Info */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-sm truncate" title={video.name}>
                              {video.name}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
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
                                {Math.floor(video.duration / 60)}:
                                {String(Math.floor(video.duration % 60)).padStart(2, "0")}
                              </span>
                              {video.width && video.height && (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                    />
                                  </svg>
                                  {video.width}×{video.height}
                                </span>
                              )}
                              {video.size && (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {(video.size / (1024 * 1024)).toFixed(1)} MB
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    {videos.length === 0 && !isLoadingVideos && (
                      <SelectItem value="no-videos" disabled>
                        No videos available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedVideoId && (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-full px-8"
                    onClick={handleGenerateReel}
                  >
                    Generate Reel
                  </Button>
                )}
                </div>
              </div>

              <Button
                size="lg"
                className="bg-black hover:bg-black/90 text-white rounded-full px-8 text-base"
                onClick={handleUploadClick}
              >
                Upload Your Video — It's Free
              </Button>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/design-mode/hero_image_2.png"
                alt="Hero image"
                width={800}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-8 right-8 bg-yellow-300 rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Increase in Engagement</span>
            </div>

            <div className="absolute bottom-32 left-8 bg-white rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">How is the fit?</span>
            </div>

            <div className="absolute bottom-16 left-8 bg-white rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">Do you like the design?</span>
            </div>
          </div>
        </div>
      </main>

      {/* Company Logos */}
      
    </div>
  )
}
