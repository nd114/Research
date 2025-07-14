import React, { useState, useRef, useEffect } from 'react'
import { 
  PanelLeftClose, 
  PanelRightClose, 
  Monitor, 
  Star,
  Globe,
  Download,
  Settings,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Bookmark,
  BookmarkPlus,
  Copy,
  X
} from 'lucide-react'
import Editor from './Editor'
import { Page } from '../types'

interface SplitViewProps {
  currentPage: Page | undefined
  onUpdatePage: (id: string, updates: Partial<Page>) => void
  onClipPage: (title: string, content: string, url: string) => void
  onToggleStar: (id: string) => void
  onShowWebClipper: () => void
  onShowExportModal: () => void
  onShowFullBrowser: () => void
}

interface Bookmark {
  id: string
  title: string
  url: string
}

export default function SplitView({ 
  currentPage, 
  onUpdatePage, 
  onClipPage, 
  onToggleStar,
  onShowWebClipper,
  onShowExportModal,
  onShowFullBrowser
}: SplitViewProps) {
  const [showBrowser, setShowBrowser] = useState(false)
  const [splitRatio, setSplitRatio] = useState(60) // Percentage for left panel (notes)
  const [isDragging, setIsDragging] = useState(false)
  const [url, setUrl] = useState('https://www.google.com')
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com')
  const [isLoading, setIsLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com' },
    { id: '2', title: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { id: '3', title: 'GitHub', url: 'https://github.com' },
    { id: '4', title: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100
    setSplitRatio(Math.max(30, Math.min(80, newRatio)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const handleNavigate = (newUrl: string) => {
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl
    }
    setIsLoading(true)
    setCurrentUrl(newUrl)
    setUrl(newUrl)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNavigate(url)
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
      setIsLoading(true)
    }
  }

  const addBookmark = () => {
    try {
      const title = iframeRef.current?.contentDocument?.title || new URL(currentUrl).hostname
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: title,
        url: currentUrl
      }
      setBookmarks([...bookmarks, newBookmark])
    } catch (error) {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: 'Bookmarked Page',
        url: currentUrl
      }
      setBookmarks([...bookmarks, newBookmark])
    }
  }

  const handleClipCurrentPage = async () => {
    try {
      const iframe = iframeRef.current
      if (!iframe || !iframe.contentDocument) {
        throw new Error('Cannot access iframe content')
      }

      const title = iframe.contentDocument.title || 'Untitled'
      const bodyText = iframe.contentDocument.body?.innerText || ''
      const content = `# ${title}\n\n**Source:** ${currentUrl}\n\n${bodyText.substring(0, 1000)}${bodyText.length > 1000 ? '...' : ''}\n\n*Clipped from research browser*`
      
      onClipPage(title, content, currentUrl)
    } catch (error) {
      // Fallback for cross-origin restrictions
      const title = `Page from ${new URL(currentUrl).hostname}`
      const content = `# ${title}\n\n**Source:** ${currentUrl}\n\n*Page content could not be extracted due to security restrictions*\n\n*Clipped from research browser*`
      onClipPage(title, content, currentUrl)
    }
  }

  const copyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = currentUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      })
    }
  }

  if (!showBrowser) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Single Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {currentPage?.title || 'Untitled'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => currentPage && onToggleStar(currentPage.id)}
              className={`p-2 rounded-lg transition-colors ${
                currentPage?.isStarred
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className="w-5 h-5" fill={currentPage?.isStarred ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onShowWebClipper}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              title="Clip from web"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={onShowExportModal}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              title="Export pages"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowBrowser(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              <span>Research Mode</span>
            </button>
            <button
              onClick={onShowFullBrowser}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              title="Full browser"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        {currentPage && (
          <Editor
            page={currentPage}
            onUpdatePage={(updates) => onUpdatePage(currentPage.id, updates)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Research Mode Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">Research Mode</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>•</span>
            <span>{currentPage?.title || 'Untitled'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSplitRatio(40)}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            title="Focus on browser"
          >
            <PanelRightClose className="w-3 h-3" />
          </button>
          <button
            onClick={() => setSplitRatio(60)}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            title="Balanced view"
          >
            <Monitor className="w-3 h-3" />
          </button>
          <button
            onClick={() => setSplitRatio(80)}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            title="Focus on notes"
          >
            <PanelLeftClose className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowBrowser(false)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Exit Research Mode
          </button>
        </div>
      </header>

      {/* Split View Content */}
      <div ref={containerRef} className="flex-1 flex">
        {/* Notes Panel */}
        <div 
          className="bg-white flex flex-col border-r border-gray-200"
          style={{ width: `${splitRatio}%` }}
        >
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Notes</h3>
            <button
              onClick={() => currentPage && onToggleStar(currentPage.id)}
              className={`p-1 rounded transition-colors ${
                currentPage?.isStarred
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className="w-4 h-4" fill={currentPage?.isStarred ? 'currentColor' : 'none'} />
            </button>
          </div>
          {currentPage && (
            <Editor
              page={currentPage}
              onUpdatePage={(updates) => onUpdatePage(currentPage.id, updates)}
            />
          )}
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
        />

        {/* Browser Panel */}
        <div 
          className="flex flex-col bg-gray-50"
          style={{ width: `${100 - splitRatio}%` }}
        >
          {/* Browser Controls */}
          <div className="bg-gray-100 border-b border-gray-200 p-2">
            <div className="flex items-center space-x-2 mb-2">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => iframeRef.current?.contentWindow?.history.back()}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => iframeRef.current?.contentWindow?.history.forward()}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Forward"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Refresh"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigate('https://www.google.com')}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Home"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>

              {/* URL Bar */}
              <form onSubmit={handleUrlSubmit} className="flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL or search..."
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </form>

              {/* Browser Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Bookmarks"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={addBookmark}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Add Bookmark"
                >
                  <BookmarkPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={copyUrl}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClipCurrentPage}
                  className="p-1 rounded hover:bg-gray-200 text-green-600"
                  title="Clip this page to notes"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bookmarks Bar */}
            {showBookmarks && (
              <div className="flex items-center space-x-2 overflow-x-auto">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="flex items-center group">
                    <button
                      onClick={() => handleNavigate(bookmark.url)}
                      className="flex items-center space-x-1 px-2 py-1 bg-white rounded text-xs hover:bg-gray-50 border border-gray-200 whitespace-nowrap"
                    >
                      <Globe className="w-3 h-3 text-gray-400" />
                      <span>{bookmark.title}</span>
                    </button>
                    <button
                      onClick={() => setBookmarks(bookmarks.filter(b => b.id !== bookmark.id))}
                      className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Browser Content */}
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-none"
              title="Research Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}