import { useState, useCallback } from 'react'
import { apiService } from '../services/api'

// Custom hook for API operations
export const useAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeAPI = useCallback(async <T>(
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    executeAPI,
    clearError: () => setError(null)
  }
}

// Hook for citation lookup
export const useCitationLookup = () => {
  const { loading, error, executeAPI, clearError } = useAPI()

  const lookupDOI = useCallback(async (doi: string) => {
    return executeAPI(() => apiService.lookupDOI(doi))
  }, [executeAPI])

  const lookupISBN = useCallback(async (isbn: string) => {
    return executeAPI(() => apiService.lookupISBN(isbn))
  }, [executeAPI])

  const searchCitations = useCallback(async (query: string) => {
    return executeAPI(() => apiService.searchCitations(query))
  }, [executeAPI])

  return {
    loading,
    error,
    lookupDOI,
    lookupISBN,
    searchCitations,
    clearError
  }
}

// Hook for document processing
export const useDocumentProcessing = () => {
  const { loading, error, executeAPI, clearError } = useAPI()

  const extractText = useCallback(async (file: File) => {
    if (file.type === 'application/pdf') {
      return executeAPI(() => apiService.extractTextFromPDF(file))
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return executeAPI(() => apiService.extractTextFromDOCX(file))
    } else {
      // For other file types, read as text
      return executeAPI(() => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string || '')
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsText(file)
        })
      })
    }
  }, [executeAPI])

  const extractMetadata = useCallback(async (file: File) => {
    return executeAPI(() => apiService.extractMetadataFromDocument(file))
  }, [executeAPI])

  return {
    loading,
    error,
    extractText,
    extractMetadata,
    clearError
  }
}

// Hook for web scraping
export const useWebScraping = () => {
  const { loading, error, executeAPI, clearError } = useAPI()

  const scrapeURL = useCallback(async (url: string) => {
    return executeAPI(() => apiService.scrapeURL(url))
  }, [executeAPI])

  const generateLinkPreview = useCallback(async (url: string) => {
    return executeAPI(() => apiService.generateLinkPreview(url))
  }, [executeAPI])

  return {
    loading,
    error,
    scrapeURL,
    generateLinkPreview,
    clearError
  }
}

// Hook for AI services
export const useAI = () => {
  const { loading, error, executeAPI, clearError } = useAPI()

  const summarizeText = useCallback(async (text: string) => {
    return executeAPI(() => apiService.summarizeText(text))
  }, [executeAPI])

  const extractKeywords = useCallback(async (text: string) => {
    return executeAPI(() => apiService.extractKeywords(text))
  }, [executeAPI])

  const generateCitation = useCallback(async (metadata: any) => {
    return executeAPI(() => apiService.generateCitation(metadata))
  }, [executeAPI])

  return {
    loading,
    error,
    summarizeText,
    extractKeywords,
    generateCitation,
    clearError
  }
}