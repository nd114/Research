import React, { useState } from 'react'
import { ArrowLeft, Save, X } from 'lucide-react'
import { ProjectStage, ProjectStatus, ProjectTemplate } from '../types'

interface ProjectCreateProps {
  onNavigate: (view: string, id?: string) => void
  onCreateProject: (project: {
    name: string
    description: string
    stage: ProjectStage
    template: ProjectTemplate
    status: ProjectStatus
    deadline?: Date
    tags: string[]
  }) => void
}

export default function ProjectCreate({ onNavigate, onCreateProject }: ProjectCreateProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stage: ProjectStage.PLANNING,
    template: ProjectTemplate.GENERAL,
    status: ProjectStatus.NOT_STARTED,
    deadline: '',
    tags: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const stages = Object.values(ProjectStage)
  const statuses = Object.values(ProjectStatus)
  const templates = Object.values(ProjectTemplate)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const projectData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      stage: formData.stage,
      template: formData.template,
      status: formData.status,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }
    
    onCreateProject(projectData)
    onNavigate('projects')
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('projects')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-gray-600 mt-1">Set up a new research project</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your research project..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Template
                </label>
                <select
                  value={formData.template}
                  onChange={(e) => handleInputChange('template', e.target.value as ProjectTemplate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {templates.map((template) => (
                    <option key={template} value={template}>
                      {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a template that matches your research discipline
                </p>
              </div>

              {/* Stage and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => handleInputChange('stage', e.target.value as ProjectStage)}
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
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as ProjectStatus)}
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

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="research, methodology, theory (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add tags to help organize and find your project
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>Create Project</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('projects')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}