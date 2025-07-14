import React, { useState, useRef } from 'react'
import { ArrowLeft, Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { DocumentType } from '../types'

interface DocumentUploadProps {
  onNavigate: (view: string, id?: string) => void
  onAddDocument: (document: {
    title: string
    filename: string
    type: DocumentType
    content: string
    metadata: {
      author?: string
      publisher?: string
      publicationDate?: Date
      isbn?: string
      doi?: string
      url?: string
      pages?: number
      language?: string
    }
    tags: string[]
    size: number
  }) => void
}

export default function DocumentUpload({ onNavigate, onAddDocument }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationDate: '',
    isbn: '',
    doi: '',
    url: '',
    pages: '',
    language: '',
    tags: ''
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedTypes = {
    'application/pdf': 'PDF',
    'application/epub+zip': 'EPUB',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'text/plain': 'TXT',
    'text/html': 'HTML',
    'text/markdown': 'Markdown',
    'image/jpeg': 'Image',
    'image/png': 'Image',
    'image/gif': 'Image'
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      Object.keys(supportedTypes).includes(file.type) || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.txt')
    )
    
    if (validFiles.length > 0) {
      setUploadedFiles(validFiles)
      setCurrentFile(validFiles[0])
      setMetadata(prev => ({
        ...prev,
        title: validFiles[0].name.replace(/\.[^/.]+$/, '')
      }))
    }
  }

  const getDocumentType = (file: File): DocumentType => {
    if (file.type === 'application/pdf') return DocumentType.PDF
    if (file.type === 'application/epub+zip') return DocumentType.EPUB
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return DocumentType.DOCX
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) return DocumentType.TXT
    if (file.type === 'text/html') return DocumentType.HTML
    if (file.name.endsWith('.md')) return DocumentType.MARKDOWN
    if (file.type.startsWith('image/')) return DocumentType.IMAGE
    return DocumentType.TXT
  }

  const processFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        // In a real app, you'd process different file types appropriately
        // For now, we'll just return the content or a placeholder
        if (file.type.startsWith('image/')) {
          resolve(`[Image: ${file.name}]\n\nImage content would be processed here in a real implementation.`)
        } else if (file.type === 'application/pdf') {
          resolve(`[PDF: ${file.name}]\n\nPDF content would be extracted here in a real implementation.`)
        } else {
          resolve(content || `[File: ${file.name}]\n\nFile content would be processed here.`)
        }
      }
      
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFile) return

    setProcessing(true)
    
    try {
      const content = await processFile(currentFile)
      
      const documentData = {
        title: metadata.title || currentFile.name,
        filename: currentFile.name,
        type: getDocumentType(currentFile),
        content,
        metadata: {
          author: metadata.author || undefined,
          publisher: metadata.publisher || undefined,
          publicationDate: metadata.publicationDate ? new Date(metadata.publicationDate) : undefined,
          isbn: metadata.isbn || undefined,
          doi: metadata.doi || undefined,
          url: metadata.url || undefined,
          pages: metadata.pages ? parseInt(metadata.pages) : undefined,
          language: metadata.language || undefined
        },
        tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        size: currentFile.size
      }
      
      onAddDocument(documentData)
      onNavigate('documents')
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setProcessing(false)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    if (newFiles.length > 0) {
      setCurrentFile(newFiles[0])
    } else {
      setCurrentFile(null)
      setMetadata({
        title: '',
        author: '',
        publisher: '',
        publicationDate: '',
        isbn: '',
        doi: '',
        url: '',
        pages: '',
        language: '',
        tags: ''
      })
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('documents')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
              <p className="text-gray-600 mt-1">Add a new document to your research library</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Supports PDF, EPUB, DOCX, TXT, HTML, Markdown, and Images
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.epub,.docx,.txt,.html,.md,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      currentFile === file ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <File className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {supportedTypes[file.type as keyof typeof supportedTypes] || 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentFile(file)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentFile === file
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {currentFile === file ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Form */}
          {currentFile && (
            <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Metadata</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={metadata.publisher}
                      onChange={(e) => setMetadata(prev => ({ ...prev, publisher: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      value={metadata.publicationDate}
                      onChange={(e) => setMetadata(prev => ({ ...prev, publicationDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pages
                    </label>
                    <input
                      type="number"
                      value={metadata.pages}
                      onChange={(e) => setMetadata(prev => ({ ...prev, pages: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={metadata.isbn}
                      onChange={(e) => setMetadata(prev => ({ ...prev, isbn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DOI
                    </label>
                    <input
                      type="text"
                      value={metadata.doi}
                      onChange={(e) => setMetadata(prev => ({ ...prev, doi: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={metadata.url}
                    onChange={(e) => setMetadata(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={metadata.tags}
                    onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="research, methodology, theory"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Add Document</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('documents')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}