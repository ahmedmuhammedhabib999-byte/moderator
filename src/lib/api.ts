// Use production URL if available, otherwise localhost for development
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://YOUR-BACKEND-URL.onrender.com/api/v1'  // Replace with your actual backend URL
    : 'http://localhost:8000/api/v1')

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
    try {
      const json = JSON.parse(text)
      msg = json.detail ?? JSON.stringify(json)
    } catch {
      // ignore
    }
    throw new Error(msg || res.statusText)
  }
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<any>(res)
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<LoginResponse>(res)
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
