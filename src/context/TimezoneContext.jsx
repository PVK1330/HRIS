import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext.jsx'
import { toIANA, formatDate, formatTime, formatDateTime, formatTimeOnly } from '../utils/timezone'

const TimezoneContext = createContext(null)

const TENANT_ROLES = new Set(['admin', 'hr_admin', 'hr_executive', 'manager', 'employee'])

export function TimezoneProvider({ children }) {
  const { user } = useAuth()
  const [orgTimezone, setOrgTimezone] = useState('UTC')

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/settings/timezone')
      const tz = data?.data?.timezone || data?.timezone || 'UTC'
      setOrgTimezone(tz)
    } catch {
      setOrgTimezone('UTC')
    }
  }, [])

  useEffect(() => {
    if (!user || !TENANT_ROLES.has(user.role)) {
      setOrgTimezone('UTC')
      return
    }
    reload()
  }, [user?.id, user?.role, reload])

  const iana = useMemo(() => toIANA(orgTimezone), [orgTimezone])

  const value = useMemo(() => ({
    orgTimezone,
    iana,
    reload,
    formatDate: (d) => formatDate(d, iana),
    formatTime: (d) => formatTime(d, iana),
    formatDateTime: (d) => formatDateTime(d, iana),
    formatTimeOnly: (d) => formatTimeOnly(d, iana),
  }), [orgTimezone, iana, reload])

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
}

export function useTimezone() {
  const ctx = useContext(TimezoneContext)
  if (!ctx) throw new Error('useTimezone must be used within a TimezoneProvider')
  return ctx
}
