import { useCallback, useEffect, useState } from 'react'
import {
  fetchAttendanceSettings,
  updateAttendanceSettings as putAttendanceSettings,
} from '../services/attendanceSettingsService'

export function useAttendanceSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAttendanceSettings()
      setSettings(res.data ?? null)
    } catch (e) {
      setError(e.message || 'Failed to load attendance settings')
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(async (payload) => {
    setSaving(true)
    setError(null)
    try {
      const res = await putAttendanceSettings(payload)
      setSettings(res.data ?? null)
      setError(null)
      return res
    } catch (e) {
      setError(e.message || 'Failed to save attendance settings')
      throw e
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    settings,
    loading,
    saving,
    error,
    reload: load,
    save,
  }
}
