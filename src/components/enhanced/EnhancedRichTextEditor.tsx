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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Strikethrough,
  Save,
  Undo,
  Redo,
  Eye,
  Edit3
} from 'lucide-react'
import { useAI } from '../../hooks/useAPI'

interface EnhancedRichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  autoSave?: boolean
  onSave?: () => void
}

export default function EnhancedRichTextEditor({ 
  content, 
  onChange, 
  placeholder,
  autoSave = true,
  onSave
}: EnhancedRichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [history, setHistory] = useState<string[]>([content])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { summarizeText, extractKeywords, loading: aiLoading } = useAI()

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && content !== history[historyIndex]) {
      const timer = setTimeout(() => {
        onSave?.()
        setLastSaved(new Date())
      }, 2000) // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(timer)
    }
  }, [content, autoSave, onSave, history, historyIndex])

  // Update word and character counts
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setCharacterCount(content.length)
  }, [content])

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
        case 's':
          e.preventDefault()
          onSave?.()
          setLastSaved(new Date())
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

  const handleAISummarize = async () => {
    if (content.trim()) {
      const summary = await summarizeText(content)
      if (summary) {
        const newContent = content + '\n\n## AI Summary\n\n' + summary
        onChange(newContent)
        addToHistory(newContent)
      }
    }
  }

  const handleAIKeywords = async () => {
    if (content.trim()) {
      const keywords = await extractKeywords(content)
      if (keywords && keywords.length > 0) {
        const keywordText = '\n\n**Keywords:** ' + keywords.join(', ')
        const newContent = content + keywordText
        onChange(newContent)
        addToHistory(newContent)
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

  // Render markdown preview
  const renderPreview = () => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Underline
      .replace(/<u>(.*)<\/u>/gim, '<u>$1</u>')
      // Strikethrough
      .replace(/~~(.*)~~/gim, '<del>$1</del>')
      // Code
      .replace(/`(.*)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>')
      // Quotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Lists
      .replace(/^- (.*$)/gim, '<li>$1</li>')

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
            {/* AI Tools */}
            <button
              onClick={handleAISummarize}
              disabled={aiLoading || !content.trim()}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              title="AI Summarize"
            >
              {aiLoading ? '...' : 'Summarize'}
            </button>
            <button
              onClick={handleAIKeywords}
              disabled={aiLoading || !content.trim()}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              title="Extract Keywords"
            >
              {aiLoading ? '...' : 'Keywords'}
            </button>

            <div className="w-px h-4 bg-gray-300" />

            {/* View Toggle */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-1 rounded ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
              title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            >
              {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Save */}
            <button
              onClick={() => {
                onSave?.()
                setLastSaved(new Date())
              }}
              className="p-1 rounded hover:bg-gray-200"
              title="Save (Cmd+S)"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Editor/Preview Content */}
      <div className="relative">
        {isPreviewMode ? (
          <div 
            className="p-4 prose prose-sm max-w-none min-h-[200px]"
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

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {autoSave && <span className="text-green-600">Auto-save enabled</span>}
          <span>Markdown supported</span>
        </div>
      </div>
    </div>
  )
}