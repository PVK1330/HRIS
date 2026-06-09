import { useCallback, useEffect, useState } from 'react'
import settingsService from '../../../services/settingsService.js'

export default function SystemInfo() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getSystemInfo()
      setInfo(res?.data || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 rounded-xl bg-gray-100"></div>
          <div className="h-64 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  const { version, environment, memory, uptime, database } = info || {}

  const formatMemory = (bytes) => {
    if (!bytes) return 'N/A'
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A'
    const days = Math.floor(seconds / (3600 * 24))
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hrs}h ${mins}m`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Application Telemetry</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Core process information and runtime environment details.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{version || 'Unknown'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Environment</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      environment === 'production' 
                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {environment || 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Uptime</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatUptime(uptime)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Resource Utilization</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Memory consumption and connection pool metrics.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Memory Used (RSS)</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatMemory(memory?.rss)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Heap Total</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatMemory(memory?.heapTotal)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Heap Used</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatMemory(memory?.heapUsed)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">External</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatMemory(memory?.external)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 border-t border-gray-900/5 pt-6">Database Dialect</dt>
                  <dd className="mt-1 text-sm text-gray-900">{database?.dialect || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
