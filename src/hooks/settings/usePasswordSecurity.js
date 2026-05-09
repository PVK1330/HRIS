import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getPasswordSecurity,
  updatePasswordSecurity,
} from '../../services/adminSettingsService'

function snapshotForm(data) {
  if (!data) return null
  return {
    passwordPolicy: {
      minimumLength: data.passwordPolicy?.minimumLength ?? 8,
      mustIncludeSpecialChars: Boolean(data.passwordPolicy?.mustIncludeSpecialChars),
      passwordExpiryDays: data.passwordPolicy?.passwordExpiryDays ?? 90,
      twoFactorAuth: Boolean(data.passwordPolicy?.twoFactorAuth),
    },
    accountSecurity: {
      autoLogoutMinutes: data.accountSecurity?.autoLogoutMinutes ?? 30,
      maxLoginAttemptLimit: data.accountSecurity?.maxLoginAttemptLimit ?? 5,
      blockedAccountRecovery: data.accountSecurity?.blockedAccountRecovery ?? 'Email recovery',
    },
  }
}

export function usePasswordSecurity() {
  const [settings, setSettings] = useState(null)
  const originalRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPasswordSecurity()
      const inner = res.data ?? null
      setSettings(snapshotForm(inner))
      originalRef.current = snapshotForm(inner)
    } catch (e) {
      setError(e.message || 'Failed to load password security settings')
      setSettings(null)
      originalRef.current = null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isDirty = useMemo(() => {
    if (!settings || !originalRef.current) return false
    return JSON.stringify(settings) !== JSON.stringify(originalRef.current)
  }, [settings])

  const save = useCallback(async (payload) => {
    const body = payload ?? settings
    if (!body) return
    setSaving(true)
    setError(null)
    try {
      const res = await updatePasswordSecurity({
        passwordPolicy: body.passwordPolicy,
        accountSecurity: body.accountSecurity,
      })
      const inner = res.data ?? null
      const next = snapshotForm(inner)
      setSettings(next)
      originalRef.current = snapshotForm(inner)
      toast.success(res.message || 'Password security saved')
      return res
    } catch (e) {
      setError(e.message || 'Failed to save password security settings')
      toast.error(e.message || 'Save failed')
      throw e
    } finally {
      setSaving(false)
    }
  }, [settings])

  const discard = useCallback(() => {
    if (originalRef.current) {
      setSettings(structuredClone(originalRef.current))
    }
    setError(null)
  }, [])

  return {
    settings,
    setSettings,
    loading,
    isDirty,
    saving,
    save,
    discard,
    error,
    reload: load,
  }
}
