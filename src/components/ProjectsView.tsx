import React, { useState } from 'react'
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Grid,
  List,
  Calendar,
  Target,
  Users,
  Settings,
  Archive,
  Clock,
  CheckSquare,
  AlertCircle,
  Star,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'
import { Project, ProjectStage, ProjectStatus } from '../types'

interface ProjectsViewProps {
  projects: Project[]
  onNavigate: (view: string, id?: string) => void
  onCreateProject: () => void
  onUpdateProject: (id: string, updates: Partial<Project>) => void
  onDeleteProject: (id: string) => void
}

export default function ProjectsView({
  projects,
  onNavigate,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')
  const [filterStage, setFilterStage] = useState<ProjectStage | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'deadline'>('updated')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesStage = filterStage === 'all' || project.stage === filterStage
    
    return matchesSearch && matchesStatus && matchesStage
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return a.deadline.getTime() - b.deadline.getTime()
      case 'updated':
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime()
    }
  })

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800'
      case ProjectStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800'
      case ProjectStatus.NEEDS_REVIEW:
        return 'bg-purple-100 text-purple-800'
      case ProjectStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageProgress = (stage: ProjectStage) => {
    const stages = Object.values(ProjectStage)
    const currentIndex = stages.indexOf(stage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  const getUrgencyLevel = (project: Project) => {
    if (!project.deadline) return 'none'
    
    const now = new Date()
    const deadline = project.deadline
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline < 0) return 'overdue'
    if (daysUntilDeadline <= 3) return 'urgent'
    if (daysUntilDeadline <= 7) return 'soon'
    return 'normal'
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">{projects.length} projects total</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCreateProject}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {Object.values(ProjectStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as ProjectStage | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {Object.values(ProjectStage).map(stage => (
              <option key={stage} value={stage}>
                {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="deadline">Deadline</option>
          </select>

          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      <div className="p-6">
        {sortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' || filterStage !== 'all' 
                ? 'No projects found' 
                : 'No projects yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' || filterStage !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first research project to get started'
              }
            </p>
            <button
              onClick={onCreateProject}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {sortedProjects.map((project) => {
              const urgency = getUrgencyLevel(project)
              const progress = getStageProgress(project.stage)
              
              return (
                <div
                  key={project.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                    urgency === 'overdue' ? 'border-red-300' : 
                    urgency === 'urgent' ? 'border-orange-300' : ''
                  } ${viewMode === 'grid' ? 'p-6' : 'p-4'}`}
                  onClick={() => onNavigate('project', project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                        {urgency === 'overdue' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        {urgency === 'urgent' && (
                          <Clock className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Show project menu
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 capitalize">
                      {project.stage.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Template:</span>
                      <span className="font-medium capitalize">{project.template}</span>
                    </div>
                    
                    {project.deadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className={`font-medium ${
                          urgency === 'overdue' ? 'text-red-600' :
                          urgency === 'urgent' ? 'text-orange-600' :
                          urgency === 'soon' ? 'text-yellow-600' :
                          'text-gray-900'
                        }`}>
                          {project.deadline.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">{project.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{project.tags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Created {project.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Edit project
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Edit project"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteProject(project.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}