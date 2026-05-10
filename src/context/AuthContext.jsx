/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

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

/** Same normalization as AdminLayout so API feature_code values match our keys */
function normalizeTenantFeatureCode(code) {
  return String(code || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, '_and_')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Maps subscription / plan feature codes (from access-profile & login) to sidebar PermissionGate keys.
 * Keep in sync with AdminLayout FEATURE_PATH_MAP + nav item keys.
 */
const TENANT_FEATURE_CODE_TO_MODULE_KEYS = {
  employee_management: ['employee-directory', 'employee-profiles'],
  employee_directory: ['employee-directory', 'employee-profiles'],
  attendance_tracking: ['attendance', 'time-tracking', 'shift-management', 'overtime-management'],
  attendance: ['attendance'],
  leave_management: ['leave-absence'],
  leave: ['leave-absence'],
  document_management: ['documents-approval'],
  documents: ['documents-approval'],
  performance_management: ['performance'],
  performance_reviews: ['performance'],
  performance: ['performance'],
  onboarding: ['onboarding'],
  exit_management: ['exit-management'],
  onboarding_exit: ['onboarding', 'exit-management'],
  payroll: ['payroll-management'],
  payroll_management: ['payroll-management'],
  expense_management: ['expenses'],
  expenses: ['expenses'],
  billing_invoicing: ['billing-invoicing'],
  template_generation: ['letter-templates'],
  policies: ['policies'],
  reports_analytics: ['reports-analytics'],
  announcements: ['announcements'],
  asset_management: ['assets'],
  time_tracking: ['time-tracking'],
  shift_management: ['shift-management'],
  overtime_management: ['overtime-management'],
  training_development: ['training-development'],
  department: ['departments'],
  departments: ['departments'],
  projects: [],
  task_management: [],
  messages: ['messages'],
  message_center: ['messages'],
  visa_management: ['visa-nationality'],
  visa: ['visa-nationality'],
  visa_nationality: ['visa-nationality'],
  visa_and_nationality: ['visa-nationality'],
  settings: [],
  system_settings: [],
}

function moduleKeysForTenantFeatureCodes(tenantFeatures) {
  const out = new Set()
  const list = Array.isArray(tenantFeatures) ? tenantFeatures : []
  for (const f of list) {
    if (f?.is_enabled === false) continue
    const raw = String(f?.feature_code || '')
    const norm = normalizeTenantFeatureCode(raw)
    const synonyms = [norm, raw.toLowerCase().trim()].filter(Boolean)
    for (const syn of synonyms) {
      let keys =
        TENANT_FEATURE_CODE_TO_MODULE_KEYS[syn] ||
        TENANT_FEATURE_CODE_TO_MODULE_KEYS[normalizeTenantFeatureCode(syn)]

      /* legacy / alternate codes */
      if (!keys && syn === 'documents') keys = TENANT_FEATURE_CODE_TO_MODULE_KEYS.document_management
      if (!keys && syn === 'onboarding_exit') keys = TENANT_FEATURE_CODE_TO_MODULE_KEYS.onboarding_exit

      for (const mk of keys || []) out.add(mk)
    }
  }
  return out
}

/** For org admins and portal employees. undefined → not applicable; null → no tenant_features rows (unrestricted sidebar match). */
function computePlanModuleKeysForTenantUser(userRole, tenantFeatures) {
  if (userRole !== 'admin' && userRole !== 'employee') return undefined

  const list = tenantFeatures
  if (!Array.isArray(list) || list.length === 0) return null

  const enabledRows = list.filter((f) => f?.is_enabled !== false)
  if (enabledRows.length === 0) return new Set()

  return moduleKeysForTenantFeatureCodes(list)
}

const DEFAULT_MOCK_ALLOWED_MODULES = [
  'dashboard',
  'employee-directory',
  'employee-profiles',
  'attendance',
  'leave-absence',
  'documents-approval',
  'visa-nationality',
  'assets',
  'performance',
  'training-development',
  'policies',
  'expenses',
  'billing-invoicing',
  'onboarding',
  'exit-management',
  'letter-templates',
  'reports-analytics',
  'announcements',
  'payroll-management',
  'time-tracking',
  'shift-management',
  'overtime-management',
  'departments',
  'messages',
  'system-settings',
]

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

  const [allowedModules, setAllowedModules] = useState([])

  const planModuleKeys = useMemo(
    () => computePlanModuleKeysForTenantUser(user?.role, user?.tenant_features),
    [user?.role, user?.tenant_features],
  )

  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])

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

        const imModules = Array.isArray(userData?.allowedModules)
          ? userData.allowedModules
          : ['dashboard']
        setAllowedModules(imModules)
        localStorage.setItem('allowedModules', JSON.stringify(imModules))

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (err) {
        console.error('Global auto-login failed:', err)
      }
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('allowedModules')
    if (stored) {
      try {
        setAllowedModules(JSON.parse(stored))
      } catch {
        setAllowedModules(['dashboard'])
      }
    }
  }, [])

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    const userPermissions = PERMISSIONS[user.role] || []
    if (userPermissions.includes('*')) return true
    return userPermissions.includes(permission)
  }, [user])

  const hasFeatureAccess = useCallback((featureCode) => {
    if (!user) return false
    if (!featureCode) return true
    if (user.role !== 'admin') return true
    const features = user.tenant_features || []
    return features.some((f) => f.feature_code === featureCode && f.is_enabled !== false)
  }, [user])

  /** RBAC + subscription: employees use role modules ∩ plan; admins use role modules ∪ plan. */
  const hasModule = useCallback(
    (key) => {
      if (key === 'dashboard') return true

      const privilegedPanelAccess = ['admin', 'hr_admin', 'hr_executive', 'manager'].includes(
        user?.role,
      )
      if (key === 'system-settings' && privilegedPanelAccess) return true

      if (user?.role === 'employee') {
        if (!allowedModules.includes(key)) return false
        if (planModuleKeys === null) return true
        if (planModuleKeys instanceof Set) return planModuleKeys.has(key)
        return false
      }

      if (allowedModules.includes(key)) return true

      if (user?.role === 'admin') {
        if (planModuleKeys === null) return true
        if (planModuleKeys instanceof Set && planModuleKeys.has(key)) return true
      }

      return false
    },
    [allowedModules, planModuleKeys, user?.role],
  )

  const login = useCallback(
    (
      arg1,
      arg2,
      planDetails = [],
      planFeatures = [],
      tenantFeatures = [],
      allowedModulesFromResponse,
    ) => {
    // Case 1: Real API Auth (user object, token)
    if (typeof arg1 === 'object' && arg2) {
      const userData = { 
        ...arg1, 
        panel: arg1.role === 'superadmin' ? 'superadmin' : 'admin',
        plan_details: planDetails,
        plan_features: planFeatures,
        tenant_features: tenantFeatures
      }
      const nextMods = Array.isArray(allowedModulesFromResponse)
        ? allowedModulesFromResponse
        : ['dashboard']
      setAllowedModules(nextMods)
      localStorage.setItem('allowedModules', JSON.stringify(nextMods))

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
    const mockMods = [...DEFAULT_MOCK_ALLOWED_MODULES]
    setAllowedModules(mockMods)
    localStorage.setItem('allowedModules', JSON.stringify(mockMods))
    setUser(account.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user))
    return null
  }, [])

  // Stable function — never recreated, reads current user via ref
  const refreshAccessProfile = useCallback(async () => {
    const current = userRef.current
    if (!current || current.role !== 'admin') return
    try {
      const response = await api.get('/auth/access-profile')
      const data = response?.data?.data
      if (!data) return

      setUser((prev) => {
        if (!prev || prev.role !== 'admin') return prev
        const next = {
          ...prev,
          plan_details: data.plan_details || [],
          tenant_features: data.tenant_features || [],
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })

      const apiMods = data?.allowedModules ?? data?.allowed_modules
      if (Array.isArray(apiMods)) {
        setAllowedModules(apiMods)
        localStorage.setItem('allowedModules', JSON.stringify(apiMods))
      }
    } catch (error) {
      console.error('Failed to refresh access profile:', error)
    }
  }, [])

  const adminSessionKey =
    user?.role === 'admin' ? `${user.email ?? ''}:${user.id ?? ''}` : null

  // Run once on mount (when user is admin) and then every 3 minutes.
  // Depends only on user.id + user.role so it re-registers only on actual
  // user identity change (login / logout), not on every profile refresh.
  const userId   = user?.id
  const userRole = user?.role
  useEffect(() => {
    if (!adminSessionKey) return
    refreshAccessProfile()
    const id = window.setInterval(refreshAccessProfile, 180000)
    return () => window.clearInterval(id)
  }, [adminSessionKey, refreshAccessProfile])

  const logout = useCallback(() => {
    setUser(null)
    setAllowedModules([])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('allowedModules')
    navigate('/login', { replace: true })
  }, [navigate])

  const switchRole = useCallback((newRole) => {
    // Dev helper to switch role in-memory
    const matchingAccount = Object.values(accounts).find((a) => a.user.role === newRole)
    if (matchingAccount) {
      setUser(matchingAccount.user)
      const mockMods = [...DEFAULT_MOCK_ALLOWED_MODULES]
      setAllowedModules(mockMods)
      localStorage.setItem('allowedModules', JSON.stringify(mockMods))
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      hasPermission,
      hasFeatureAccess,
      switchRole,
      refreshAccessProfile,
      allowedModules,
      hasModule,
    }),
    [
      user,
      login,
      logout,
      hasPermission,
      hasFeatureAccess,
      switchRole,
      refreshAccessProfile,
      allowedModules,
      hasModule,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
