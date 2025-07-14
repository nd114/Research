import React, { useState, useRef, useEffect } from 'react'
import RichTextEditor from './RichTextEditor'
import { Page } from '../types'

interface EditorProps {
  page: Page
  onUpdatePage: (updates: Partial<Page>) => void
}

export default function Editor({ page, onUpdatePage }: EditorProps) {
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content)
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTitle(page.title)
    setContent(page.content)
  }, [page])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onUpdatePage({ title: newTitle })
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onUpdatePage({ content: newContent })
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      contentRef.current?.focus()
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = contentRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [content])

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent mb-4 resize-none editor-content"
        />
        
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
        />
      </div>
      
      <div className="border-t border-gray-200 px-8 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Last edited: {page.updatedAt.toLocaleDateString()} at {page.updatedAt.toLocaleTimeString()}
          </div>
          <div>
            {content.length} characters
          </div>
        </div>
      </div>
    </div>
  )
}