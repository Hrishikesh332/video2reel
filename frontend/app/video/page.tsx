"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { FileVideo, Clock, Maximize2, Film, HardDrive } from "lucide-react"
import { api } from "@/lib/api"

interface VideoMetadata {
  size: string
  resolution: string
  fps: number
  format: string
  duration: string
}

export default function VideoPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [posterUrl, setPosterUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  useEffect(() => {
    const storedVideoUrl = sessionStorage.getItem("uploadedVideo")
    const storedVideoFile = sessionStorage.getItem("uploadedVideoFile")

    if (!storedVideoUrl) {
      router.push("/")
      return
    }
    setVideoUrl(storedVideoUrl)

    if (storedVideoFile) {
      fetch(storedVideoUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], storedVideoFile, { type: blob.type })
          setVideoFile(file)
        })
        .catch((err) => console.error("[v0] Error reconstructing file:", err))
    }
  }, [router])

  const extractFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = 480
    canvas.height = 340

    context.drawImage(video, 0, 0, 480, 340)

    const frameUrl = canvas.toDataURL("image/jpeg")
    setPosterUrl(frameUrl)
  }

  const handleVideoLoadedMetadata = async () => {
    const video = videoRef.current
    if (!video) return

    const frameTime = 5 / 30

    video.currentTime = frameTime

    const duration = video.duration
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2)

      setMetadata({
        size: `${sizeInMB} MB`,
        resolution: `${video.videoWidth} x ${video.videoHeight}`,
        fps: 30,
        format: blob.type.split("/")[1].toUpperCase() || "MP4",
        duration: durationStr,
      })
    } catch (error) {
      console.error("[v0] Error extracting metadata:", error)
    }
  }

  const handleSeeked = () => {
    extractFrame()
  }

  const handleGenerateReels = async () => {
    if (!videoFile) {
      console.error("[v0] No video file available")
      return
    }

    setIsGenerating(true)

    try {
      console.log("[v0] Sending video to Video2Reel API...")

      const data = await api.uploadAndProcess(videoFile, {
        add_captions: true,
        resize_method: "crop",
      })

      console.log("[v0] API Response:", data)

      if (data.success) {
        sessionStorage.setItem("generatedReels", JSON.stringify(data.reels))
        sessionStorage.setItem("reelsCount", data.reels_created.toString())
        router.push("/generating")
      } else {
        console.error("[v0] API Error:", data.error)
        alert("Failed to generate reels. Please try again.")
        setIsGenerating(false)
      }
    } catch (error) {
      console.error("[v0] Error generating reels:", error)
      alert("An error occurred while generating reels. Please try again.")
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8f5e3] flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg" />
            <span className="font-bold text-lg">Reelify</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 text-balance">Your uploaded video</h1>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileVideo className="w-5 h-5" />
                Video Preview
              </h2>
              {videoUrl && (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={posterUrl}
                    controls
                    className="rounded-2xl w-full shadow-lg"
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onSeeked={handleSeeked}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Video Details</h2>

              {metadata ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#e8f5e3] rounded-xl flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500">File Size</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-13">{metadata.size}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#e8f5e3] rounded-xl flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500">Resolution</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-13">{metadata.resolution}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#e8f5e3] rounded-xl flex items-center justify-center">
                        <Film className="w-5 h-5 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500">Frame Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-13">{metadata.fps} FPS</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#e8f5e3] rounded-xl flex items-center justify-center">
                        <FileVideo className="w-5 h-5 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500">Format</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-13">{metadata.format}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#e8f5e3] rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500">Duration</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 ml-13">{metadata.duration}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading metadata...</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/")}
              className="rounded-full border-2 border-gray-300 hover:border-gray-400 px-8"
            >
              Upload Another
            </Button>
            <Button
              size="lg"
              className="bg-black hover:bg-black/90 text-white rounded-full px-8"
              onClick={handleGenerateReels}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate reels"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
