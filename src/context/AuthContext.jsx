/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'hris_auth_user'

const accounts = {
  // Admin Panel Roles
  'hr_admin@hris.com': {
    password: 'hradmin123',
    user: { name: 'Sarah Ahmed', email: 'hr_admin@hris.com', role: 'hr_admin', panel: 'admin' },
  },
  'hr_exec@hris.com': {
    password: 'hrexec123',
    user: { name: 'Neha Jain', email: 'hr_exec@hris.com', role: 'hr_executive', panel: 'admin', department: 'HR Operations' },
  },
  'manager@hris.com': {
    password: 'manager123',
    user: { name: 'Michael Chen', email: 'manager@hris.com', role: 'manager', panel: 'admin', department: 'Engineering' },
  },
  'employee@hris.com': {
    password: 'employee123',
    user: { name: 'John Doe', email: 'employee@hris.com', role: 'employee', panel: 'admin', department: 'Engineering' },
  },
  // SuperAdmin Panel Roles
  'superadmin@hris.com': {
    password: 'SuperAdmin123',
    user: { name: 'Root SuperAdmin', email: 'superadmin@hris.com', role: 'superadmin', panel: 'superadmin' },
  },
  'support@hris.com': {
    password: 'support123',
    user: { name: 'Support Tech', email: 'support@hris.com', role: 'support_admin', panel: 'superadmin' },
  },
  'billing@hris.com': {
    password: 'billing123',
    user: { name: 'Finance Lead', email: 'billing@hris.com', role: 'billing_admin', panel: 'superadmin' },
  },
}

const PERMISSIONS = {
  admin: ['*'],
  hr_admin: ['*'], // ALL permissions
  hr_executive: [
    'view_employees', 'view_attendance', 'approve_leave', 'view_documents',
    'approve_documents', 'view_performance', 'view_leave', 'create_policies', 'view_reports'
  ],
  manager: [
    'view_team_employees', 'view_team_attendance', 'approve_team_leave', 'view_team_performance'
  ],
  employee: [
    'view_own_profile', 'view_own_attendance', 'view_own_leave', 'view_own_documents',
    'view_own_payslips', 'submit_expense'
  ],
  superadmin: ['*'],
  support_admin: [
    'view_tenants', 'view_audit_logs', 'view_support_tickets', 'view_system_health'
  ],
  billing_admin: [
    'view_billing', 'manage_subscriptions', 'view_tenants'
  ],
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

  // Global Auto-Login Interceptor (for Impersonation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userDataStr = params.get('user')
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr))
        // Perform login
        const finalUserData = { ...userData, panel: userData.role === 'superadmin' ? 'superadmin' : 'admin' }
        setUser(finalUserData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUserData))
        localStorage.setItem('hris_token', token)
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (err) {
        console.error('Global auto-login failed:', err)
      }
    }
  }, [])

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    const userPermissions = PERMISSIONS[user.role] || []
    if (userPermissions.includes('*')) return true
    return userPermissions.includes(permission)
  }, [user])

  const login = useCallback((arg1, arg2) => {
    // Case 1: Real API Auth (user object, token)
    if (typeof arg1 === 'object' && arg2) {
      const userData = { ...arg1, panel: arg1.role === 'superadmin' ? 'superadmin' : 'admin' }
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      localStorage.setItem('hris_token', arg2)
      return null
    }

    // Case 2: Mock Auth (email, password)
    if (typeof arg1 !== 'string') return 'Invalid input type.'
    const key = arg1.trim().toLowerCase()
    const account = accounts[key]
    if (!account || account.password !== arg2) {
      return 'Invalid email or password.'
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

  const switchRole = useCallback((newRole) => {
    // Dev helper to switch role in-memory
    const matchingAccount = Object.values(accounts).find(a => a.user.role === newRole)
    if (matchingAccount) {
      setUser(matchingAccount.user)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    login,
    logout,
    hasPermission,
    switchRole
  }), [user, login, logout, hasPermission, switchRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
