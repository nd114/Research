import React, { useState } from 'react'
import { 
  FolderOpen, 
  Plus, 
  Calendar, 
  Tag, 
  Users, 
  Target,
  CheckSquare,
  FileText,
  Settings,
  Archive,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Project, Folder, Page, ProjectStage, ProjectStatus, ProjectTemplate } from '../types'

interface ProjectManagerProps {
  project: Project
  folders: Folder[]
  pages: Page[]
  onUpdateProject: (updates: Partial<Project>) => void
  onCreateFolder: (name: string, parentId?: string) => void
  onCreatePage: (title: string, folderId?: string) => void
  onNavigateToPage: (pageId: string) => void
}

export default function ProjectManager({
  project,
  folders,
  pages,
  onUpdateProject,
  onCreateFolder,
  onCreatePage,
  onNavigateToPage
}: ProjectManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'timeline' | 'settings'>('overview')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()

  const stages = Object.values(ProjectStage)
  const statuses = Object.values(ProjectStatus)
  const templates = Object.values(ProjectTemplate)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), selectedFolderId)
      setNewFolderName('')
      setShowNewFolder(false)
      setSelectedFolderId(undefined)
    }
  }

  const renderFolderTree = (folders: Folder[], level = 0) => {
    return folders.map((folder) => (
      <div key={folder.id} className={`ml-${level * 4}`}>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{folder.name}</span>
            <span className="text-xs text-gray-500">({folder.pageIds.length} notes)</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={() => {
                setSelectedFolderId(folder.id)
                setShowNewFolder(true)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Add subfolder"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onCreatePage('Untitled', folder.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Add note"
            >
              <FileText className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Folder pages */}
        <div className={`ml-${(level + 1) * 4} space-y-1`}>
          {pages
            .filter(page => page.folderId === folder.id)
            .map(page => (
              <div
                key={page.id}
                onClick={() => onNavigateToPage(page.id)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-700">{page.title}</span>
                <span className="text-xs text-gray-500">
                  {page.updatedAt.toLocaleDateString()}
                </span>
              </div>
            ))}
        </div>
        
        {/* Subfolders */}
        {folder.children.length > 0 && renderFolderTree(folder.children, level + 1)}
      </div>
    ))
  }

  const getStageProgress = () => {
    const currentIndex = stages.indexOf(project.stage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'in_progress' 
                  ? 'bg-blue-100 text-blue-800'
                  : project.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              {project.deadline && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Due {project.deadline.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Project Progress</span>
            <span>{Math.round(getStageProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStageProgress()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Planning</span>
            <span>Research</span>
            <span>Analysis</span>
            <span>Drafting</span>
            <span>Review</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'structure', label: 'Structure', icon: FolderOpen },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Notes</span>
                  <span className="font-semibold">{pages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Folders</span>
                  <span className="font-semibold">{folders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Stage</span>
                  <span className="font-semibold capitalize">{project.stage.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Template</span>
                  <span className="font-semibold capitalize">{project.template}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {pages
                  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                  .slice(0, 5)
                  .map((page) => (
                    <div
                      key={page.id}
                      onClick={() => onNavigateToPage(page.id)}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{page.title}</p>
                        <p className="text-sm text-gray-500">
                          Updated {page.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => onCreatePage('Untitled')}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span>New Note</span>
                </button>
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span>New Folder</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-left rounded-lg hover:bg-gray-50">
                  <Archive className="w-4 h-4 text-gray-400" />
                  <span>Export Project</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Project Structure</h2>
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {folders.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                  <p className="text-gray-600 mb-4">Create folders to organize your research notes</p>
                  <button
                    onClick={() => setShowNewFolder(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Folder</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderFolderTree(folders.filter(f => !f.parentId))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => onUpdateProject({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => onUpdateProject({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stage
                  </label>
                  <select
                    value={project.stage}
                    onChange={(e) => onUpdateProject({ stage: e.target.value as ProjectStage })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={project.status}
                    onChange={(e) => onUpdateProject({ status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={project.deadline?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onUpdateProject({ 
                    deadline: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={project.template}
                  onChange={(e) => onUpdateProject({ template: e.target.value as ProjectTemplate })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {templates.map((template) => (
                    <option key={template} value={template}>
                      {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Folder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Folder
                </button>
                <button
                  onClick={() => {
                    setShowNewFolder(false)
                    setNewFolderName('')
                    setSelectedFolderId(undefined)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}