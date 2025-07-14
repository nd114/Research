// External API service abstraction layer
export interface APIService {
  // Citation lookup
  lookupDOI(doi: string): Promise<any>
  lookupISBN(isbn: string): Promise<any>
  searchCitations(query: string): Promise<any[]>

  // Document processing
  extractTextFromPDF(file: File): Promise<string>
  extractTextFromDOCX(file: File): Promise<string>
  extractMetadataFromDocument(file: File): Promise<any>

  // Web scraping
  scrapeURL(url: string): Promise<{ title: string; content: string; metadata: any }>
  generateLinkPreview(url: string): Promise<{ title: string; description: string; image?: string }>

  // AI services
  summarizeText(text: string): Promise<string>
  extractKeywords(text: string): Promise<string[]>
  generateCitation(metadata: any): Promise<string>
}

// Mock implementation (current)
class MockAPIService implements APIService {
  async lookupDOI(doi: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      title: `Research Paper for DOI: ${doi}`,
      authors: [{ firstName: 'John', lastName: 'Doe' }],
      journal: 'Journal of Research',
      year: 2023,
      doi: doi
    }
  }

  async lookupISBN(isbn: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      title: `Book for ISBN: ${isbn}`,
      authors: [{ firstName: 'Jane', lastName: 'Smith' }],
      publisher: 'Academic Press',
      year: 2023,
      isbn: isbn
    }
  }

  async searchCitations(query: string) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return [
      {
        title: `Research on ${query}`,
        authors: [{ firstName: 'Alice', lastName: 'Johnson' }],
        year: 2023,
        relevance: 0.95
      },
      {
        title: `Advanced ${query} Studies`,
        authors: [{ firstName: 'Bob', lastName: 'Wilson' }],
        year: 2022,
        relevance: 0.87
      }
    ]
  }

  async extractTextFromPDF(file: File) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return `[PDF Content Extracted from ${file.name}]\n\nThis is simulated text extraction from a PDF file. In a real implementation, this would use a service like Adobe PDF Services API or Apache Tika to extract the actual text content from the PDF file.\n\nThe extracted text would preserve formatting and structure as much as possible.`
  }

  async extractTextFromDOCX(file: File) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return `[DOCX Content Extracted from ${file.name}]\n\nThis is simulated text extraction from a Word document. In a real implementation, this would parse the DOCX file structure to extract the text content while preserving formatting information.`
  }

  async extractMetadataFromDocument(file: File) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      title: file.name.replace(/\.[^/.]+$/, ''),
      author: 'Unknown Author',
      createdDate: new Date(),
      modifiedDate: new Date(),
      pageCount: Math.floor(Math.random() * 50) + 1,
      wordCount: Math.floor(Math.random() * 5000) + 500,
      language: 'en'
    }
  }

  async scrapeURL(url: string) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const domain = new URL(url).hostname
    
    return {
      title: `Page from ${domain}`,
      content: `This is simulated content scraped from ${url}. In a real implementation, this would use a web scraping service to extract the actual page content, handling JavaScript rendering and respecting robots.txt.`,
      metadata: {
        description: `A page from ${domain}`,
        keywords: ['research', 'academic', 'content'],
        publishDate: new Date(),
        author: 'Web Author'
      }
    }
  }

  async generateLinkPreview(url: string) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const domain = new URL(url).hostname
    
    return {
      title: `${domain} - Web Page`,
      description: `This is a simulated link preview for ${url}. Real implementation would fetch Open Graph metadata.`,
      image: `https://via.placeholder.com/400x200?text=${encodeURIComponent(domain)}`
    }
  }

  async summarizeText(text: string) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const words = text.split(' ')
    const summary = words.slice(0, Math.min(50, words.length)).join(' ')
    
    return `[AI Summary] ${summary}${words.length > 50 ? '...' : ''}`
  }

  async extractKeywords(text: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple keyword extraction simulation
    const words = text.toLowerCase().split(/\W+/)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])
    
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 10)
    
    return [...new Set(keywords)]
  }

  async generateCitation(metadata: any) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const { title, authors, year, journal, publisher } = metadata
    const authorStr = authors?.map((a: any) => `${a.lastName}, ${a.firstName}`).join(', ') || 'Unknown Author'
    
    return `${authorStr} (${year || 'n.d.'}). ${title}. ${journal || publisher || 'Unknown Publisher'}.`
  }
}

// Real API implementations (ready for connection)
class RealAPIService implements APIService {
  private crossRefAPI = 'https://api.crossref.org/works/'
  private openLibraryAPI = 'https://openlibrary.org/api/books'

  async lookupDOI(doi: string) {
    try {
      const response = await fetch(`${this.crossRefAPI}${doi}`)
      const data = await response.json()
      
      if (data.message) {
        const work = data.message
        return {
          title: work.title?.[0] || 'Unknown Title',
          authors: work.author?.map((a: any) => ({
            firstName: a.given || '',
            lastName: a.family || ''
          })) || [],
          journal: work['container-title']?.[0] || '',
          year: work.published?.['date-parts']?.[0]?.[0] || null,
          doi: work.DOI,
          publisher: work.publisher || ''
        }
      }
    } catch (error) {
      console.error('DOI lookup failed:', error)
    }
    
    // Fallback to mock
    return new MockAPIService().lookupDOI(doi)
  }

  async lookupISBN(isbn: string) {
    try {
      const response = await fetch(`${this.openLibraryAPI}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
      const data = await response.json()
      
      const bookData = data[`ISBN:${isbn}`]
      if (bookData) {
        return {
          title: bookData.title || 'Unknown Title',
          authors: bookData.authors?.map((a: any) => ({
            firstName: a.name?.split(' ')[0] || '',
            lastName: a.name?.split(' ').slice(1).join(' ') || ''
          })) || [],
          publisher: bookData.publishers?.[0]?.name || '',
          year: bookData.publish_date ? new Date(bookData.publish_date).getFullYear() : null,
          isbn: isbn
        }
      }
    } catch (error) {
      console.error('ISBN lookup failed:', error)
    }
    
    // Fallback to mock
    return new MockAPIService().lookupISBN(isbn)
  }

  async searchCitations(query: string) {
    // TODO: Implement with Semantic Scholar API or similar
    return new MockAPIService().searchCitations(query)
  }

  async extractTextFromPDF(file: File) {
    // TODO: Implement with Adobe PDF Services API or similar
    return new MockAPIService().extractTextFromPDF(file)
  }

  async extractTextFromDOCX(file: File) {
    // TODO: Implement with document processing service
    return new MockAPIService().extractTextFromDOCX(file)
  }

  async extractMetadataFromDocument(file: File) {
    // TODO: Implement with document analysis service
    return new MockAPIService().extractMetadataFromDocument(file)
  }

  async scrapeURL(url: string) {
    // TODO: Implement with web scraping service
    return new MockAPIService().scrapeURL(url)
  }

  async generateLinkPreview(url: string) {
    try {
      // Try to fetch Open Graph metadata
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      
      if (data.status === 'success') {
        return {
          title: data.data.title || 'Unknown Title',
          description: data.data.description || '',
          image: data.data.image?.url
        }
      }
    } catch (error) {
      console.error('Link preview failed:', error)
    }
    
    // Fallback to mock
    return new MockAPIService().generateLinkPreview(url)
  }

  async summarizeText(text: string) {
    // TODO: Implement with OpenAI API or similar
    return new MockAPIService().summarizeText(text)
  }

  async extractKeywords(text: string) {
    // TODO: Implement with NLP service
    return new MockAPIService().extractKeywords(text)
  }

  async generateCitation(metadata: any) {
    // TODO: Implement with citation formatting service
    return new MockAPIService().generateCitation(metadata)
  }
}

// Export the current implementation
export const apiService: APIService = new MockAPIService()

// Function to switch to real APIs when ready
export const switchToRealAPIs = () => {
  // TODO: Implement when APIs are connected
  // return new RealAPIService()
}