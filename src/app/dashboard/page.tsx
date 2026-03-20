"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { listProjects, createProject } from "@/lib/api"
// import { Plus, FolderOpen, Clock, Zap } from "lucide-react"

// Simple icon components
const Plus: React.FC<{ className?: string }> = ({ className }) => <span className={className}>+</span>
const FolderOpen: React.FC<{ className?: string }> = ({ className }) => <span className={className}>📁</span>
const Clock: React.FC<{ className?: string }> = ({ className }) => <span className={className}>🕐</span>
const Zap: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⚡</span>

export default function DashboardPage() {
  const { token, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Array<{ id: number; name: string; description?: string; created_at?: string }>>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace("/login")
      return
    }

    const fetchProjects = async () => {
      setLoading(true)
      try {
        const list = await listProjects(token)
        setProjects(list)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes("Could not validate") || message.includes("401")) {
          // Token is invalid/expired; force logout and redirect to login.
          logout()
          router.replace("/login")
          return
        }
        // Avoid triggering Next.js dev overlay via console.error for handled errors.
        console.warn("Failed to load projects:", message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [isAuthenticated, router, token, logout])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    try {
      const project = await createProject(token ?? "", name, description)
      setProjects((prev) => [project, ...prev])
      setName("")
      setDescription("")
      setShowCreateForm(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">ModForge AI Studio</h1>
          <p className="text-sm text-gray-300">Your AI-powered modding workspace</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </button>
          <button
            className="rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-gray-300">Continue working on your mods or start a new project.</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
                <p className="text-sm text-gray-300">Workspaces</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-gray-300">Hours Today</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-gray-300">AI Generations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Your Workspaces</h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-300">Loading workspaces...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No workspaces yet</h4>
              <p className="text-gray-300 mb-6">Create your first workspace to start modding with AI.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block rounded-lg border border-white/20 bg-white/5 p-6 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FolderOpen className="h-6 w-6 text-purple-400" />
                    <span className="text-xs text-gray-400">View</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 mb-2">
                    {project.name}
                  </h4>
                  {project.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">{project.description}</p>
                  )}
                  {project.created_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-slate-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Workspace</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Workspace Name</label>
                <input
                  className="w-full rounded-md border border-gray-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Mod"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  className="w-full resize-none rounded-md border border-gray-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your mod project..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  disabled={!name.trim()}
                >
                  Create Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
