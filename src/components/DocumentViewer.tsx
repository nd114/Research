import React, { useState, useRef } from 'react'
import { BookOpen, Highlighter as Highlight, MessageSquare, Tag, Download, Share, Search, ZoomIn, ZoomOut, RotateCw, Bookmark, Copy, Eye, EyeOff } from 'lucide-react'
import { Document, Highlight as HighlightType, Annotation } from '../types'

interface DocumentViewerProps {
  document: Document
  onAddHighlight: (highlight: Omit<HighlightType, 'id' | 'createdAt'>) => void
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void
  onUpdateDocument: (updates: Partial<Document>) => void
}

export default function DocumentViewer({
  document,
  onAddHighlight,
  onAddAnnotation,
  onUpdateDocument
}: DocumentViewerProps) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [showHighlights, setShowHighlights] = useState(true)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [highlightColor, setHighlightColor] = useState('#ffeb3b')
  const [zoom, setZoom] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const highlightColors = [
    { name: 'Yellow', value: '#ffeb3b' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Blue', value: '#2196f3' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Purple', value: '#9c27b0' }
  ]

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const text = selection.toString()
      const range = selection.getRangeAt(0)
      
      // Calculate character offsets
      const startOffset = getTextOffset(range.startContainer, range.startOffset)
      const endOffset = getTextOffset(range.endContainer, range.endOffset)
      
      setSelectedText(text)
      setSelectionRange({ start: startOffset, end: endOffset })
    } else {
      setSelectedText('')
      setSelectionRange(null)
    }
  }

  const getTextOffset = (node: Node, offset: number): number => {
    let textOffset = 0
    const walker = document.createTreeWalker(
      contentRef.current!,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentNode
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset
      }
      textOffset += currentNode.textContent?.length || 0
    }
    
    return textOffset
  }

  const handleAddHighlight = () => {
    if (selectedText && selectionRange) {
      onAddHighlight({
        documentId: document.id,
        text: selectedText,
        startOffset: selectionRange.start,
        endOffset: selectionRange.end,
        color: highlightColor,
        tags: [],
        note: ''
      })
      setSelectedText('')
      setSelectionRange(null)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const content = document.content.toLowerCase()
    const query = searchQuery.toLowerCase()
    const results: number[] = []
    
    let index = content.indexOf(query)
    while (index !== -1) {
      results.push(index)
      index = content.indexOf(query, index + 1)
    }
    
    setSearchResults(results)
    setCurrentSearchIndex(0)
  }

  const navigateSearch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return
    
    if (direction === 'next') {
      setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length)
    } else {
      setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)
    }
  }

  const renderContent = () => {
    let content = document.content
    
    // Apply highlights
    if (showHighlights && document.highlights.length > 0) {
      const sortedHighlights = [...document.highlights].sort((a, b) => b.startOffset - a.startOffset)
      
      sortedHighlights.forEach((highlight) => {
        const before = content.substring(0, highlight.startOffset)
        const highlighted = content.substring(highlight.startOffset, highlight.endOffset)
        const after = content.substring(highlight.endOffset)
        
        content = before + 
          `<mark style="background-color: ${highlight.color}; padding: 2px 4px; border-radius: 2px;" title="${highlight.note || 'Highlight'}">${highlighted}</mark>` + 
          after
      })
    }
    
    // Apply search highlighting
    if (searchQuery && searchResults.length > 0) {
      const query = searchQuery
      const regex = new RegExp(`(${query})`, 'gi')
      content = content.replace(regex, '<span class="search-highlight bg-yellow-300 font-semibold">$1</span>')
    }
    
    return content
  }

  return (
    <div className="flex-1 flex bg-gray-50">
      {/* Document Content */}
      <div className="flex-1 flex flex-col">
        {/* Document Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-gray-400" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
                <p className="text-sm text-gray-600">
                  {document.metadata.author} • {document.type.toUpperCase()} • {document.uploadedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHighlights(!showHighlights)}
                className={`p-2 rounded-lg transition-colors ${
                  showHighlights ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Toggle highlights"
              >
                {showHighlights ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`p-2 rounded-lg transition-colors ${
                  showAnnotations ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Toggle annotations"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 hover:bg-gray-100"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-medium">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 hover:bg-gray-100"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search in document..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
            {searchResults.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {currentSearchIndex + 1} of {searchResults.length}
                </span>
                <button
                  onClick={() => navigateSearch('prev')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  ↑
                </button>
                <button
                  onClick={() => navigateSearch('next')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={contentRef}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8"
            style={{ fontSize: `${zoom}%` }}
            onMouseUp={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: renderContent() }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Selection Tools */}
        {selectedText && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="font-medium text-gray-900 mb-3">Selected Text</h3>
            <p className="text-sm text-gray-700 mb-3 p-2 bg-white rounded border">
              "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
            </p>
            
            {/* Highlight Colors */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Highlight Color</label>
              <div className="flex space-x-2">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setHighlightColor(color.value)}
                    className={`w-6 h-6 rounded border-2 ${
                      highlightColor === color.value ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddHighlight}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <Highlight className="w-4 h-4" />
                <span>Highlight</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <MessageSquare className="w-4 h-4" />
                <span>Note</span>
              </button>
            </div>
          </div>
        )}

        {/* Document Info */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Document Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{document.type.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">{Math.round(document.size / 1024)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pages:</span>
              <span className="font-medium">{document.metadata.pages || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Language:</span>
              <span className="font-medium">{document.metadata.language || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">
            Highlights ({document.highlights.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {document.highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <div
                  className="w-full h-1 rounded mb-2"
                  style={{ backgroundColor: highlight.color }}
                />
                <p className="text-xs text-gray-700 line-clamp-2">
                  "{highlight.text}"
                </p>
                {highlight.note && (
                  <p className="text-xs text-gray-500 mt-1">{highlight.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            <button className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">
              <Tag className="w-3 h-3 mr-1" />
              Add Tag
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-medium text-gray-900 mb-3">Metadata</h3>
          <div className="space-y-3 text-sm">
            {document.metadata.author && (
              <div>
                <label className="block text-gray-600 mb-1">Author</label>
                <p className="font-medium">{document.metadata.author}</p>
              </div>
            )}
            {document.metadata.publisher && (
              <div>
                <label className="block text-gray-600 mb-1">Publisher</label>
                <p className="font-medium">{document.metadata.publisher}</p>
              </div>
            )}
            {document.metadata.publicationDate && (
              <div>
                <label className="block text-gray-600 mb-1">Publication Date</label>
                <p className="font-medium">{document.metadata.publicationDate.toLocaleDateString()}</p>
              </div>
            )}
            {document.metadata.isbn && (
              <div>
                <label className="block text-gray-600 mb-1">ISBN</label>
                <p className="font-medium">{document.metadata.isbn}</p>
              </div>
            )}
            {document.metadata.doi && (
              <div>
                <label className="block text-gray-600 mb-1">DOI</label>
                <p className="font-medium">{document.metadata.doi}</p>
              </div>
            )}
            {document.metadata.url && (
              <div>
                <label className="block text-gray-600 mb-1">URL</label>
                <a
                  href={document.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 break-all"
                >
                  {document.metadata.url}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}