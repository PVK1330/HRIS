import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getSensitiveData, updateSensitiveData } from '../../services/adminSettingsService'

export function useSensitiveData() {
  const [settings, setSettings] = useState(null)
  const originalRef = useRef(null)

  const [salaryVisibilityOptions, setSalaryVisibilityOptions] = useState([])
  const [visaVisibilityOptions, setVisaVisibilityOptions] = useState([])
  const [documentVisibilityOptions, setDocumentVisibilityOptions] = useState([])
  const [notesVisibilityOptions, setNotesVisibilityOptions] = useState([])
  const [roles, setRoles] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const applyBundle = useCallback((bundle) => {
    if (!bundle) return
    setSettings(bundle.settings ?? null)
    setSalaryVisibilityOptions(bundle.salaryVisibilityOptions ?? [])
    setVisaVisibilityOptions(bundle.visaVisibilityOptions ?? [])
    setDocumentVisibilityOptions(bundle.documentVisibilityOptions ?? [])
    setNotesVisibilityOptions(bundle.notesVisibilityOptions ?? [])
    setRoles(bundle.roles ?? [])
    originalRef.current = bundle.settings ? structuredClone(bundle.settings) : null
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSensitiveData()
      const bundle = res.data ?? res
      applyBundle(bundle)
    } catch (e) {
      setError(e.message || 'Failed to load sensitive data settings')
      setSettings(null)
      originalRef.current = null
    } finally {
      setLoading(false)
    }
  }, [applyBundle])

  useEffect(() => {
    load()
  }, [load])

  const isDirty = useMemo(() => {
    if (!settings || !originalRef.current) return false
    return JSON.stringify(settings) !== JSON.stringify(originalRef.current)
  }, [settings])

  const updateSalarySetting = useCallback((field, value) => {
    setSettings((s) =>
      s
        ? {
            ...s,
            salaryDataVisibility: {
              ...s.salaryDataVisibility,
              [field]: value,
            },
          }
        : s,
    )
  }, [])

  const updateDocVisibility = useCallback((field, value) => {
    setSettings((s) =>
      s
        ? {
            ...s,
            documentVisibility: {
              ...s.documentVisibility,
              [field]: value,
            },
          }
        : s,
    )
  }, [])

  const updateVisaVisibility = useCallback((roleKey, value) => {
    setSettings((s) => {
      if (!s) return s
      const prev = s.visaNationalityVisibility || {}
      return {
        ...s,
        visaNationalityVisibility: {
          ...prev,
          [roleKey]: value,
        },
      }
    })
  }, [])

  const updateNotes = useCallback((value) => {
    setSettings((s) => (s ? { ...s, notesVisibility: value } : s))
  }, [])

  const save = useCallback(async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    try {
      const res = await updateSensitiveData({
        salaryDataVisibility: settings.salaryDataVisibility,
        documentVisibility: settings.documentVisibility,
        notesVisibility: settings.notesVisibility,
      })
      toast.success(res.message || 'Sensitive data settings saved')
      const bundle = res.data ?? res
      applyBundle(bundle)
      return res
    } catch (e) {
      setError(e.message || 'Save failed')
      toast.error(e.message || 'Save failed')
      throw e
    } finally {
      setSaving(false)
    }
  }, [settings, applyBundle])

  const discard = useCallback(() => {
    if (originalRef.current) {
      setSettings(structuredClone(originalRef.current))
    }
    setError(null)
  }, [])

  return {
    settings,
    setSettings,
    salaryVisibilityOptions,
    visaVisibilityOptions,
    documentVisibilityOptions,
    notesVisibilityOptions,
    roles,
    loading,
    saving,
    isDirty,
    error,
    updateSalarySetting,
    updateDocVisibility,
    updateVisaVisibility,
    updateNotes,
    save,
    discard,
    reload: load,
  }
}
