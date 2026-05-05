import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import SettingsCard from '../../../components/settings/SettingsCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import settingsService from '../../../services/settingsService.js'

const COLUMNS = [
  { key: 'property', label: 'Property' },
  {
    key: 'value',
    label: 'Value',
    render: (val) => (
      typeof val === 'string' || typeof val === 'number' ? <span>{val}</span> : val
    ),
  },
]

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '—'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function formatUptime(seconds) {
  if (typeof seconds !== 'number') return '—'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}h ${m}m ${s}s`
}

function envBadge(env) {
  const env_ = String(env || '').toLowerCase()
  if (env_ === 'production') return <Badge label="production" color="green" />
  if (env_ === 'development') return <Badge label="development" color="yellow" />
  return <Badge label={env || 'unknown'} color="gray" />
}

function buildRows(info) {
  if (!info) return []
  const usedMb = info.memoryUsage?.heapUsed ?? 0
  const totalMb = info.memoryUsage?.heapTotal ?? 0
  return [
    { id: 1, property: 'App Version',     value: info.appVersion || '—' },
    { id: 2, property: 'Node Version',    value: info.nodeVersion || '—' },
    { id: 3, property: 'Platform',        value: info.platform || '—' },
    {
      id: 4,
      property: 'Memory Usage',
      value: `${formatBytes(usedMb)} used / ${formatBytes(totalMb)} total`,
    },
    { id: 5, property: 'Server Uptime',   value: formatUptime(info.uptime) },
    { id: 6, property: 'Main Database',   value: info.mainDatabase || '—' },
    { id: 7, property: 'Environment',     value: envBadge(info.environment) },
  ]
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
          <div className="h-5 animate-pulse rounded bg-gray-200" />
          <div className="h-5 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export default function SystemInfo() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await settingsService.getSystem()
        if (!cancelled) setInfo(res?.data || null)
      } catch (err) {
        if (!cancelled) toast.error(err?.message || 'Failed to load system info')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SettingsCard
      title="System Info"
      description="Read-only environment and runtime metadata for this server."
    >
      {loading ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={COLUMNS}
          data={buildRows(info)}
          pageSize={10}
          emptyMessage="No system info available"
        />
      )}
    </SettingsCard>
  )
}
