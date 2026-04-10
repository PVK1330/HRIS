/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'elitepic_auth_user'

const accounts = {
  'admin@elitepic.com': {
    password: 'admin123',
    user: { name: 'Sarah Ahmed', email: 'admin@elitepic.com', role: 'admin' },
  },
  'super@elitepic.com': {
    password: 'super123',
    user: { name: 'Demo Admin', email: 'super@elitepic.com', role: 'superadmin' },
  },
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  const login = useCallback((email, password, selectedRole) => {
    const key = email?.trim().toLowerCase()
    const account = accounts[key]
    if (!account || account.password !== password) {
      return 'Invalid email or password.'
    }
    if (selectedRole && account.user.role !== selectedRole) {
      return 'This email does not match the selected login role.'
    }
    setUser(account.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user))
    return null
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
