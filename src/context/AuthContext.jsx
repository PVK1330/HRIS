/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
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
  'super@hris.com': {
    password: 'super123',
    user: { name: 'Alex Rivera', email: 'super@hris.com', role: 'super_admin', panel: 'superadmin' },
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
  super_admin: ['*'],
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

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    const userPermissions = PERMISSIONS[user.role] || []
    if (userPermissions.includes('*')) return true
    return userPermissions.includes(permission)
  }, [user])

  const login = useCallback((email, password) => {
    const key = email?.trim().toLowerCase()
    const account = accounts[key]
    if (!account || account.password !== password) {
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
