"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getProject, updateProject, exportProject, Project } from "@/lib/api"
import { FileExplorer } from "@/components/FileExplorer"
import { FileEditor } from "@/components/FileEditor"
import { AIWorkspace } from "@/components/AIWorkspace"
// import { ArrowLeft, Download, Settings } from "lucide-react"

// Simple icon components
const ArrowLeft: React.FC<{ className?: string }> = ({ className }) => <span className={className}>←</span>
const Download: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⬇</span>
const Settings: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⚙</span>

export function ProjectDetail({ projectId }: { projectId: number }) {
  const { token } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [files, setFiles] = useState<Array<{name: string, type: string, size: number}>>([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const proj = await getProject(token ?? "", projectId)
        setProject(proj)
        // TODO: Load files from backend
        setFiles([
          { name: "config.json", type: "json", size: 1024 },
          { name: "weapons.lua", type: "lua", size: 2048 },
          { name: "readme.txt", type: "txt", size: 512 },
        ])
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [projectId, token])

  const handleExport = async () => {
    try {
      const blob = await exportProject(token ?? "", projectId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.name.replace(' ', '_')}_mod.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/20 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <p className="text-xs text-gray-300">Workspace ID: {project.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            Export Mod
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-80 border-r border-white/10 bg-black/20">
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFilesUpload={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
            projectId={projectId}
          />
        </div>

        {/* Center - File Editor */}
        <div className="flex-1 bg-black/10">
          <FileEditor
            selectedFile={selectedFile}
            projectId={projectId}
          />
        </div>

        {/* Right Sidebar - AI Workspace */}
        <div className="w-96 border-l border-white/10 bg-black/20">
          <AIWorkspace projectId={projectId} />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-slate-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Workspace Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  className="w-full rounded-md border border-gray-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  defaultValue={project.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full resize-none rounded-md border border-gray-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  defaultValue={project.description || ""}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700">
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
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
