"use client"

import { useEffect, useMemo, useState } from "react"
import Editor from '@monaco-editor/react'
import { ModData, getProjectData, updateProjectData } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

type Tab = "settings" | "weapons" | "characters" | "maps" | "scripts"

const tabLabels: Record<Tab, string> = {
  settings: "Settings",
  weapons: "Weapons",
  characters: "Characters",
  maps: "Maps",
  scripts: "Scripts",
}

export function ModEditor({ projectId }: { projectId: number }) {
  const { token } = useAuth()
  const [data, setData] = useState<ModData | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("settings")
  const [draft, setDraft] = useState<string>("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const projectData = await getProjectData(token ?? "", projectId)
        setData(projectData)
        const defaultValue = activeTab === "settings" ? {} : []
        setDraft(JSON.stringify(projectData[activeTab] ?? defaultValue, null, 2))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId, token, activeTab])

  useEffect(() => {
    if (!data) return
    setDraft(JSON.stringify(data[activeTab] ?? (activeTab === "settings" ? {} : []), null, 2))
  }, [activeTab, data])

  const applyChanges = async () => {
    if (!data) return
    setStatus(null)
    try {
      const parsed = JSON.parse(draft)
      const updated: ModData = {
        ...data,
        [activeTab]: parsed,
      }
      setLoading(true)
      const saved = await updateProjectData(token ?? "", projectId, updated)
      setData(saved)
      setStatus("Saved")
    } catch (err: any) {
      setStatus(err?.message ?? "Invalid JSON")
    } finally {
      setLoading(false)
    }
  }

  const tabButtons = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        {(Object.keys(tabLabels) as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              tab === activeTab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
    ),
    [activeTab]
  )

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Mod Editor</h2>
        {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
      </div>

      <div className="mt-4">{tabButtons}</div>

      <div className="mt-4">
        {activeTab === 'scripts' ? (
          <Editor
            height="288px"
            language="json"
            value={draft}
            onChange={(value) => setDraft(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        ) : (
          <textarea
            className="h-72 w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
          onClick={applyChanges}
          disabled={loading}
        >
          Save
        </button>
        <button
          className="rounded-md bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80"
          onClick={() => {
            if (!data) return
            setDraft(JSON.stringify(data[activeTab] ?? (activeTab === "settings" ? {} : []), null, 2))
            setStatus(null)
          }}
          disabled={loading}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
