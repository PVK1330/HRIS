import { useState, useEffect, useCallback } from 'react'
import { adminSettingsService } from '../services/adminSettingsService'
import { useAuth } from '../context/AuthContext'

const TENANT_PANEL_ROLES = new Set([
  'admin',
  'hr_admin',
  'hr_executive',
  'manager',
  'employee',
])

function readAuthTokenFromStorage() {
  if (typeof window === 'undefined') return null
  const TOKEN_KEYS = ['hris_token', 'elitepic_auth_token', 'token', 'jwt']
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k)
    if (v) return v
  }
  return null
}

export default function useTenantLogo() {
  const { user } = useAuth()
  const [logoUrl, setLogoUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchLogo() {
      if (!user) {
        setLogoUrl(null)
        setLoading(false)
        return
      }

      const token = readAuthTokenFromStorage()
      if (!token) {
        setLogoUrl(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        if (user.role === 'superadmin') {
          const res = await adminSettingsService.getSuperadminLogo()
          const url = res?.data?.data?.largeLogo
          if (!cancelled) setLogoUrl(url && String(url).trim() ? url : null)
        } else if (TENANT_PANEL_ROLES.has(user.role)) {
          const res = await adminSettingsService.getTenantLogo()
          const url = res?.data?.data?.logoUrl ?? res?.data?.logoUrl
          if (!cancelled) setLogoUrl(url && String(url).trim() ? url : null)
        } else {
          if (!cancelled) setLogoUrl(null)
        }
      } catch {
        if (!cancelled) setLogoUrl(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLogo()

    /* Superadmin uploads broadcast so the sidebar can refresh without reload */
    function onPlatformLogoUpdated() {
      if (user?.role === 'superadmin') fetchLogo()
    }
    window.addEventListener('platform-logo-updated', onPlatformLogoUpdated)

    return () => {
      cancelled = true
      window.removeEventListener('platform-logo-updated', onPlatformLogoUpdated)
    }
  }, [user])

  const refreshTenantLogo = useCallback(async () => {
    const token = readAuthTokenFromStorage()
    if (!user || !token || !TENANT_PANEL_ROLES.has(user.role)) return
    try {
      const res = await adminSettingsService.getTenantLogo()
      const url = res?.data?.data?.logoUrl ?? res?.data?.logoUrl
      setLogoUrl(url && String(url).trim() ? url : null)
    } catch {
      setLogoUrl(null)
    }
  }, [user])

  useEffect(() => {
    function onTenantLogoUpdated() {
      refreshTenantLogo()
    }
    window.addEventListener('tenant-logo-updated', onTenantLogoUpdated)
    return () => window.removeEventListener('tenant-logo-updated', onTenantLogoUpdated)
  }, [refreshTenantLogo])

  return { logoUrl, loading, setLogoUrl }
}
