import { useCallback, useEffect, useState } from 'react'
import {
  fetchTenantAdminSettings,
  updateTenantAdminSettings,
  uploadTenantLogo as uploadLogoRequest,
} from '../services/tenantAdminSettingsService'

export function useTenantAdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchTenantAdminSettings()
      setSettings(res.data ?? null)
    } catch (e) {
      setError(e.message || 'Failed to load settings')
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
      const res = await updateTenantAdminSettings(payload)
      setSettings(res.data ?? null)
      setError(null)
      return res
    } catch (e) {
      setError(e.message || 'Failed to save settings')
      throw e
    } finally {
      setSaving(false)
    }
  }, [])

  const uploadLogo = useCallback(async (file) => {
    setUploadingLogo(true)
    setError(null)
    try {
      const res = await uploadLogoRequest(file)
      const logoUrl = res.data?.logoUrl
      if (logoUrl) {
        setSettings((prev) => (prev ? { ...prev, logoUrl } : prev))
      }
      setError(null)
      return res
    } catch (e) {
      setError(e.message || 'Logo upload failed')
      throw e
    } finally {
      setUploadingLogo(false)
    }
  }, [])

  return {
    settings,
    loading,
    saving,
    uploadingLogo,
    error,
    reload: load,
    save,
    uploadLogo,
    setLocalSettings: setSettings,
  }
}
