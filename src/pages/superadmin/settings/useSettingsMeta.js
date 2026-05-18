import { useEffect, useMemo, useState } from 'react'
import settingsService from '../../../services/settingsService.js'

export default function useSettingsMeta() {
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await settingsService.getSettingsMeta()
        if (!cancelled) setMeta(res?.data || null)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load settings metadata')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(
    () => ({ meta, loading, error }),
    [meta, loading, error]
  )
}
