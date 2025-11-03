"use client"

import { Loader2, Download, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Reel {
  path: string
  filename: string
  download_url: string
  highlight: {
    title: string
    start: number
    end: number
  }
}

export default function GeneratingPage() {
  const router = useRouter()
  const [reels, setReels] = useState<Reel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reelsCount, setReelsCount] = useState(0)

  useEffect(() => {
    const storedReels = sessionStorage.getItem("generatedReels")
    const storedCount = sessionStorage.getItem("reelsCount")

    if (storedReels && storedCount) {
      setTimeout(() => {
        setReels(JSON.parse(storedReels))
        setReelsCount(Number.parseInt(storedCount))
        setIsLoading(false)
      }, 2000)
    } else {
      setTimeout(() => {
        router.push("/")
      }, 3000)
    }
  }, [router])

  const handleDownload = (downloadUrl: string, filename: string) => {
    // Extract filename from download_url if needed
    const filenamePart = downloadUrl.split('/').pop() || filename
    api.downloadReel(filenamePart)
  }

  const handleDownloadAll = () => {
    reels.forEach((reel) => {
      const filenamePart = reel.download_url.split('/').pop() || reel.filename
      api.downloadReel(filenamePart)
    })
  }

  return (
    <div className="min-h-screen bg-[#e8f5e3] flex flex-col p-8">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg" />
          <span className="font-bold text-xl text-gray-900">Reelify</span>
        </div>
      </div>

      {/* Loading or Success indicator */}
      <div className="flex flex-col items-center mb-12">
        {isLoading ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">Making reels</h2>
            <p className="text-gray-600 mt-2">This may take a few moments...</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">{reelsCount} reels created!</h2>
            <p className="text-gray-600 mt-2">Your reels are ready to download</p>
            <Button
              onClick={handleDownloadAll}
              className="mt-4 bg-black hover:bg-black/90 text-white rounded-full px-8"
            >
              Download All Reels
            </Button>
          </>
        )}
      </div>

      {/* Skeleton loaders or actual reels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {isLoading ? (
          <>
            {/* Skeleton loaders */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
                <Skeleton className="w-full aspect-[9/16] rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Actual reels */}
            {reels.map((reel, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-100">
                  <video
                    src={api.getDownloadUrl(reel.download_url.split('/').pop() || reel.filename)}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{reel.highlight.title}</h3>
                  <p className="text-sm text-gray-500">
                    {Math.floor(reel.highlight.start)}s - {Math.floor(reel.highlight.end)}s
                  </p>
                  <Button
                    onClick={() => handleDownload(reel.download_url, reel.filename)}
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {!isLoading && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="rounded-full border-2 border-gray-300 hover:border-gray-400 px-8"
          >
            Create More Reels
          </Button>
        </div>
      )}
    </div>
  )
}
