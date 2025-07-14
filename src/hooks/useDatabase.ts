import { useState, useEffect, useCallback } from 'react'
import { database } from '../services/database'

// Custom hook for database operations
export const useDatabase = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initUser = async () => {
      try {
        const currentUser = await database.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to get current user:', error)
      } finally {
        setLoading(false)
      }
    }

    initUser()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await database.signIn(email, password)
      if (result.user) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error('Sign in failed:', error)
      return { user: null, error: 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await database.signUp(email, password)
      if (result.user) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error('Sign up failed:', error)
      return { user: null, error: 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await database.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }, [])

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    database
  }
}

// Hook for pages
export const usePages = () => {
  const { user } = useDatabase()
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPages = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await database.getPages(user.id)
      setPages(data.map(page => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      })))
    } catch (error) {
      console.error('Failed to load pages:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const createPage = useCallback(async (page: any) => {
    if (!user) return null
    
    try {
      const newPage = await database.createPage(user.id, {
        ...page,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      await loadPages() // Refresh the list
      return newPage
    } catch (error) {
      console.error('Failed to create page:', error)
      return null
    }
  }, [user, loadPages])

  const updatePage = useCallback(async (pageId: string, updates: any) => {
    if (!user) return null
    
    try {
      const updatedPage = await database.updatePage(user.id, pageId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      await loadPages() // Refresh the list
      return updatedPage
    } catch (error) {
      console.error('Failed to update page:', error)
      return null
    }
  }, [user, loadPages])

  const deletePage = useCallback(async (pageId: string) => {
    if (!user) return false
    
    try {
      await database.deletePage(user.id, pageId)
      await loadPages() // Refresh the list
      return true
    } catch (error) {
      console.error('Failed to delete page:', error)
      return false
    }
  }, [user, loadPages])

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    refreshPages: loadPages
  }
}

// Hook for projects
export const useProjects = () => {
  const { user } = useDatabase()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await database.getProjects(user.id)
      setProjects(data.map(project => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        deadline: project.deadline ? new Date(project.deadline) : undefined
      })))
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const createProject = useCallback(async (project: any) => {
    if (!user) return null
    
    try {
      const newProject = await database.createProject(user.id, {
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: project.deadline?.toISOString()
      })
      await loadProjects() // Refresh the list
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      return null
    }
  }, [user, loadProjects])

  const updateProject = useCallback(async (projectId: string, updates: any) => {
    if (!user) return null
    
    try {
      const updatedProject = await database.updateProject(user.id, projectId, {
        ...updates,
        updatedAt: new Date().toISOString(),
        deadline: updates.deadline?.toISOString()
      })
      await loadProjects() // Refresh the list
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      return null
    }
  }, [user, loadProjects])

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user) return false
    
    try {
      await database.deleteProject(user.id, projectId)
      await loadProjects() // Refresh the list
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  }, [user, loadProjects])

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects
  }
}

// Hook for documents
export const useDocuments = () => {
  const { user } = useDatabase()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDocuments = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await database.getDocuments(user.id)
      setDocuments(data.map(doc => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
        metadata: {
          ...doc.metadata,
          publicationDate: doc.metadata.publicationDate ? new Date(doc.metadata.publicationDate) : undefined
        }
      })))
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const createDocument = useCallback(async (document: any) => {
    if (!user) return null
    
    try {
      const newDocument = await database.createDocument(user.id, {
        ...document,
        uploadedAt: new Date().toISOString(),
        metadata: {
          ...document.metadata,
          publicationDate: document.metadata.publicationDate?.toISOString()
        }
      })
      await loadDocuments() // Refresh the list
      return newDocument
    } catch (error) {
      console.error('Failed to create document:', error)
      return null
    }
  }, [user, loadDocuments])

  const updateDocument = useCallback(async (documentId: string, updates: any) => {
    if (!user) return null
    
    try {
      const updatedDocument = await database.updateDocument(user.id, documentId, updates)
      await loadDocuments() // Refresh the list
      return updatedDocument
    } catch (error) {
      console.error('Failed to update document:', error)
      return null
    }
  }, [user, loadDocuments])

  const deleteDocument = useCallback(async (documentId: string) => {
    if (!user) return false
    
    try {
      await database.deleteDocument(user.id, documentId)
      await loadDocuments() // Refresh the list
      return true
    } catch (error) {
      console.error('Failed to delete document:', error)
      return false
    }
  }, [user, loadDocuments])

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments: loadDocuments
  }
}

// Hook for citations
export const useCitations = () => {
  const { user } = useDatabase()
  const [citations, setCitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadCitations = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await database.getCitations(user.id)
      setCitations(data.map(citation => ({
        ...citation,
        publicationDate: citation.publicationDate ? new Date(citation.publicationDate) : undefined,
        accessDate: citation.accessDate ? new Date(citation.accessDate) : undefined
      })))
    } catch (error) {
      console.error('Failed to load citations:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCitations()
  }, [loadCitations])

  const createCitation = useCallback(async (citation: any) => {
    if (!user) return null
    
    try {
      const newCitation = await database.createCitation(user.id, {
        ...citation,
        publicationDate: citation.publicationDate?.toISOString(),
        accessDate: citation.accessDate?.toISOString()
      })
      await loadCitations() // Refresh the list
      return newCitation
    } catch (error) {
      console.error('Failed to create citation:', error)
      return null
    }
  }, [user, loadCitations])

  const updateCitation = useCallback(async (citationId: string, updates: any) => {
    if (!user) return null
    
    try {
      const updatedCitation = await database.updateCitation(user.id, citationId, {
        ...updates,
        publicationDate: updates.publicationDate?.toISOString(),
        accessDate: updates.accessDate?.toISOString()
      })
      await loadCitations() // Refresh the list
      return updatedCitation
    } catch (error) {
      console.error('Failed to update citation:', error)
      return null
    }
  }, [user, loadCitations])

  const deleteCitation = useCallback(async (citationId: string) => {
    if (!user) return false
    
    try {
      await database.deleteCitation(user.id, citationId)
      await loadCitations() // Refresh the list
      return true
    } catch (error) {
      console.error('Failed to delete citation:', error)
      return false
    }
  }, [user, loadCitations])

  return {
    citations,
    loading,
    createCitation,
    updateCitation,
    deleteCitation,
    refreshCitations: loadCitations
  }
}