"use client"

import { useState } from "react"
import { AIChat } from "@/components/AIChat"
import { analyzeProjectFiles, applyAIChanges } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
// import { Zap, Eye, Download, Play } from "lucide-react"

// Simple icon components
const Zap: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⚡</span>
const Eye: React.FC<{ className?: string }> = ({ className }) => <span className={className}>👁</span>
const Download: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⬇</span>
const Play: React.FC<{ className?: string }> = ({ className }) => <span className={className}>▶</span>

interface AIWorkspaceProps {
  projectId: number
}

export function AIWorkspace({ projectId }: AIWorkspaceProps) {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<'chat' | 'actions'>('chat')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzing_result, setAnalysisResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!token) return
    setAnalyzing(true)
    try {
      const result = await analyzeProjectFiles(token, projectId)
      setAnalysisResult(result)
    } catch (err) {
      console.error("Analysis failed:", err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Generating preview...')
  }

  const handleApplyChanges = async () => {
    if (!token) return
    try {
      const result = await applyAIChanges(token, projectId, {
        file_id: 1,  // TODO: Get from selected file
        modifications: []  // TODO: Get from AI response
      })
      console.log("Changes applied:", result)
    } catch (err) {
      console.error("Apply failed:", err)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'actions'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Actions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="h-full">
            <AIChat />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">AI Workflow</h3>

            {/* Analyze Step */}
            <div className="rounded-lg bg-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">1. Analyze Files</h4>
                  <p className="text-sm text-gray-300">AI analyzes your uploaded files</p>
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {analyzing ? "Analyzing..." : "Analyze Files"}
              </button>
              {analyzing_result && (
                <div className="mt-2 text-xs text-gray-300">
                  <p>✓ Found {analyzing_result.total_files} files</p>
                </div>
              )}
            </div>

            {/* AI Prompt Step */}
            <div className="rounded-lg bg-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">2. AI Prompt</h4>
                  <p className="text-sm text-gray-300">Describe changes in the chat above</p>
                </div>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-lg bg-purple-600/20 px-3 py-1 text-sm text-purple-300">
                  <Zap className="h-4 w-4" />
                  Use AI Chat
                </span>
              </div>
            </div>

            {/* Apply Changes Step */}
            <div className="rounded-lg bg-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">3. Apply Changes</h4>
                  <p className="text-sm text-gray-300">Apply AI-generated modifications</p>
                </div>
              </div>
              <button
                onClick={handleApplyChanges}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                Apply Changes
              </button>
            </div>

            {/* Preview Step */}
            <div className="rounded-lg bg-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">4. Preview</h4>
                  <p className="text-sm text-gray-300">Review changes before export</p>
                </div>
              </div>
              <button
                onClick={handlePreview}
                className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
              >
                Generate Preview
              </button>
            </div>

            {/* Export Step */}
            <div className="rounded-lg bg-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">5. Export</h4>
                  <p className="text-sm text-gray-300">Download your completed mod</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400">
                Use Export button in header
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}