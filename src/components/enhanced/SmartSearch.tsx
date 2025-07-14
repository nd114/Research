import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Clock, Star, FileText, Quote, BookOpen } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'page' | 'project' | 'document' | 'citation'
  title: string
  content: string
  relevance: number
  metadata?: any
}

interface SmartSearchProps {
  onSearch: (query: string, filters: any) => Promise<SearchResult[]>
  onSelectResult: (result: SearchResult) => void
  placeholder?: string
}

export default function SmartSearch({ onSearch, onSelectResult, placeholder }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    types: [] as string[],
    dateRange: null as { start: Date; end: Date } | null,
    tags: [] as string[]
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const searchResults = await onSearch(query, filters)
        setResults(searchResults)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filters, onSearch])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex])
        } else if (query.trim()) {
          saveRecentSearch(query.trim())
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result)
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(-1)
    saveRecentSearch(query.trim())
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return FileText
      case 'project':
        return Star
      case 'document':
        return BookOpen
      case 'citation':
        return Quote
      default:
        return FileText
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search across all your research..."}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Filter Button */}
        <button
          onClick={() => {/* TODO: Open filter modal */}}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                <Clock className="w-3 h-3" />
                <span>Recent Searches</span>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      inputRef.current?.focus()
                    }}
                    className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = getTypeIcon(result.type)
                const isSelected = index === selectedIndex
                
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-l-2 ${
                      isSelected ? 'bg-blue-50 border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 
                            className="font-medium text-gray-900 truncate"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.title, query) 
                            }}
                          />
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {result.type}
                          </span>
                        </div>
                        <p 
                          className="text-sm text-gray-600 line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightMatch(result.content.substring(0, 150), query) 
                          }}
                        />
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                            <span className="text-xs text-gray-500">
                              {Math.round(result.relevance * 100)}% match
                            </span>
                          </div>
                          {result.metadata?.tags && (
                            <div className="flex space-x-1">
                              {result.metadata.tags.slice(0, 2).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
            </div>
          )}

          {/* Search Tips */}
          {query.length < 2 && recentSearches.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Start typing to search across all your research</p>
              <div className="text-xs mt-2 space-y-1">
                <p>• Search in notes, projects, documents, and citations</p>
                <p>• Use quotes for exact phrases</p>
                <p>• Filter by type, date, or tags</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}