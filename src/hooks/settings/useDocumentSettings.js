import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createDocumentType,
  deleteDocumentType,
  getDocumentTypes,
  updateDocumentType,
} from '../../services/adminSettingsService'

function normalizeDocList(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  return []
}

export function useDocumentSettings() {
  const [list, setList] = useState([])
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDocumentTypes()
      setList(normalizeDocList(res))
    } catch (e) {
      setError(e.message || 'Failed to load document types')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectedDoc = useMemo(
    () => list.find((d) => d.id === selectedDocId) ?? null,
    [list, selectedDocId],
  )

  useEffect(() => {
    if (selectedDocId && !list.some((d) => d.id === selectedDocId)) {
      setSelectedDocId(null)
    }
  }, [list, selectedDocId])

  const selectDoc = useCallback((id) => {
    setSelectedDocId(id)
  }, [])

  const addDoc = useCallback(
    async (name) => {
      setSaving(true)
      setError(null)
      try {
        const res = await createDocumentType({ name })
        toast.success('Document type created')
        await load()
        const created = res?.data
        if (created?.id) {
          setSelectedDocId(created.id)
        }
        return created
      } catch (e) {
        toast.error(e.message || 'Could not create document type')
        setError(e.message || 'Could not create document type')
        throw e
      } finally {
        setSaving(false)
      }
    },
    [load],
  )

  const updateDoc = useCallback(
    async (id, patch) => {
      setSaving(true)
      setError(null)
      try {
        await updateDocumentType(id, patch)
        toast.success('Document type saved')
        await load()
      } catch (e) {
        toast.error(e.message || 'Could not save document type')
        setError(e.message || 'Could not save document type')
        throw e
      } finally {
        setSaving(false)
      }
    },
    [load],
  )

  const removeDoc = useCallback(
    async (id) => {
      setSaving(true)
      setError(null)
      try {
        await deleteDocumentType(id)
        toast.success('Document type deleted')
        if (selectedDocId === id) {
          setSelectedDocId(null)
        }
        await load()
      } catch (e) {
        toast.error(e.message || 'Could not delete document type')
        setError(e.message || 'Could not delete document type')
        throw e
      } finally {
        setSaving(false)
      }
    },
    [load, selectedDocId],
  )

  return {
    list,
    loading,
    saving,
    error,
    selectedDocId,
    selectedDoc,
    selectDoc,
    addDoc,
    updateDoc,
    removeDoc,
    reload: load,
  }
}
