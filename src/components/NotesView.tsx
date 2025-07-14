import React, { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Calendar,
  Tag,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Trash2
} from 'lucide-react'
import { Page } from '../types'

interface NotesViewProps {
  pages: Page[]
  onNavigate: (view: string, id?: string) => void
  onCreatePage: () => void
  onDeletePage: (id: string) => void
  onToggleStar: (id: string) => void
}

export default function NotesView({
  pages,
  onNavigate,
  onCreatePage,
  onDeletePage,
  onToggleStar
}: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'recent'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const filteredPages = pages.filter(page => {
    const matchesSearch = searchQuery === '' || 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'starred' && page.isStarred) ||
      (filterBy === 'recent' && new Date().getTime() - page.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000)
    
    return matchesSearch && matchesFilter
  })

  const sortedPages = [...filteredPages].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'created':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updated':
      default:
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleSort = (field: 'updated' | 'created' | 'title') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Notes</h1>
            <p className="text-gray-600 mt-1">{pages.length} notes total</p>
          </div>
          <button
            onClick={onCreatePage}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'starred' | 'recent')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Notes</option>
            <option value="starred">Starred</option>
            <option value="recent">Recent (7 days)</option>
          </select>

          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            onClick={() => toggleSort('updated')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              sortBy === 'updated' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Updated</span>
            {sortBy === 'updated' && (
              sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => toggleSort('created')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              sortBy === 'created' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Created</span>
            {sortBy === 'created' && (
              sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => toggleSort('title')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              sortBy === 'title' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Title</span>
            {sortBy === 'title' && (
              sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Notes Content */}
      <div className="p-6">
        {sortedPages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterBy !== 'all' ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first note to get started'
              }
            </p>
            <button
              onClick={onCreatePage}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {sortedPages.map((page) => (
              <div
                key={page.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'grid' ? 'p-4' : 'p-6'
                }`}
                onClick={() => onNavigate('note', page.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{page.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Updated {page.updatedAt.toLocaleDateString()}
                      </span>
                      {page.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleStar(page.id)
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title={page.isStarred ? 'Remove star' : 'Add star'}
                    >
                      <Star 
                        className={`w-4 h-4 ${page.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                        fill={page.isStarred ? 'currentColor' : 'none'}
                      />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeletePage(page.id)
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Content Preview */}
                <p className={`text-gray-600 mb-3 ${viewMode === 'grid' ? 'text-sm line-clamp-3' : 'line-clamp-2'}`}>
                  {page.content.substring(0, 150)}{page.content.length > 150 ? '...' : ''}
                </p>

                {/* Tags */}
                {page.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-3 h-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {page.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {page.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{page.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>Created {page.createdAt.toLocaleDateString()}</span>
                  <span>{page.content.length} characters</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}