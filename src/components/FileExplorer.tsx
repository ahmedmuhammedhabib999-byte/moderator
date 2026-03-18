"use client"

import { useRef, useState } from "react"
import { uploadFiles } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
// import { Upload, FileText, Image, Archive, X } from "lucide-react"

// Simple icon components
const Upload: React.FC<{ className?: string }> = ({ className }) => <span className={className}>⬆</span>
const FileText: React.FC<{ className?: string }> = ({ className }) => <span className={className}>📄</span>
const IconImage: React.FC<{ className?: string }> = ({ className }) => <span className={className}>🖼</span>
const Archive: React.FC<{ className?: string }> = ({ className }) => <span className={className}>📦</span>
const X: React.FC<{ className?: string }> = ({ className }) => <span className={className}>✕</span>

interface FileItem {
  name: string
  type: string
  size: number
}

interface FileExplorerProps {
  files: FileItem[]
  selectedFile: string | null
  onFileSelect: (fileName: string | null) => void
  onFilesUpload: (files: FileItem[]) => void
  projectId: number
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'json':
    case 'xml':
    case 'yaml':
    case 'lua':
    case 'txt':
      return <FileText className="h-4 w-4 text-blue-400" />
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <IconImage className="h-4 w-4 text-pink-400" />
    case 'zip':
      return <Archive className="h-4 w-4 text-orange-400" />
    default:
      return <FileText className="h-4 w-4 text-gray-400" />
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function FileExplorer({ files, selectedFile, onFileSelect, onFilesUpload, projectId }: FileExplorerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles || !token) return

    setUploading(true)
    try {
      const fileArray = Array.from(uploadedFiles)
      await uploadFiles(token, projectId, fileArray)
      
      const newFiles: FileItem[] = fileArray.map(file => ({
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size
      }))

      onFilesUpload(newFiles)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFiles = event.dataTransfer.files
    if (!droppedFiles || !token) return

    setUploading(true)
    try {
      const fileArray = Array.from(droppedFiles)
      await uploadFiles(token, projectId, fileArray)
      
      const newFiles: FileItem[] = fileArray.map(file => ({
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size
      }))

      onFilesUpload(newFiles)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Files</h2>

        {/* Upload Area */}
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-600 p-4 text-center transition-colors hover:border-purple-400 hover:bg-white/5"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
          <p className="text-sm text-gray-300">Drop files here or click to upload</p>
          <p className="text-xs text-gray-500 mt-1">JSON, XML, YAML, LUA, TXT, PNG, JPG, ZIP</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.xml,.yaml,.lua,.txt,.png,.jpg,.jpeg,.zip"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-8 w-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => onFileSelect(selectedFile === file.name ? null : file.name)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selectedFile === file.name
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}