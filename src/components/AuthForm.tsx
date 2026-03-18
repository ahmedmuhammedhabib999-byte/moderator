"use client"

import { useState } from "react"

type AuthFormProps = {
  title: string
  submitLabel: string
  onSubmit: (email: string, password: string) => Promise<void>
  onSwitch?: () => void
  switchText?: string
}

export function AuthForm({ title, submitLabel, onSubmit, onSwitch, switchText }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(email, password)
    } catch (err: any) {
      setError(err?.message ?? "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 shadow-md">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Email</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Password</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Working…" : submitLabel}
        </button>
      </form>
      {onSwitch && switchText ? (
        <button
          type="button"
          onClick={onSwitch}
          className="mt-4 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground hover:bg-muted"
        >
          {switchText}
        </button>
      ) : null}
    </div>
  )
}
