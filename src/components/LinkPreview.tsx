import React, { useState, useEffect } from 'react'
import { ExternalLink, Globe } from 'lucide-react'

interface LinkPreviewProps {
  url: string
  className?: string
}

interface LinkData {
  title: string
  description: string
  image?: string
  domain: string
}

export default function LinkPreview({ url, className = '' }: LinkPreviewProps) {
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        // In a real app, you'd use a backend service for this
        // For demo purposes, we'll extract basic info from the URL
        const domain = new URL(url).hostname
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setLinkData({
          title: `Page from ${domain}`,
          description: 'Link preview would show actual page content in a real implementation',
          domain: domain
        })
      } catch (err) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLinkData()
  }, [url])

  if (isLoading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !linkData) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 ${className}`}
      >
        <ExternalLink className="w-4 h-4" />
        <span>{url}</span>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors ${className}`}
    >
      <div className="flex space-x-3">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{linkData.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{linkData.description}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <ExternalLink className="w-3 h-3 mr-1" />
            <span>{linkData.domain}</span>
          </div>
        </div>
      </div>
    </a>
  )
}