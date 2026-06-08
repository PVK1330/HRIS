import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Declarative data-fetching hook with AbortController cleanup.
 *
 * The factory receives an AbortSignal each run. Service functions that accept
 * an `options` / `{ signal }` argument will actually cancel the in-flight
 * request; others still benefit from the stale-setState guard.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} asyncFactory
 * @param {ReadonlyArray<unknown>} deps
 * @returns {{ data: T|null, loading: boolean, error: Error|null, refetch: () => void }}
 *
 * @example
 *   const { data, loading } = useFetch(
 *     (signal) => getSomething({ signal }),
 *     [filterId]
 *   )
 */
export default function useFetch(asyncFactory, deps) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  // Always call the latest version of the factory without adding it to deps
  // (avoids infinite loops when callers pass inline arrows).
  const factoryRef = useRef(asyncFactory)
  useEffect(() => {
    factoryRef.current = asyncFactory
  })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    factoryRef.current(controller.signal)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        if (err.name === 'CanceledError' || err.name === 'AbortError') return
        setError(err)
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(Array.isArray(deps) ? deps : []), tick])

  return {
    data,
    loading,
    error,
    refetch: useCallback(() => setTick((t) => t + 1), []),
  }
}
