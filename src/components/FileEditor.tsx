"use client"

import { useEffect, useState } from "react"
import Editor from '@monaco-editor/react'
// import { FileText, Image, AlertCircle } from "lucide-react"

// Simple icon components
const FileText: React.FC<{ className?: string }> = ({ className }) => <span className={className}>📄</span>
const IconImage: React.FC<{ className?: string }> = ({ className }) => <span className={className}>🖼</span>
const AlertCircle: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⚠</span>

interface FileEditorProps {
  selectedFile: string | null
  projectId: number
}

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json':
      return 'json'
    case 'xml':
      return 'xml'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'lua':
      return 'lua'
    case 'txt':
    default:
      return 'plaintext'
  }
}

const isImageFile = (fileName: string): boolean => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ['png', 'jpg', 'jpeg'].includes(ext || '')
}

export function FileEditor({ selectedFile, projectId }: FileEditorProps) {
  const [fileContent, setFileContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFile) {
      setFileContent('')
      setError(null)
      return
    }

    const loadFile = async () => {
      setLoading(true)
      setError(null)
      try {
        // TODO: Load file content from backend
        // For now, show placeholder content based on file type
        if (isImageFile(selectedFile)) {
          setFileContent('') // Images will be handled separately
        } else {
          const language = getLanguageFromFileName(selectedFile)
          let placeholder = ''

          switch (language) {
            case 'json':
              placeholder = `{\n  "name": "example",\n  "version": "1.0.0",\n  "description": "Example configuration"\n}`
              break
            case 'xml':
              placeholder = `<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n  <setting name="example">value</setting>\n</configuration>`
              break
            case 'yaml':
              placeholder = `name: example\nversion: "1.0.0"\ndescription: Example configuration`
              break
            case 'lua':
              placeholder = `-- Example Lua script\nlocal config = {\n  name = "example",\n  version = "1.0.0"\n}\n\nreturn config`
              break
            default:
              placeholder = `This is a text file.\n\nFile: ${selectedFile}\n\nAdd your content here...`
          }

          setFileContent(placeholder)
        }
      } catch (err) {
        setError('Failed to load file')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadFile()
  }, [selectedFile])

  const handleSave = async () => {
    if (!selectedFile) return

    try {
      // TODO: Save file content to backend
      console.log('Saving file:', selectedFile, fileContent)
      // Show success message
    } catch (err) {
      setError('Failed to save file')
      console.error(err)
    }
  }

  if (!selectedFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No file selected</h3>
          <p className="text-gray-400">Select a file from the explorer to view or edit it</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error loading file</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (isImageFile(selectedFile)) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white">{selectedFile}</h2>
        </div>

        {/* Image Viewer */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <IconImage className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Image Preview</h3>
            <p className="text-gray-400 mb-4">Image preview will be displayed here</p>
            <p className="text-sm text-gray-500">File: {selectedFile}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">{selectedFile}</h2>
        <button
          onClick={handleSave}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
        >
          Save Changes
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguageFromFileName(selectedFile)}
          value={fileContent}
          onChange={(value) => setFileContent(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}