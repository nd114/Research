import React, { useState } from 'react'
import { 
  Quote, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Edit, 
  Trash2,
  BookOpen,
  FileText,
  Globe,
  Newspaper,
  Users,
  Calendar,
  Tag,
  ExternalLink
} from 'lucide-react'
import { Citation, CitationType, CitationStyle, Author } from '../types'

interface CitationManagerProps {
  citations: Citation[]
  onCreateCitation: (citation: Omit<Citation, 'id'>) => void
  onUpdateCitation: (id: string, updates: Partial<Citation>) => void
  onDeleteCitation: (id: string) => void
  onExportBibliography: (citations: Citation[], style: CitationStyle) => void
}

export default function CitationManager({
  citations,
  onCreateCitation,
  onUpdateCitation,
  onDeleteCitation,
  onExportBibliography
}: CitationManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<CitationType | 'all'>('all')
  const [selectedCitations, setSelectedCitations] = useState<string[]>([])
  const [showNewCitation, setShowNewCitation] = useState(false)
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null)
  const [citationStyle, setCitationStyle] = useState<CitationStyle>(CitationStyle.APA)

  const citationTypes = Object.values(CitationType)
  const citationStyles = Object.values(CitationStyle)

  const filteredCitations = citations.filter(citation => {
    const matchesSearch = searchQuery === '' || 
      citation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citation.authors.some(author => 
        `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    const matchesType = selectedType === 'all' || citation.type === selectedType
    
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: CitationType) => {
    switch (type) {
      case CitationType.BOOK:
        return BookOpen
      case CitationType.JOURNAL_ARTICLE:
        return FileText
      case CitationType.WEBSITE:
        return Globe
      case CitationType.NEWSPAPER:
        return Newspaper
      default:
        return Quote
    }
  }

  const formatCitation = (citation: Citation, style: CitationStyle): string => {
    const authors = citation.authors.map(a => `${a.lastName}, ${a.firstName}`).join(', ')
    const year = citation.publicationDate?.getFullYear() || 'n.d.'
    
    switch (style) {
      case CitationStyle.APA:
        return `${authors} (${year}). ${citation.title}. ${citation.publisher || citation.journal || ''}.`
      case CitationStyle.MLA:
        return `${authors}. "${citation.title}." ${citation.journal || citation.publisher || ''}, ${year}.`
      case CitationStyle.CHICAGO:
        return `${authors}. "${citation.title}." ${citation.journal || citation.publisher || ''} (${year}).`
      default:
        return `${authors} (${year}). ${citation.title}.`
    }
  }

  const handleSelectCitation = (id: string) => {
    setSelectedCitations(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedCitations.length === filteredCitations.length) {
      setSelectedCitations([])
    } else {
      setSelectedCitations(filteredCitations.map(c => c.id))
    }
  }

  const handleExportSelected = () => {
    const selected = citations.filter(c => selectedCitations.includes(c.id))
    onExportBibliography(selected, citationStyle)
  }

  const handleCopyCitation = (citation: Citation) => {
    const formatted = formatCitation(citation, citationStyle)
    navigator.clipboard.writeText(formatted)
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citation Manager</h1>
            <p className="text-gray-600 mt-1">{citations.length} citations</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {citationStyles.map(style => (
                <option key={style} value={style}>
                  {style.toUpperCase()}
                </option>
              ))}
            </select>
            {selectedCitations.length > 0 && (
              <button
                onClick={handleExportSelected}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export ({selectedCitations.length})</span>
              </button>
            )}
            <button
              onClick={() => setShowNewCitation(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Citation</span>
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
              placeholder="Search citations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as CitationType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {citationTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          {filteredCitations.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedCitations.length === filteredCitations.length}
                onChange={() => {}}
                className="rounded"
              />
              <span>Select All</span>
            </button>
          )}
        </div>
      </div>

      {/* Citations List */}
      <div className="p-6">
        {filteredCitations.length === 0 ? (
          <div className="text-center py-12">
            <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No citations found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first citation to get started'
              }
            </p>
            <button
              onClick={() => setShowNewCitation(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Citation</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCitations.map((citation) => {
              const TypeIcon = getTypeIcon(citation.type)
              return (
                <div
                  key={citation.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedCitations.includes(citation.id)}
                      onChange={() => handleSelectCitation(citation.id)}
                      className="mt-1 rounded"
                    />
                    <TypeIcon className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {citation.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {citation.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                              </span>
                            </div>
                            {citation.publicationDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{citation.publicationDate.getFullYear()}</span>
                              </div>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {citation.type.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {/* Citation Preview */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 font-mono">
                              {formatCitation(citation, citationStyle)}
                            </p>
                          </div>

                          {/* Additional Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {citation.journal && (
                              <div>
                                <span className="text-gray-600">Journal:</span>
                                <span className="ml-2 font-medium">{citation.journal}</span>
                              </div>
                            )}
                            {citation.publisher && (
                              <div>
                                <span className="text-gray-600">Publisher:</span>
                                <span className="ml-2 font-medium">{citation.publisher}</span>
                              </div>
                            )}
                            {citation.doi && (
                              <div>
                                <span className="text-gray-600">DOI:</span>
                                <span className="ml-2 font-medium">{citation.doi}</span>
                              </div>
                            )}
                            {citation.url && (
                              <div>
                                <span className="text-gray-600">URL:</span>
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  <span className="truncate max-w-xs">{citation.url}</span>
                                  <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {citation.tags.length > 0 && (
                            <div className="flex items-center space-x-2 mt-3">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <div className="flex flex-wrap gap-1">
                                {citation.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleCopyCitation(citation)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Copy citation"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCitation(citation)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Edit citation"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteCitation(citation.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            title="Delete citation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New/Edit Citation Modal */}
      {(showNewCitation || editingCitation) && (
        <CitationForm
          citation={editingCitation}
          onSave={(citation) => {
            if (editingCitation) {
              onUpdateCitation(editingCitation.id, citation)
              setEditingCitation(null)
            } else {
              onCreateCitation(citation)
              setShowNewCitation(false)
            }
          }}
          onCancel={() => {
            setShowNewCitation(false)
            setEditingCitation(null)
          }}
        />
      )}
    </div>
  )
}

// Citation Form Component
interface CitationFormProps {
  citation?: Citation | null
  onSave: (citation: Omit<Citation, 'id'>) => void
  onCancel: () => void
}

function CitationForm({ citation, onSave, onCancel }: CitationFormProps) {
  const [formData, setFormData] = useState({
    type: citation?.type || CitationType.BOOK,
    title: citation?.title || '',
    authors: citation?.authors || [{ firstName: '', lastName: '', middleName: '' }],
    publicationDate: citation?.publicationDate?.toISOString().split('T')[0] || '',
    publisher: citation?.publisher || '',
    journal: citation?.journal || '',
    volume: citation?.volume || '',
    issue: citation?.issue || '',
    pages: citation?.pages || '',
    doi: citation?.doi || '',
    isbn: citation?.isbn || '',
    url: citation?.url || '',
    notes: citation?.notes || '',
    tags: citation?.tags?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const citationData: Omit<Citation, 'id'> = {
      type: formData.type,
      title: formData.title,
      authors: formData.authors.filter(a => a.firstName || a.lastName),
      publicationDate: formData.publicationDate ? new Date(formData.publicationDate) : undefined,
      publisher: formData.publisher || undefined,
      journal: formData.journal || undefined,
      volume: formData.volume || undefined,
      issue: formData.issue || undefined,
      pages: formData.pages || undefined,
      doi: formData.doi || undefined,
      isbn: formData.isbn || undefined,
      url: formData.url || undefined,
      notes: formData.notes,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      customFields: {},
      accessDate: undefined
    }
    
    onSave(citationData)
  }

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { firstName: '', lastName: '', middleName: '' }]
    }))
  }

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => 
        i === index ? { ...author, [field]: value } : author
      )
    }))
  }

  const removeAuthor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {citation ? 'Edit Citation' : 'New Citation'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citation Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CitationType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.values(CitationType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Authors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Authors
              </label>
              <button
                type="button"
                onClick={addAuthor}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                <span>Add Author</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.authors.map((author, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={author.firstName}
                    onChange={(e) => updateAuthor(index, 'firstName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Middle Name"
                    value={author.middleName || ''}
                    onChange={(e) => updateAuthor(index, 'middleName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={author.lastName}
                    onChange={(e) => updateAuthor(index, 'lastName', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Publication Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="date"
                value={formData.publicationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal
              </label>
              <input
                type="text"
                value={formData.journal}
                onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume
              </label>
              <input
                type="text"
                value={formData.volume}
                onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue
              </label>
              <input
                type="text"
                value={formData.issue}
                onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages
              </label>
              <input
                type="text"
                value={formData.pages}
                onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOI
              </label>
              <input
                type="text"
                value={formData.doi}
                onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="research, methodology, theory"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {citation ? 'Update Citation' : 'Create Citation'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}