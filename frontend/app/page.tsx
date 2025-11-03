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
  filename: string
  duration: number
  created_at: string
}

export default function LandingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [videos, setVideos] = useState<VideoType[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true)
      try {
        const data = await api.getVideos("6908f3065289027faefed556", 1)
        
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

  const handleVideoSelect = async (videoId: string) => {
    setSelectedVideoId(videoId)
    const selectedVideo = videos.find((v) => v.id === videoId)
    if (!selectedVideo) return

    setIsProcessing(true)

    try {
      sessionStorage.setItem("selectedVideoId", videoId)
      sessionStorage.setItem("selectedVideoFilename", selectedVideo.filename)
      sessionStorage.setItem("processingFromLibrary", "true")

      const data = await api.selectAndProcess(videoId, {
        add_captions: true,
        resize_method: "crop",
      })

      if (data.success) {
        sessionStorage.setItem("generatedReels", JSON.stringify(data.reels))
        sessionStorage.setItem("reelsCount", data.reels_created.toString())
        router.push("/generating")
      } else {
        console.error("API Error:", data.error)
        alert("Failed to generate reels. Please try again.")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Error processing video:", error)
      alert("An error occurred while processing the video. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8f5e3] flex flex-col">
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg" />
              <span className="font-bold text-lg">Reelify</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Product
              </a>
              <span className="text-gray-300">.</span>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Solutions
              </a>
              <span className="text-gray-300">.</span>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <span className="text-gray-300">.</span>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Developers
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Log in
            </Button>
            <Button className="bg-black hover:bg-black/90 text-white rounded-full px-6">Get it Now — It's Free</Button>
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
            <h1 className="text-7xl lg:text-8xl font-bold leading-none tracking-tight">Reels</h1>

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
                <div className="text-sm text-gray-600 font-medium">Or select from your library</div>
                <Select
                  value={selectedVideoId}
                  onValueChange={handleVideoSelect}
                  disabled={isLoadingVideos || isProcessing}
                >
                  <SelectTrigger className="w-full max-w-md bg-white rounded-full h-12 px-6 border-2 border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50">
                    <SelectValue
                      placeholder={
                        isProcessing ? "Processing video..." : isLoadingVideos ? "Loading videos..." : "Select a video"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-w-md">
                    {videos.map((video) => (
                      <SelectItem key={video.id} value={video.id} className="cursor-pointer">
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-10 h-10 bg-[#e8f5e3] rounded-lg flex items-center justify-center flex-shrink-0">
                            {/* Video icon */}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm truncate">{video.filename}</span>
                            <span className="text-xs text-gray-500">
                              {Math.floor(video.duration / 60)}:
                              {String(Math.floor(video.duration % 60)).padStart(2, "0")} min
                            </span>
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
                {isProcessing && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Starting reel generation...
                  </div>
                )}
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
                src="/images/design-mode/Screenshot%202025-11-03%20at%2020.21.47.png"
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
