/**
 * Example Components Demonstrating API Integration
 * 
 * These components show how to use the various API endpoints.
 * You can copy these patterns into your actual components.
 */

'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/**
 * Example 1: API Key Configuration Component
 * Use this to let users configure their TwelveLabs API key
 */
export function ApiKeyConfig() {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSetApiKey = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await api.setTwelveLabsConfig(apiKey)
      
      if (result.success) {
        setMessage('API key validated successfully!')
        setApiKey('')
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('Failed to validate API key')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Configure TwelveLabs API Key</h3>
      
      <Input
        type="password"
        placeholder="Enter your TwelveLabs API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      
      <Button 
        onClick={handleSetApiKey} 
        disabled={isLoading || !apiKey}
      >
        {isLoading ? 'Validating...' : 'Set API Key'}
      </Button>
      
      {message && (
        <p className={message.includes('Error') ? 'text-red-600' : 'text-green-600'}>
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Example 2: Video Analysis Component
 * Use this to analyze videos with custom prompts
 */
export function VideoAnalyzer({ videoId }: { videoId: string }) {
  const [prompt, setPrompt] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!prompt) return
    
    setIsLoading(true)
    setAnalysis('')
    
    try {
      const result = await api.analyzeVideo(videoId, prompt)
      
      if (result.success) {
        setAnalysis(result.analysis)
      } else {
        setAnalysis(`Error: ${result.error}`)
      }
    } catch (error) {
      setAnalysis('Failed to analyze video')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Analyze Video</h3>
      
      <Textarea
        placeholder="Ask a question about the video (e.g., 'What are the main topics?')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
      />
      
      <Button 
        onClick={handleAnalyze} 
        disabled={isLoading || !prompt}
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </Button>
      
      {analysis && (
        <div className="p-4 bg-gray-50 rounded">
          <p className="whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Example 3: Highlight Generator Component
 * Use this to generate highlights with custom prompts
 */
export function HighlightGenerator({ videoId }: { videoId: string }) {
  const [prompt, setPrompt] = useState('')
  const [highlights, setHighlights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setHighlights([])
    
    try {
      const result = await api.generateHighlights(videoId, prompt || undefined)
      
      if (result.success) {
        setHighlights(result.highlights)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to generate highlights')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Generate Highlights</h3>
      
      <Input
        placeholder="Optional: Custom prompt (e.g., 'Find funny moments')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      
      <Button 
        onClick={handleGenerate} 
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Highlights'}
      </Button>
      
      {highlights.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Highlights Found:</h4>
          {highlights.map((highlight, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <p className="font-medium">{highlight.title}</p>
              <p className="text-sm text-gray-600">
                {highlight.start}s - {highlight.end}s
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Example 4: Transcription Viewer Component
 * Use this to display video transcriptions
 */
export function TranscriptionViewer({ 
  indexId, 
  videoId 
}: { 
  indexId: string
  videoId: string 
}) {
  const [transcription, setTranscription] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGetTranscription = async () => {
    setIsLoading(true)
    
    try {
      const result = await api.getTranscription(indexId, videoId)
      
      if (result.success) {
        setTranscription(result.transcription)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to get transcription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Video Transcription</h3>
      
      <Button 
        onClick={handleGetTranscription} 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Get Transcription'}
      </Button>
      
      {transcription.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transcription.map((segment, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500 mb-1">
                {segment.start}s - {segment.end}s
              </p>
              <p>{segment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Example 5: Index Selector Component
 * Use this to let users select from available indexes
 */
export function IndexSelector({ 
  onSelectIndex 
}: { 
  onSelectIndex: (indexId: string) => void 
}) {
  const [indexes, setIndexes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGetIndexes = async () => {
    setIsLoading(true)
    
    try {
      const result = await api.getIndexes()
      
      if (result.success) {
        setIndexes(result.indexes)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to get indexes')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Select Index</h3>
      
      <Button 
        onClick={handleGetIndexes} 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load Indexes'}
      </Button>
      
      {indexes.length > 0 && (
        <div className="space-y-2">
          {indexes.map((index) => (
            <button
              key={index.id}
              onClick={() => onSelectIndex(index.id)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded text-left"
            >
              <p className="font-medium">{index.name}</p>
              <p className="text-sm text-gray-600">{index.id}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Example 6: Video Upload Only Component
 * Use this to upload a video without processing
 */
export function VideoUploader({ onUploadComplete }: { onUploadComplete: (videoId: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    
    setIsUploading(true)
    
    try {
      const result = await api.uploadVideo(file)
      
      if (result.success) {
        alert('Video uploaded successfully!')
        onUploadComplete(result.video_id)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Upload Video</h3>
      
      <Input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      
      <Button 
        onClick={handleUpload} 
        disabled={isUploading || !file}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  )
}

/**
 * Example 7: Health Check Component
 * Use this to monitor API status
 */
export function HealthCheck() {
  const [health, setHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleHealthCheck = async () => {
    setIsLoading(true)
    
    try {
      const result = await api.healthCheck()
      setHealth(result)
    } catch (error) {
      setHealth({ status: 'error', message: 'Failed to reach API' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">API Health Check</h3>
      
      <Button 
        onClick={handleHealthCheck} 
        disabled={isLoading}
      >
        {isLoading ? 'Checking...' : 'Check Health'}
      </Button>
      
      {health && (
        <div className={`p-4 rounded ${health.status === 'healthy' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-medium">Status: {health.status}</p>
          {health.message && <p className="text-sm">{health.message}</p>}
          {health.timestamp && <p className="text-xs text-gray-600">{health.timestamp}</p>}
        </div>
      )}
    </div>
  )
}

