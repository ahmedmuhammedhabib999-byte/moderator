// Determine API_BASE with proper fallback chain:
// 1. Use NEXT_PUBLIC_API_BASE_URL if explicitly set (deployment override)
// 2. Use localhost for development (detected by hostname)
// 3. Fall back to production Render URL
function getAPIBase(): string {
  // If explicitly set in environment, use it
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }

  // Check if running in browser
  if (typeof window === 'undefined') {
    // Server-side, use production
    return 'https://moderator-1-zi2v.onrender.com/api/v1'
  }

  // Client-side detection
  const hostname = window.location.hostname
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'

  if (isLocal) {
    return 'http://localhost:8000/api/v1'
  }

  // Production deployment (Render, Vercel, etc.)
  return 'https://moderator-1-zi2v.onrender.com/api/v1'
}

const API_BASE = getAPIBase()

// Development logging
if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')) {
  console.log('[API] Base URL:', API_BASE)
  console.log('[API] Environment:', process.env.NODE_ENV)
  console.log('[API] Hostname:', window.location.hostname)
}

export type LoginResponse = {
  access_token: string
  token_type: string
}

export type Project = {
  id: number
  name: string
  description?: string
  user_id: number
}

export type AIChange = {
  field: string
  value: unknown
  description?: string
}

export type AIResponse = {
  type: "settings" | "weapons" | "characters" | "maps" | "scripts"
  changes: AIChange[]
}

export type ModData = {
  project_id: number
  settings?: Record<string, unknown>
  weapons?: Array<Record<string, unknown>>
  characters?: Array<Record<string, unknown>>
  maps?: Array<Record<string, unknown>>
  scripts?: Array<Record<string, unknown>>
}

function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()

  if (!res.ok) {
    let msg = text
    let detail = ''

    try {
      const json = JSON.parse(text)
      msg = json.detail ?? json.message ?? JSON.stringify(json)
    } catch (e) {
      // If response is HTML (404 page), it's likely a routing error
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        detail = `Backend error: ${res.status} ${res.statusText}. Possible cause: incorrect API URL or backend not running.`
      }
    }

    const errorMessage = detail || msg || res.statusText || 'Unknown error'
    console.error('[API] Error:', { status: res.status, message: errorMessage, url: res.url })
    throw new Error(errorMessage)
  }

  if (!text) return {} as T

  try {
    return JSON.parse(text) as T
  } catch (e) {
    console.error('[API] Failed to parse response:', text)
    throw new Error('Invalid response format from server')
  }
}

export async function register(email: string, password: string) {
  try {
    const url = `${API_BASE}/register`
    console.log('[AUTH] Registering at:', url)

    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    })

    return handleResponse<any>(res)
  } catch (error) {
    console.error('[AUTH] Registration error:', error)
    throw error
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const url = `${API_BASE}/login`
    console.log('[AUTH] Logging in at:', url)

    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    })

    return handleResponse<LoginResponse>(res)
  } catch (error) {
    console.error('[AUTH] Login error:', error)
    throw error
  }
}

export async function listProjects(token: string): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<Project[]>(res)
}

export async function createProject(token: string, name: string, description?: string) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name, description }),
  })
  return handleResponse<Project>(res)
}

export async function getProject(token: string, projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<Project>(res)
}

export async function updateProject(token: string, projectId: number, payload: Partial<Pick<Project, "name" | "description">>) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return handleResponse<Project>(res)
}

export async function getProjectData(token: string, projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/data`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<ModData>(res)
}

export async function updateProjectData(token: string, projectId: number, data: ModData) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/data`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<ModData>(res)
}

export async function promptAI(token: string, prompt: string) {
  const res = await fetch(`${API_BASE}/ai/prompt`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ prompt }),
  })
  return handleResponse<AIResponse>(res)
}

export async function exportProject(token: string, projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/export`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res.blob()
}

export async function uploadFiles(token: string, projectId: number, files: File[]) {
  const formData = new FormData()
  files.forEach(file => formData.append("files", file))
  
  const res = await fetch(`${API_BASE}/projects/${projectId}/upload`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  })
  return handleResponse<any>(res)
}

export async function listProjectFiles(token: string, projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/files`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<any[]>(res)
}

export async function getProjectFile(token: string, projectId: number, fileId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/files/${fileId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<any>(res)
}

export async function analyzeProjectFiles(token: string, projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/analyze`, {
    method: "POST",
    headers: getAuthHeaders(token),
  })
  return handleResponse<any>(res)
}

export async function applyAIChanges(token: string, projectId: number, changes: any) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/apply-changes`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(changes),
  })
  return handleResponse<any>(res)
}
