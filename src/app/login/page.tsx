"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { AuthForm } from "@/components/AuthForm"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <AuthForm title="Sign in" submitLabel="Sign in" onSubmit={login} switchText="Create account" onSwitch={() => router.push("/register")} />
    </main>
  )
}
