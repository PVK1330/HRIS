import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Generic settings page hook.
 *
 * Pattern: every settings page calls one fetcher to load data, optionally a
 * saver to persist edits, and shows a toast on each outcome.
 *
 * @param {() => Promise<any>} fetchFn  loader called once on mount
 * @param {(data:any) => Promise<any>} saveFn  saver invoked by `save()`
 * @returns {{ data:any, setData:Function, loading:boolean, error:string|null,
 *             save:Function, saving:boolean, refetch:Function }}
 */
export default function useSettings(fetchFn, saveFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (typeof fetchFn !== 'function') {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(res?.data ?? res)
    } catch (err) {
      const msg = err?.message || 'Failed to load settings'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    refetch()
  }, [refetch])

  const save = useCallback(
    async (overrideData) => {
      if (typeof saveFn !== 'function') return
      const payload = overrideData ?? data
      setSaving(true)
      setError(null)
      try {
        const res = await saveFn(payload)
        const next = res?.data ?? res ?? payload
        setData(next)
        toast.success('Settings saved successfully')
        return next
      } catch (err) {
        const msg = err?.message || 'Failed to save settings'
        setError(msg)
        toast.error(msg)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [data, saveFn]
  )

  return { data, setData, loading, error, save, saving, refetch }
}
