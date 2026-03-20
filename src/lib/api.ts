// API Configuration with comprehensive error handling and health checks
// This ensures correct backend routing for both local and production deployments

const DEFAULT_API_BASE = "https://moderator-1-zi2v.onrender.com/api/v1"

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim() || (() => {
  if (typeof window === 'undefined') {
    return DEFAULT_API_BASE
  }
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api/v1'
  }
  return DEFAULT_API_BASE
})()

// Development logging for debugging
if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')) {
  console.log('[API] Base URL:', API_BASE)
  console.log('[API] Environment:', process.env.NODE_ENV)
  console.log('[API] Hostname:', window.location.hostname)
}

async function fetchWithDebug(url: string, options: RequestInit): Promise<Response> {
  console.log('[API] Request URL:', url)
  console.log('[API] Request method:', options.method ?? 'GET')

  const res = await fetch(url, options)
  const contentType = res.headers.get('content-type') ?? ''
  const isHTML = contentType.includes('text/html')

  console.log('[API] Response status:', res.status)
  console.log('[API] Response content-type:', contentType)
  console.log('[API] Response type:', isHTML ? 'HTML' : 'JSON')

  if (!res.ok) {
    const text = await res.text()
    let msg = text
    let detail = ''

    try {
      const json = JSON.parse(text)
      msg = json.detail ?? json.message ?? JSON.stringify(json)
    } catch (e) {
      if (isHTML) {
        detail = "Backend returned HTML (404 page). Check if backend URL is wrong or backend is not running."
      }
    }

    const errorMessage = detail || msg || res.statusText || 'Unknown error'
    console.error('[API] Error:', { status: res.status, message: errorMessage, url, contentType, body: text.substring(0, 300) })
    throw new Error(errorMessage)
  }

  return res
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

// Health check - verify backend is responsive
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const healthUrl = `${API_BASE.replace('/api/v1', '')}/`
    console.log('[HEALTH] Checking backend at:', healthUrl)
    
    const res = await fetchWithDebug(healthUrl, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) 
    })
    
    if (!res.ok) {
      console.warn('[HEALTH] Backend health check failed:', res.status, res.statusText)
      return false
    }
    
    // Check if response is JSON (backend) or HTML (frontend)
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('text/html')) {
      console.error('[HEALTH] Backend returned HTML instead of JSON. Wrong URL or frontend deployed instead of backend.')
      return false
    }
    
    const data = await res.json()
    console.log('[HEALTH] Backend is healthy:', data)
    return true
  } catch (error) {
    console.error('[HEALTH] Backend unreachable:', error)
    return false
  }
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
      // If response is HTML, it's likely a routing error (wrong backend URL)
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        detail = `Backend returned HTML (404 page) instead of JSON. Possible causes:
1. Wrong API URL: ${API_BASE}
2. Backend not running on Render/deployment
3. Frontend deployed instead of backend

Check:
- NEXT_PUBLIC_API_BASE_URL environment variable
- Backend is deployed separately on Render
- Backend is actually running (check Render logs)`
      }
    }

    const errorMessage = detail || msg || res.statusText || 'Unknown error'
    console.error('[API] Error:', { status: res.status, message: errorMessage, url: res.url, body: text.substring(0, 200) })
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

    const res = await fetchWithDebug(url, {
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

    const res = await fetchWithDebug(url, {
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
  const res = await fetchWithDebug(`${API_BASE}/projects`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<Project[]>(res)
}

export async function createProject(token: string, name: string, description?: string) {
  const res = await fetchWithDebug(`${API_BASE}/projects`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name, description }),
  })
  return handleResponse<Project>(res)
}

export async function getProject(token: string, projectId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<Project>(res)
}

export async function updateProject(token: string, projectId: number, payload: Partial<Pick<Project, "name" | "description">>) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return handleResponse<Project>(res)
}

export async function deleteProject(token: string, projectId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  })
  return handleResponse<{ detail: string }>(res)
}

export async function getProjectData(token: string, projectId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/data`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<ModData>(res)
}

export async function updateProjectData(token: string, projectId: number, data: ModData) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/data`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<ModData>(res)
}

export async function promptAI(token: string, prompt: string) {
  const res = await fetchWithDebug(`${API_BASE}/ai/prompt`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ prompt }),
  })
  return handleResponse<AIResponse>(res)
}

export async function exportProject(token: string, projectId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/export`, {
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
  
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/upload`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  })
  return handleResponse<any>(res)
}

export async function listProjectFiles(token: string, projectId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/files`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<any[]>(res)
}

export async function getProjectFile(token: string, projectId: number, fileId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/files/${fileId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  })
  return handleResponse<any>(res)
}

export async function analyzeProjectFiles(token: string, projectId: number) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/analyze`, {
    method: "POST",
    headers: getAuthHeaders(token),
  })
  return handleResponse<any>(res)
}

export async function applyAIChanges(token: string, projectId: number, changes: any) {
  const res = await fetchWithDebug(`${API_BASE}/projects/${projectId}/apply-changes`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(changes),
  })
  return handleResponse<any>(res)
}
