// Local storage utilities for persisting data
const STORAGE_KEY = 'notion-app-pages'

export interface StoredPage {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  isStarred: boolean
  projectId?: string
  folderId?: string
  tags: string[]
  customFields: Record<string, any>
  version: number
  versions: any[]
}

export const savePages = (pages: any[]) => {
  try {
    const storedPages: StoredPage[] = pages.map(page => ({
      ...page,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      tags: page.tags || [],
      customFields: page.customFields || {},
      version: page.version || 1,
      versions: page.versions || []
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPages))
  } catch (error) {
    console.warn('Failed to save pages to localStorage:', error)
  }
}

export const loadPages = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const storedPages: StoredPage[] = JSON.parse(stored)
    return storedPages.map(page => ({
      ...page,
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt),
      tags: page.tags || [],
      customFields: page.customFields || {},
      version: page.version || 1,
      versions: page.versions || []
    }))
  } catch (error) {
    console.warn('Failed to load pages from localStorage:', error)
    return null
  }
}

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
  }
}