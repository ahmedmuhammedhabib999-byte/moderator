"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { promptAI, AIResponse } from "@/lib/api"

type Message = {
  author: "user" | "ai"
  text: string
}

export function AIChat() {
  const { token } = useAuth()
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!prompt.trim()) return
    addMessage({ author: "user", text: prompt })
    setPrompt("")
    setLoading(true)
    setError(null)

    try {
      const response = await promptAI(token ?? "", prompt)
      const formatted = response.changes
        .map((c) => `${c.field}: ${JSON.stringify(c.value)}${c.description ? ` (${c.description})` : ""}`)
        .join("\n")
      addMessage({ author: "ai", text: formatted || "(no changes)" })
    } catch (err: any) {
      setError(err?.message ?? "Failed to get response")
    } finally {
      setLoading(false)
    }
  }

  const latest = useMemo(() => messages.slice(-1)[0], [messages])

  useEffect(() => {
    if (!latest) return
    // Scroll into view or similar could be added here
  }, [latest])

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Describe your mod changes in natural language</p>
            <p className="text-gray-500 text-xs mt-2">Example: &quot;Make all weapons deal 50% more damage&quot;</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.author === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300'
              }`}>
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {msg.author === "user" ? "You" : "AI Assistant"}
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
              <div className="text-xs font-semibold mb-1 opacity-75">AI Assistant</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="Describe your changes..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!token || loading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading || !token}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}
