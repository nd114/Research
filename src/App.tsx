import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import ProjectManager from './components/ProjectManager'
import DocumentViewer from './components/DocumentViewer'
import CitationManager from './components/CitationManager'
import SplitView from './components/SplitView'
import Sidebar from './components/Sidebar'
import { 
  Page, 
  Project, 
  Document, 
  Citation, 
  Folder,
  ProjectStage,
  ProjectStatus,
  ProjectTemplate,
  DocumentType,
  CitationType,
  CitationStyle
} from './types'
import { savePages, loadPages } from './utils/storage'

function App() {
  // Core data states
  const [pages, setPages] = useState<Page[]>(() => {
    const savedPages = loadPages()
    if (savedPages && savedPages.length > 0) {
      return savedPages
    }
    return [
      {
        id: '1',
        title: 'Welcome to NotionApp',
        content: 'Start writing your thoughts here...',
        createdAt: new Date(),
        updatedAt: new Date(),
        isStarred: false,
        tags: [],
        customFields: {},
        version: 1,
        versions: []
      }
    ]
  })
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Sample Research Project',
      description: 'A sample project to demonstrate the research platform capabilities',
      stage: ProjectStage.RESEARCH,
      template: ProjectTemplate.GENERAL,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ProjectStatus.IN_PROGRESS,
      customFields: {},
      folders: [],
      tags: ['sample', 'demo']
    }
  ])
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  
  // UI states
  const [currentView, setCurrentView] = useState<string>('dashboard')
  const [currentItemId, setCurrentItemId] = useState<string | undefined>()
  const [currentPageId, setCurrentPageId] = useState<string>(() => {
    const savedPages = loadPages()
    return savedPages && savedPages.length > 0 ? savedPages[0].id : '1'
  })

  const currentPage = pages.find(page => page.id === currentPageId)
  const currentProject = projects.find(project => project.id === currentItemId)
  const currentDocument = documents.find(doc => doc.id === currentItemId)
  
  // Navigation handler
  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view)
    setCurrentItemId(id)
    
    if (view === 'note' && id) {
      setCurrentPageId(id)
    }
  }
  
  // Page management
  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      projectId: currentProject?.id,
      tags: [],
      customFields: {},
      version: 1,
      versions: []
    }
    const newPages = [...pages, newPage]
    setPages(newPages)
    savePages(newPages)
    setCurrentPageId(newPage.id)
    setCurrentView('note')
  }

  const updatePage = (id: string, updates: Partial<Page>) => {
    const newPages = pages.map(page => 
      page.id === id 
        ? { ...page, ...updates, updatedAt: new Date() }
        : page
    )
    setPages(newPages)
    savePages(newPages)
  }

  const deletePage = (id: string) => {
    if (pages.length > 1) {
      const newPages = pages.filter(page => page.id !== id)
      setPages(newPages)
      savePages(newPages)
      if (currentPageId === id) {
        setCurrentPageId(newPages[0].id)
      }
    }
  }

  const toggleStar = (id: string) => {
    updatePage(id, { isStarred: !pages.find(p => p.id === id)?.isStarred })
  }

  // Project management
  const createProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      folders: []
    }
    setProjects([...projects, newProject])
  }
  
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ))
  }
  
  const createFolder = (name: string, parentId?: string) => {
    if (!currentProject) return
    
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      projectId: currentProject.id,
      createdAt: new Date(),
      children: [],
      pageIds: []
    }
    setFolders([...folders, newFolder])
  }
  
  // Document management
  const addDocument = (document: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: new Date(),
      highlights: [],
      annotations: []
    }
    setDocuments([...documents, newDocument])
  }
  
  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ))
  }
  
  // Citation management
  const createCitation = (citation: Omit<Citation, 'id'>) => {
    const newCitation: Citation = {
      ...citation,
      id: Date.now().toString()
    }
    setCitations([...citations, newCitation])
  }
  
  const updateCitation = (id: string, updates: Partial<Citation>) => {
    setCitations(citations.map(citation => 
      citation.id === id ? { ...citation, ...updates } : citation
    ))
  }
  
  const deleteCitation = (id: string) => {
    setCitations(citations.filter(citation => citation.id !== id))
  }
  
  const exportBibliography = (citations: Citation[], style: CitationStyle) => {
    // Implementation for exporting bibliography
    console.log('Exporting bibliography:', citations, style)
  }
  
  // Web clipping
  const handleWebClip = (title: string, content: string, url: string) => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: title,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      projectId: currentProject?.id,
      tags: ['web-clip'],
      customFields: { sourceUrl: url },
      version: 1,
      versions: []
    }
    const newPages = [...pages, newPage]
    setPages(newPages)
    savePages(newPages)
    setCurrentPageId(newPage.id)
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            projects={projects}
            documents={documents}
            citations={citations}
            pages={pages}
            onNavigate={handleNavigate}
            createNewPage={createNewPage}
          />
        )
      
      case 'documents':
        return (
          <DocumentsView
            documents={documents}
            onNavigate={handleNavigate}
            onUploadDocument={() => handleNavigate('document-upload')}
            onUpdateDocument={updateDocument}
            onDeleteDocument={(id) => {
              setDocuments(documents.filter(doc => doc.id !== id))
            }}
          />
        )
      
      case 'notes':
        return (
          <NotesView
            pages={pages}
            onNavigate={handleNavigate}
            onCreatePage={createNewPage}
            onDeletePage={deletePage}
            onToggleStar={toggleStar}
          />
        )
      
      case 'projects':
        return (
          <ProjectsView
            projects={projects}
            onNavigate={handleNavigate}
            onCreateProject={() => handleNavigate('project-create')}
            onUpdateProject={updateProject}
            onDeleteProject={(id) => {
              setProjects(projects.filter(project => project.id !== id))
            }}
          />
        )
      
      case 'project-create':
        return (
          <ProjectCreate
            onNavigate={handleNavigate}
            onCreateProject={createProject}
          />
        )
      
      case 'document-upload':
        return (
          <DocumentUpload
            onNavigate={handleNavigate}
            onAddDocument={addDocument}
          />
        )
      
      case 'project':
        if (!currentProject) return <div>Project not found</div>
        return (
          <ProjectManager
            project={currentProject}
            folders={folders.filter(f => f.projectId === currentProject.id)}
            pages={pages.filter(p => p.projectId === currentProject.id)}
            onUpdateProject={(updates) => updateProject(currentProject.id, updates)}
            onCreateFolder={createFolder}
            onCreatePage={(title, folderId) => {
              const newPage: Page = {
                id: Date.now().toString(),
                title,
                content: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                isStarred: false,
                projectId: currentProject.id,
                folderId,
                tags: [],
                customFields: {},
                version: 1,
                versions: []
              }
              const newPages = [...pages, newPage]
              setPages(newPages)
              savePages(newPages)
            }}
            onNavigateToPage={(pageId) => handleNavigate('note', pageId)}
          />
        )
      
      case 'document':
        if (!currentDocument) return <div>Document not found</div>
        return (
          <DocumentViewer
            document={currentDocument}
            onAddHighlight={(highlight) => {
              // Add highlight to document
              console.log('Adding highlight:', highlight)
            }}
            onAddAnnotation={(annotation) => {
              // Add annotation to document
              console.log('Adding annotation:', annotation)
            }}
            onUpdateDocument={(updates) => updateDocument(currentDocument.id, updates)}
          />
        )
      
      case 'citations':
        return (
          <CitationManager
            citations={citations}
            onCreateCitation={createCitation}
            onUpdateCitation={updateCitation}
            onDeleteCitation={deleteCitation}
            onExportBibliography={exportBibliography}
          />
        )
      
      case 'note':
        if (!currentPage) return <div>Page not found</div>
        return (
          <SplitView
            currentPage={currentPage}
            onUpdatePage={updatePage}
            onClipPage={handleWebClip}
            onToggleStar={toggleStar}
            onShowWebClipper={() => {}}
            onShowExportModal={() => {}}
            onShowFullBrowser={() => {}}
          />
        )
      
      default:
        return (
          <Dashboard
            projects={projects}
            documents={documents}
            citations={citations}
            pages={pages}
            onNavigate={handleNavigate}
          />
        )
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar
        pages={pages}
        currentPageId={currentPageId}
        currentView={currentView}
        onNavigate={handleNavigate}
        onCreatePage={createNewPage}
        onDeletePage={deletePage}
        onToggleStar={toggleStar}
      />
      <div className="flex-1 flex flex-col">
        {renderCurrentView()}
      </div>
    </div>
  )
}

// Import new components
import NotesView from './components/NotesView'
import ProjectsView from './components/ProjectsView'
import DocumentsView from './components/DocumentsView'
import ProjectCreate from './components/ProjectCreate'
import DocumentUpload from './components/DocumentUpload'

export default App