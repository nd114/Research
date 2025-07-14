export interface Page {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isStarred: boolean
  projectId?: string
  folderId?: string
  tags: string[]
  customFields: Record<string, any>
  version: number
  versions: PageVersion[]
}

export interface PageVersion {
  id: string
  content: string
  timestamp: Date
  changes: string
}

export interface Project {
  id: string
  name: string
  description: string
  stage: ProjectStage
  template: ProjectTemplate
  createdAt: Date
  updatedAt: Date
  deadline?: Date
  status: ProjectStatus
  customFields: Record<string, any>
  folders: Folder[]
  tags: string[]
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  projectId: string
  createdAt: Date
  children: Folder[]
  pageIds: string[]
}

export interface Document {
  id: string
  title: string
  filename: string
  type: DocumentType
  content: string
  metadata: DocumentMetadata
  tags: string[]
  customFields: Record<string, any>
  uploadedAt: Date
  size: number
  highlights: Highlight[]
  annotations: Annotation[]
}

export interface DocumentMetadata {
  author?: string
  publisher?: string
  publicationDate?: Date
  isbn?: string
  doi?: string
  url?: string
  pages?: number
  language?: string
}

export interface Highlight {
  id: string
  documentId: string
  text: string
  startOffset: number
  endOffset: number
  color: string
  tags: string[]
  note?: string
  createdAt: Date
}

export interface Annotation {
  id: string
  documentId: string
  pageNumber?: number
  x: number
  y: number
  content: string
  type: AnnotationType
  createdAt: Date
}

export interface Citation {
  id: string
  type: CitationType
  title: string
  authors: Author[]
  publicationDate?: Date
  publisher?: string
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  isbn?: string
  url?: string
  accessDate?: Date
  customFields: Record<string, any>
  tags: string[]
  notes: string
  documentId?: string
}

export interface Author {
  firstName: string
  lastName: string
  middleName?: string
}

export interface Timeline {
  id: string
  name: string
  description: string
  events: TimelineEvent[]
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: Date
  endDate?: Date
  sources: string[]
  tags: string[]
  customFields: Record<string, any>
}

export interface SearchQuery {
  text: string
  filters: SearchFilters
  savedAs?: string
}

export interface SearchFilters {
  documentTypes?: DocumentType[]
  citationTypes?: CitationType[]
  tags?: string[]
  authors?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  projects?: string[]
  customFields?: Record<string, any>
}

export interface Template {
  id: string
  name: string
  description: string
  type: TemplateType
  content: string
  fields: TemplateField[]
  checklist: ChecklistItem[]
}

export interface TemplateField {
  id: string
  name: string
  type: FieldType
  required: boolean
  defaultValue?: any
  options?: string[]
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  dueDate?: Date
  assignee?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  preferences: UserPreferences
  customFields: Record<string, any>
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  citationStyle: CitationStyle
  defaultProjectTemplate: ProjectTemplate
  keyboardShortcuts: Record<string, string>
  autoSave: boolean
  backupFrequency: BackupFrequency
}

// Enums
export enum ProjectStage {
  PLANNING = 'planning',
  RESEARCH = 'research',
  LITERATURE = 'literature',
  DATA_COLLECTION = 'data_collection',
  ANALYSIS = 'analysis',
  DRAFTING = 'drafting',
  REVIEW = 'review',
  FINALIZED = 'finalized'
}

export enum ProjectStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  NEEDS_REVIEW = 'needs_review',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ProjectTemplate {
  GENERAL = 'general',
  SCIENTIFIC = 'scientific',
  THEOLOGICAL = 'theological',
  JOURNALISTIC = 'journalistic',
  HISTORICAL = 'historical',
  LITERARY = 'literary',
  LEGAL = 'legal'
}

export enum DocumentType {
  PDF = 'pdf',
  EPUB = 'epub',
  DOCX = 'docx',
  TXT = 'txt',
  HTML = 'html',
  MARKDOWN = 'markdown',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export enum CitationType {
  BOOK = 'book',
  JOURNAL_ARTICLE = 'journal_article',
  CONFERENCE_PAPER = 'conference_paper',
  THESIS = 'thesis',
  WEBSITE = 'website',
  NEWSPAPER = 'newspaper',
  MAGAZINE = 'magazine',
  SCRIPTURE = 'scripture',
  INTERVIEW = 'interview',
  MANUSCRIPT = 'manuscript',
  GOVERNMENT_DOCUMENT = 'government_document',
  LEGAL_CASE = 'legal_case'
}

export enum CitationStyle {
  APA = 'apa',
  MLA = 'mla',
  CHICAGO = 'chicago',
  HARVARD = 'harvard',
  IEEE = 'ieee',
  VANCOUVER = 'vancouver',
  TURABIAN = 'turabian'
}

export enum AnnotationType {
  NOTE = 'note',
  HIGHLIGHT = 'highlight',
  BOOKMARK = 'bookmark',
  DRAWING = 'drawing'
}

export enum TemplateType {
  PROJECT = 'project',
  NOTE = 'note',
  DOCUMENT = 'document',
  CITATION = 'citation'
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  TEXTAREA = 'textarea'
}

export enum BackupFrequency {
  NEVER = 'never',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}