import React, { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  FolderOpen,
  Home,
  Quote,
  BookOpen,
  Settings
} from 'lucide-react'
import { Page } from '../types'

interface SidebarProps {
  pages: Page[]
  currentPageId: string
  currentView: string
  onNavigate: (view: string, id?: string) => void
  onCreatePage: () => void
  onDeletePage: (id: string) => void
  onToggleStar: (id: string) => void
}

export default function Sidebar({
  pages,
  currentPageId,
  currentView,
  onNavigate,
  onCreatePage,
  onDeletePage,
  onToggleStar
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const starredPages = filteredPages.filter(page => page.isStarred)
  const recentPages = filteredPages
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 10)

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Research App</h1>
      </div>

      {/* Navigation */}
      <div className="p-2 border-b border-gray-200">
        <nav className="space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('notes')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
              currentView === 'notes' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Notes</span>
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
              currentView === 'projects' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Projects</span>
          </button>
          <button
            onClick={() => onNavigate('documents')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
              currentView === 'documents' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Documents</span>
          </button>
          <button
            onClick={() => onNavigate('citations')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
              currentView === 'citations' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Quote className="w-4 h-4" />
            <span>Citations</span>
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto">
        {/* New Note Button */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={onCreatePage}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Starred Pages */}
        {starredPages.length > 0 && (
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Starred
            </h3>
            <div className="space-y-1">
              {starredPages.map((page) => (
                <div
                  key={page.id}
                  className={`group flex items-center space-x-2 px-2 py-1 rounded cursor-pointer ${
                    currentPageId === page.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onNavigate('note', page.id)}
                >
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{page.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleStar(page.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                  >
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Recent Notes
          </h3>
          <div className="space-y-1">
            {recentPages.map((page) => (
              <div
                key={page.id}
                className={`group flex items-center space-x-2 px-2 py-1 rounded cursor-pointer ${
                  currentPageId === page.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onNavigate('note', page.id)}
              >
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{page.title}</p>
                  <p className="text-xs text-gray-500">
                    {page.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleStar(page.id)
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Star 
                      className={`w-3 h-3 ${page.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                      fill={page.isStarred ? 'currentColor' : 'none'}
                    />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePage(page.id)
                      }}
                      className="p-1 hover:bg-gray-200 rounded text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button className="w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg hover:bg-gray-100 text-gray-700">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}