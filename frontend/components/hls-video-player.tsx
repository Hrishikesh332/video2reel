"use client"

import { useEffect, useRef } from "react"
import { Play } from "lucide-react"

interface HLSVideoPlayerProps {
  src: string
  poster?: string
  className?: string
  alt?: string
}

export function HLSVideoPlayer({ src, poster, className = "", alt = "Video" }: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Check if the video source is HLS (.m3u8)
    const isHLS = src.includes(".m3u8")

    if (isHLS) {
      // Check if HLS is natively supported (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src
      } else {
        // Use hls.js for other browsers
        const loadHLS = async () => {
          const Hls = (await import("hls.js")).default

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
            })

            hls.loadSource(src)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed, ready to play")
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log("Network error, trying to recover...")
                    hls.startLoad()
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log("Media error, trying to recover...")
                    hls.recoverMediaError()
                    break
                  default:
                    console.error("Fatal error, cannot recover")
                    hls.destroy()
                    break
                }
              }
            })

            // Cleanup
            return () => {
              hls.destroy()
            }
          }
        }

        loadHLS()
      }
    } else {
      // Regular MP4 video
      video.src = src
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      controls
      className={className}
      poster={poster}
      playsInline
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  )
}

export function VideoPlayerFallback({ thumbnail, alt }: { thumbnail?: string; alt: string }) {
  if (thumbnail) {
    return (
      <div className="relative w-full h-full">
        <img src={thumbnail} alt={alt} className="w-full h-full object-contain" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center text-white p-4">
            <Play className="w-12 h-12 mx-auto mb-2 opacity-75" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full bg-black">
      <Play className="w-16 h-16 text-gray-400" />
    </div>
  )
}

