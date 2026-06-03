import { useEffect, useState } from 'react'
import { HiEnvelope } from 'react-icons/hi2'
import { Table } from '../../../../components/ui/Table.jsx'
import settingsService from '../../../../services/settingsService.js'

const COLUMNS = [
  { key: 'sentAt', label: 'Sent At' },
  { key: 'to', label: 'Recipient' },
  { key: 'subject', label: 'Subject' },
  { key: 'status', label: 'Status' },
]

export default function EmailLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await settingsService.getEmailLogs()
        if (!cancelled) setLogs(Array.isArray(res?.data) ? res.data : [])
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load email logs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Transmission Logs</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Audit trail of automated platform communications.
            </p>
            <div className="mt-4 rounded-md bg-blue-50 p-4 border border-blue-200">
              <p className="text-xs text-blue-700">
                Logs are automatically purged every 90 days for performance and privacy compliance.
              </p>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <h3 className="text-sm font-medium leading-6 text-gray-900 mb-4">Transmission History</h3>
              
              <div className="overflow-hidden rounded-md border border-gray-200">
                {loading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-9 animate-pulse rounded bg-gray-100" />
                    ))}
                  </div>
                ) : (
                  <Table
                    columns={COLUMNS}
                    data={logs}
                    emptyMessage={
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <HiEnvelope className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h4 className="text-sm font-medium text-gray-900">No transmissions found</h4>
                        <p className="mt-1 text-sm text-gray-500">Communications will be logged here once active.</p>
                      </div>
                    }
                  />
                )}
              </div>
              {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
