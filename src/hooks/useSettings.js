import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Generic settings page hook.
 *
 * Pattern: every settings page calls one fetcher to load data, optionally a
 * saver to persist edits, and shows a toast on each outcome.
 *
 * fetchFn may optionally accept an AbortSignal as its first argument — when
 * it does, in-flight requests are cancelled on unmount and on manual refetch.
 *
 * @param {(signal?: AbortSignal) => Promise<any>} fetchFn  loader called on mount / refetch
 * @param {(data:any) => Promise<any>} saveFn  saver invoked by `save()`
 * @returns {{ data:any, setData:Function, loading:boolean, error:string|null,
 *             save:Function, saving:boolean, refetch:Function }}
 */
export default function useSettings(fetchFn, saveFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (typeof fetchFn !== 'function') {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchFn(controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        setData(res?.data ?? res)
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'CanceledError' || err.name === 'AbortError') return
        const msg = err?.message || 'Failed to load settings'
        setError(msg)
        toast.error(msg)
        setLoading(false)
      })

    return () => controller.abort()
  }, [fetchFn, tick])

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

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { data, setData, loading, error, save, saving, refetch }
}
