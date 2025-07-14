import React, { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Underline,
  Strikethrough,
  Save,
  Undo,
  Redo,
  Eye,
  Edit3,
  Type
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [history, setHistory] = useState<string[]>([content])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // History management
  const addToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    onChange(newText)
    addToHistory(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatBold = () => insertText('**', '**')
  const formatItalic = () => insertText('*', '*')
  const formatUnderline = () => insertText('<u>', '</u>')
  const formatStrikethrough = () => insertText('~~', '~~')
  const formatCode = () => insertText('`', '`')
  const formatQuote = () => insertText('> ')
  const formatList = () => insertText('- ')
  const formatLink = () => insertText('[', '](url)')
  const formatH1 = () => insertText('# ')
  const formatH2 = () => insertText('## ')
  const formatH3 = () => insertText('### ')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          formatBold()
          break
        case 'i':
          e.preventDefault()
          formatItalic()
          break
        case 'u':
          e.preventDefault()
          formatUnderline()
          break
        case 'k':
          e.preventDefault()
          formatLink()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
      }
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea && !isPreviewMode) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [content, isPreviewMode])

  // Render markdown preview with proper HTML formatting
  const renderPreview = () => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Underline
      .replace(/<u>(.*?)<\/u>/gim, '<u class="underline">$1</u>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del class="line-through">$1</del>')
      // Code
      .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      // Quotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      // Line breaks
      .replace(/\n/gim, '<br>')

    return { __html: html }
  }

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {(showToolbar || isPreviewMode) && (
        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-1">
            {/* History Controls */}
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Undo (Cmd+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-gray-300 mx-1" />
            
            {/* Formatting Controls */}
            <button
              onClick={formatBold}
              className="p-1 rounded hover:bg-gray-200"
              title="Bold (Cmd+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={formatItalic}
              className="p-1 rounded hover:bg-gray-200"
              title="Italic (Cmd+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={formatUnderline}
              className="p-1 rounded hover:bg-gray-200"
              title="Underline (Cmd+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={formatStrikethrough}
              className="p-1 rounded hover:bg-gray-200"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={formatCode}
              className="p-1 rounded hover:bg-gray-200"
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-gray-300 mx-1" />
            
            {/* Headers */}
            <button
              onClick={formatH1}
              className="p-1 rounded hover:bg-gray-200"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={formatH2}
              className="p-1 rounded hover:bg-gray-200"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={formatH3}
              className="p-1 rounded hover:bg-gray-200"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-gray-300 mx-1" />
            
            {/* Lists and Quotes */}
            <button
              onClick={formatQuote}
              className="p-1 rounded hover:bg-gray-200"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={formatList}
              className="p-1 rounded hover:bg-gray-200"
              title="List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={formatLink}
              className="p-1 rounded hover:bg-gray-200"
              title="Link (Cmd+K)"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-1 rounded ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      
      {/* Editor/Preview Content */}
      <div className="relative">
        {isPreviewMode ? (
          <div 
            className="p-4 prose prose-sm max-w-none min-h-[200px] leading-relaxed"
            dangerouslySetInnerHTML={renderPreview()}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              onChange(e.target.value)
              if (e.target.value !== history[historyIndex]) {
                // Only add to history on significant changes
                const timer = setTimeout(() => {
                  addToHistory(e.target.value)
                }, 1000)
                return () => clearTimeout(timer)
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowToolbar(true)}
            onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
            placeholder={placeholder}
            className="w-full text-base text-gray-700 placeholder-gray-400 border-none outline-none bg-transparent resize-none leading-relaxed min-h-[200px] p-4"
            style={{ height: 'auto' }}
          />
        )}
      </div>
    </div>
  )
}