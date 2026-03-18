"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import * as api from "@/lib/api"
import { clearToken, getToken, setToken } from "@/lib/storage"

type AuthContextValue = {
  token: string | null
  userEmail: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const stored = getToken()
    if (stored) {
      setTokenState(stored)
      // Token does not contain email reliably; keep email null.
    }
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password)
    setTokenState(response.access_token)
    setToken(response.access_token)
    setUserEmail(email)
  }, [])

  const register = React.useCallback(
    async (email: string, password: string) => {
      await api.register(email, password)
      await login(email, password)
    },
    [login]
  )

  const logout = React.useCallback(() => {
    setTokenState(null)
    setUserEmail(null)
    clearToken()
  }, [])

  const value = useMemo(
    () => ({
      token,
      userEmail,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, userEmail, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
