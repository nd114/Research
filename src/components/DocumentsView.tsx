import React, { useState } from 'react'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Grid,
  List,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Calendar,
  Tag,
  MoreVertical,
  Star
} from 'lucide-react'
import { Document, DocumentType } from '../types'

interface DocumentsViewProps {
  documents: Document[]
  onNavigate: (view: string, id?: string) => void
  onUploadDocument: () => void
  onUpdateDocument: (id: string, updates: Partial<Document>) => void
  onDeleteDocument: (id: string) => void
}

export default function DocumentsView({
  documents,
  onNavigate,
  onUploadDocument,
  onUpdateDocument,
  onDeleteDocument
}: DocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'uploaded' | 'name' | 'size' | 'type'>('uploaded')

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = searchQuery === '' || 
      document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.metadata.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || document.type === filterType
    
    return matchesSearch && matchesType
  })

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title)
      case 'size':
        return b.size - a.size
      case 'type':
        return a.type.localeCompare(b.type)
      case 'uploaded':
      default:
        return b.uploadedAt.getTime() - a.uploadedAt.getTime()
    }
  })

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PDF:
      case DocumentType.DOCX:
      case DocumentType.TXT:
      case DocumentType.HTML:
      case DocumentType.MARKDOWN:
        return FileText
      case DocumentType.IMAGE:
        return Image
      case DocumentType.VIDEO:
        return Film
      case DocumentType.AUDIO:
        return Music
      default:
        return FileText
    }
  }

  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PDF:
        return 'bg-red-100 text-red-800'
      case DocumentType.DOCX:
        return 'bg-blue-100 text-blue-800'
      case DocumentType.IMAGE:
        return 'bg-green-100 text-green-800'
      case DocumentType.VIDEO:
        return 'bg-purple-100 text-purple-800'
      case DocumentType.AUDIO:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">{documents.length} documents • {formatFileSize(documents.reduce((total, doc) => total + doc.size, 0))} total</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onUploadDocument}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {Object.values(DocumentType).map(type => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="uploaded">Date Uploaded</option>
            <option value="name">Name</option>
            <option value="size">File Size</option>
            <option value="type">Type</option>
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
      </div>

      {/* Documents Content */}
      <div className="p-6">
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' 
                ? 'No documents found' 
                : 'No documents yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to start building your research library'
              }
            </p>
            <button
              onClick={onUploadDocument}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {sortedDocuments.map((document) => {
              const Icon = getDocumentIcon(document.type)
              
              return (
                <div
                  key={document.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                    viewMode === 'grid' ? 'p-4' : 'p-4'
                  }`}
                  onClick={() => onNavigate('document', document.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{document.title}</h3>
                          {document.metadata.author && (
                            <p className="text-sm text-gray-600 truncate">{document.metadata.author}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(document.type)}`}>
                            {document.type.toUpperCase()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Show document menu
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Document Details */}
                      <div className="mt-2 space-y-1 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Size: {formatFileSize(document.size)}</span>
                          {document.metadata.pages && (
                            <span>{document.metadata.pages} pages</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uploaded: {document.uploadedAt.toLocaleDateString()}</span>
                          <span>{document.highlights.length} highlights</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {document.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {document.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{document.tags.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onNavigate('document', document.id)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="View document"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Download document
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 rounded"
                            title="Download"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Edit document metadata
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Edit metadata"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteDocument(document.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}