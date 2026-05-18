import { useCallback, useEffect, useState } from 'react'
import {
  createAssetCategory,
  deleteAssetCategory,
  fetchAssetCategories,
  fetchAssetRules,
  updateAssetCategory,
  updateAssetRules,
} from '../services/assetSettingsService'

export function useAssetSettings() {
  const [categories, setCategories] = useState([])
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [rulesSaving, setRulesSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadCategories = useCallback(async () => {
    const res = await fetchAssetCategories()
    setCategories(Array.isArray(res.data) ? res.data : [])
  }, [])

  const loadRules = useCallback(async () => {
    const res = await fetchAssetRules()
    setRules(res.data ?? null)
  }, [])

  const reloadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadCategories(), loadRules()])
    } catch (e) {
      setError(e.message || 'Failed to load asset settings')
    } finally {
      setLoading(false)
    }
  }, [loadCategories, loadRules])

  useEffect(() => {
    reloadAll()
  }, [reloadAll])

  const createCategory = useCallback(
    async (payload) => {
      setCategoryBusy(true)
      setError(null)
      try {
        await createAssetCategory(payload)
        await loadCategories()
      } catch (e) {
        setError(e.message || 'Failed to create category')
        throw e
      } finally {
        setCategoryBusy(false)
      }
    },
    [loadCategories],
  )

  const patchCategory = useCallback(
    async (id, payload) => {
      setCategoryBusy(true)
      setError(null)
      try {
        await updateAssetCategory(id, payload)
        await loadCategories()
      } catch (e) {
        setError(e.message || 'Failed to update category')
        throw e
      } finally {
        setCategoryBusy(false)
      }
    },
    [loadCategories],
  )

  const removeCategory = useCallback(
    async (id) => {
      setCategoryBusy(true)
      setError(null)
      try {
        await deleteAssetCategory(id)
        await loadCategories()
      } catch (e) {
        setError(e.message || 'Failed to delete category')
        throw e
      } finally {
        setCategoryBusy(false)
      }
    },
    [loadCategories],
  )

  const saveRules = useCallback(async (payload) => {
    setRulesSaving(true)
    setError(null)
    try {
      const res = await updateAssetRules(payload)
      setRules(res.data ?? null)
      setError(null)
      return res
    } catch (e) {
      setError(e.message || 'Failed to save asset rules')
      throw e
    } finally {
      setRulesSaving(false)
    }
  }, [])

  return {
    categories,
    rules,
    loading,
    categoryBusy,
    rulesSaving,
    error,
    reloadAll,
    loadCategories,
    createCategory,
    patchCategory,
    removeCategory,
    saveRules,
  }
}
