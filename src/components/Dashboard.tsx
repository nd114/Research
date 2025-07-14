import React, { useState } from 'react'
import { 
  BookOpen, 
  FolderOpen, 
  FileText, 
  Quote, 
  Calendar,
  Search,
  Plus,
  Clock,
  Target,
  Archive,
  Settings,
  Download,
  Upload
} from 'lucide-react'
import { Project, Document, Citation, Page } from '../types'

interface DashboardProps {
  projects: Project[]
  documents: Document[]
  citations: Citation[]
  pages: Page[]
  onNavigate: (view: string, id?: string) => void
  createNewPage: () => void
  initialActiveModule?: string
}

export default function Dashboard({ 
  projects, 
  documents, 
  citations, 
  pages, 
  onNavigate,
  createNewPage,
  initialActiveModule = 'today'
}: DashboardProps) {
  const [activeModule, setActiveModule] = useState<string>(initialActiveModule)

  const recentPages = pages
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)

  const recentDocuments = documents
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(0, 5)

  const activeProjects = projects.filter(p => 
    p.status === 'in_progress' || p.status === 'not_started'
  )

  const upcomingDeadlines = projects
    .filter(p => p.deadline && p.deadline > new Date())
    .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()))
    .slice(0, 3)

  const modules = [
    { id: 'today', label: "Today's Work", icon: Clock },
    { id: 'projects', label: 'Project Library', icon: FolderOpen },
    { id: 'sources', label: 'Sources Vault', icon: Archive },
    { id: 'citations', label: 'Citations', icon: Quote },
    { id: 'search', label: 'Search', icon: Search }
  ]

  return (
    <div className="flex-1 bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Research Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('import')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={() => onNavigate('export')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Module Navigation */}
        <div className="flex items-center space-x-1 mt-4">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeModule === module.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{module.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {activeModule === 'today' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Recent Work */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                <button
                  onClick={() => onNavigate('notes')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentPages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => onNavigate('note', page.id)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{page.title}</p>
                      <p className="text-sm text-gray-500">
                        {page.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                <button
                  onClick={() => onNavigate('projects')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {activeProjects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onNavigate('project', project.id)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{project.stage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onNavigate('project', project.id)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-red-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <p className="text-sm text-red-600">
                        Due {project.deadline!.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
                <button
                  onClick={() => onNavigate('documents')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onNavigate('document', doc.id)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{doc.type.toUpperCase()}</span>
                        <span className="text-xs text-gray-500">
                          {doc.uploadedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                  <div className="text-sm text-gray-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{documents.length}</div>
                  <div className="text-sm text-gray-500">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{citations.length}</div>
                  <div className="text-sm text-gray-500">Citations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pages.length}</div>
                  <div className="text-sm text-gray-500">Notes</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('project-create')}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span>New Project</span>
                </button>
                <button
                  onClick={createNewPage}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span>New Note</span>
                </button>
                <button
                  onClick={() => onNavigate('citations')}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span>New Citation</span>
                </button>
                <button
                  onClick={() => onNavigate('document-upload')}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span>Import Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'projects' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Project Library</h2>
                <button
                  onClick={() => onNavigate('project-create')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Create your first research project to get started</p>
                  <button
                    onClick={() => onNavigate('project-create')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Project</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => onNavigate('project', project.id)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-800'
                            : project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project.stage.replace('_', ' ')}</span>
                        {project.deadline && (
                          <span>Due {project.deadline.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeModule === 'sources' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Sources Vault</h2>
                <button
                  onClick={() => onNavigate('document-upload')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Document</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-600 mb-4">Upload your first document to start building your research library</p>
                  <button
                    onClick={() => onNavigate('document-upload')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload First Document</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => onNavigate('document', doc.id)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <BookOpen className="w-8 h-8 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{doc.metadata.author}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {doc.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {doc.uploadedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeModule === 'citations' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Citations</h2>
                <button
                  onClick={() => onNavigate('citations')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Citation</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {citations.length === 0 ? (
                <div className="text-center py-12">
                  <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No citations yet</h3>
                  <p className="text-gray-600 mb-4">Create your first citation to start building your bibliography</p>
                  <button
                    onClick={() => onNavigate('citations')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Citation</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {citations.map((citation) => (
                    <div
                      key={citation.id}
                      onClick={() => onNavigate('citations')}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{citation.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {citation.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {citation.type.replace('_', ' ')}
                            </span>
                            {citation.publicationDate && (
                              <span className="text-xs text-gray-500">
                                {citation.publicationDate.getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Quote className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}