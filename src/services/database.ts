// Database service abstraction layer
export interface DatabaseService {
  // User management
  signUp(email: string, password: string): Promise<{ user: any; error?: string }>
  signIn(email: string, password: string): Promise<{ user: any; error?: string }>
  signOut(): Promise<void>
  getCurrentUser(): Promise<any>

  // Pages
  getPages(userId: string): Promise<any[]>
  createPage(userId: string, page: any): Promise<any>
  updatePage(userId: string, pageId: string, updates: any): Promise<any>
  deletePage(userId: string, pageId: string): Promise<void>

  // Projects
  getProjects(userId: string): Promise<any[]>
  createProject(userId: string, project: any): Promise<any>
  updateProject(userId: string, projectId: string, updates: any): Promise<any>
  deleteProject(userId: string, projectId: string): Promise<void>

  // Documents
  getDocuments(userId: string): Promise<any[]>
  createDocument(userId: string, document: any): Promise<any>
  updateDocument(userId: string, documentId: string, updates: any): Promise<any>
  deleteDocument(userId: string, documentId: string): Promise<void>

  // Citations
  getCitations(userId: string): Promise<any[]>
  createCitation(userId: string, citation: any): Promise<any>
  updateCitation(userId: string, citationId: string, updates: any): Promise<any>
  deleteCitation(userId: string, citationId: string): Promise<void>

  // Real-time subscriptions
  subscribeToPages(userId: string, callback: (pages: any[]) => void): () => void
  subscribeToProjects(userId: string, callback: (projects: any[]) => void): () => void
}

// Local storage implementation (current)
class LocalStorageDatabase implements DatabaseService {
  private currentUser = { id: 'local-user', email: 'local@user.com' }

  async signUp(email: string, password: string) {
    return { user: this.currentUser }
  }

  async signIn(email: string, password: string) {
    return { user: this.currentUser }
  }

  async signOut() {
    // No-op for local storage
  }

  async getCurrentUser() {
    return this.currentUser
  }

  async getPages(userId: string) {
    const stored = localStorage.getItem('notion-app-pages')
    return stored ? JSON.parse(stored) : []
  }

  async createPage(userId: string, page: any) {
    const pages = await this.getPages(userId)
    const newPage = { ...page, id: Date.now().toString() }
    pages.push(newPage)
    localStorage.setItem('notion-app-pages', JSON.stringify(pages))
    return newPage
  }

  async updatePage(userId: string, pageId: string, updates: any) {
    const pages = await this.getPages(userId)
    const index = pages.findIndex((p: any) => p.id === pageId)
    if (index !== -1) {
      pages[index] = { ...pages[index], ...updates }
      localStorage.setItem('notion-app-pages', JSON.stringify(pages))
      return pages[index]
    }
    throw new Error('Page not found')
  }

  async deletePage(userId: string, pageId: string) {
    const pages = await this.getPages(userId)
    const filtered = pages.filter((p: any) => p.id !== pageId)
    localStorage.setItem('notion-app-pages', JSON.stringify(filtered))
  }

  async getProjects(userId: string) {
    const stored = localStorage.getItem('notion-app-projects')
    return stored ? JSON.parse(stored) : []
  }

  async createProject(userId: string, project: any) {
    const projects = await this.getProjects(userId)
    const newProject = { ...project, id: Date.now().toString() }
    projects.push(newProject)
    localStorage.setItem('notion-app-projects', JSON.stringify(projects))
    return newProject
  }

  async updateProject(userId: string, projectId: string, updates: any) {
    const projects = await this.getProjects(userId)
    const index = projects.findIndex((p: any) => p.id === projectId)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates }
      localStorage.setItem('notion-app-projects', JSON.stringify(projects))
      return projects[index]
    }
    throw new Error('Project not found')
  }

  async deleteProject(userId: string, projectId: string) {
    const projects = await this.getProjects(userId)
    const filtered = projects.filter((p: any) => p.id !== projectId)
    localStorage.setItem('notion-app-projects', JSON.stringify(filtered))
  }

  async getDocuments(userId: string) {
    const stored = localStorage.getItem('notion-app-documents')
    return stored ? JSON.parse(stored) : []
  }

  async createDocument(userId: string, document: any) {
    const documents = await this.getDocuments(userId)
    const newDocument = { ...document, id: Date.now().toString() }
    documents.push(newDocument)
    localStorage.setItem('notion-app-documents', JSON.stringify(documents))
    return newDocument
  }

  async updateDocument(userId: string, documentId: string, updates: any) {
    const documents = await this.getDocuments(userId)
    const index = documents.findIndex((d: any) => d.id === documentId)
    if (index !== -1) {
      documents[index] = { ...documents[index], ...updates }
      localStorage.setItem('notion-app-documents', JSON.stringify(documents))
      return documents[index]
    }
    throw new Error('Document not found')
  }

  async deleteDocument(userId: string, documentId: string) {
    const documents = await this.getDocuments(userId)
    const filtered = documents.filter((d: any) => d.id !== documentId)
    localStorage.setItem('notion-app-documents', JSON.stringify(filtered))
  }

  async getCitations(userId: string) {
    const stored = localStorage.getItem('notion-app-citations')
    return stored ? JSON.parse(stored) : []
  }

  async createCitation(userId: string, citation: any) {
    const citations = await this.getCitations(userId)
    const newCitation = { ...citation, id: Date.now().toString() }
    citations.push(newCitation)
    localStorage.setItem('notion-app-citations', JSON.stringify(citations))
    return newCitation
  }

  async updateCitation(userId: string, citationId: string, updates: any) {
    const citations = await this.getCitations(userId)
    const index = citations.findIndex((c: any) => c.id === citationId)
    if (index !== -1) {
      citations[index] = { ...citations[index], ...updates }
      localStorage.setItem('notion-app-citations', JSON.stringify(citations))
      return citations[index]
    }
    throw new Error('Citation not found')
  }

  async deleteCitation(userId: string, citationId: string) {
    const citations = await this.getCitations(userId)
    const filtered = citations.filter((c: any) => c.id !== citationId)
    localStorage.setItem('notion-app-citations', JSON.stringify(filtered))
  }

  subscribeToPages(userId: string, callback: (pages: any[]) => void) {
    // For local storage, we'll use a simple polling mechanism
    const interval = setInterval(async () => {
      const pages = await this.getPages(userId)
      callback(pages)
    }, 1000)
    
    return () => clearInterval(interval)
  }

  subscribeToProjects(userId: string, callback: (projects: any[]) => void) {
    const interval = setInterval(async () => {
      const projects = await this.getProjects(userId)
      callback(projects)
    }, 1000)
    
    return () => clearInterval(interval)
  }
}

// Supabase implementation (ready for connection)
class SupabaseDatabase implements DatabaseService {
  private supabase: any = null

  constructor() {
    // TODO: Initialize Supabase client when ready
    // this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async signUp(email: string, password: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase.auth.signUp({ email, password })
    return { user: data.user, error: error?.message }
  }

  async signIn(email: string, password: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })
    return { user: data.user, error: error?.message }
  }

  async signOut() {
    if (!this.supabase) throw new Error('Database not connected')
    await this.supabase.auth.signOut()
  }

  async getCurrentUser() {
    if (!this.supabase) throw new Error('Database not connected')
    const { data } = await this.supabase.auth.getUser()
    return data.user
  }

  async getPages(userId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }

  async createPage(userId: string, page: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('pages')
      .insert({ ...page, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async updatePage(userId: string, pageId: string, updates: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('pages')
      .update(updates)
      .eq('id', pageId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async deletePage(userId: string, pageId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { error } = await this.supabase
      .from('pages')
      .delete()
      .eq('id', pageId)
      .eq('user_id', userId)
    if (error) throw error
  }

  async getProjects(userId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }

  async createProject(userId: string, project: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...project, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async updateProject(userId: string, projectId: string, updates: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async deleteProject(userId: string, projectId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)
    if (error) throw error
  }

  async getDocuments(userId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }

  async createDocument(userId: string, document: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('documents')
      .insert({ ...document, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async updateDocument(userId: string, documentId: string, updates: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async deleteDocument(userId: string, documentId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId)
    if (error) throw error
  }

  async getCitations(userId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('citations')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }

  async createCitation(userId: string, citation: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('citations')
      .insert({ ...citation, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async updateCitation(userId: string, citationId: string, updates: any) {
    if (!this.supabase) throw new Error('Database not connected')
    const { data, error } = await this.supabase
      .from('citations')
      .update(updates)
      .eq('id', citationId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async deleteCitation(userId: string, citationId: string) {
    if (!this.supabase) throw new Error('Database not connected')
    const { error } = await this.supabase
      .from('citations')
      .delete()
      .eq('id', citationId)
      .eq('user_id', userId)
    if (error) throw error
  }

  subscribeToPages(userId: string, callback: (pages: any[]) => void) {
    if (!this.supabase) throw new Error('Database not connected')
    const subscription = this.supabase
      .channel('pages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pages', filter: `user_id=eq.${userId}` },
        () => this.getPages(userId).then(callback)
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }

  subscribeToProjects(userId: string, callback: (projects: any[]) => void) {
    if (!this.supabase) throw new Error('Database not connected')
    const subscription = this.supabase
      .channel('projects')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${userId}` },
        () => this.getProjects(userId).then(callback)
      )
      .subscribe()
    
    return () => subscription.unsubscribe()
  }
}

// Export the current implementation
export const database: DatabaseService = new LocalStorageDatabase()

// Function to switch to Supabase when ready
export const switchToSupabase = () => {
  // TODO: Implement when Supabase is connected
  // return new SupabaseDatabase()
}