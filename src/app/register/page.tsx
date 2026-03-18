"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { AuthForm } from "@/components/AuthForm"

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <AuthForm title="Create account" submitLabel="Sign up" onSubmit={register} switchText="Already have an account" onSwitch={() => router.push("/login")} />
    </main>
  )
}
