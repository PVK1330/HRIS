import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { escalationKpis, escalations } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Open') return 'red'
  if (s === 'In review') return 'orange'
  if (s === 'Waiting') return 'yellow'
  return 'gray'
}

export default function Escalations() {
  const [status, setStatus] = useState('')

  const statusOptions = useMemo(() => {
    const u = [...new Set(escalations.map((e) => e.status))].sort()
    return [{ value: '', label: 'All statuses' }, ...u.map((s) => ({ value: s, label: s }))]
  }, [])

  const filtered = useMemo(() => {
    if (!status) return escalations
    return escalations.filter((e) => e.status === status)
  }, [status])

  const openCount = useMemo(() => escalations.filter((e) => e.status === 'Open').length, [])

  const columns = [
    { key: 'caseRef', label: 'Case' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'ageHours',
      label: 'Age (hours)',
      render: (v) => <span className="font-semibold text-gray-900">{v}h</span>,
    },
    { key: 'owner', label: 'Owner' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Resolve" variant="secondary" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Escalations</h1>
        <p className="mt-1 text-sm text-gray-500">Track urgent issues and ownership.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Open escalations" value={openCount} subtitle="Needs attention" color="red" />
        <StatCard title="Total tracked" value={escalations.length} subtitle="In mock list" color="orange" />
        <StatCard
          title="Avg age"
          value={`${escalationKpis.averageAgeHours}h`}
          subtitle="Approximate"
          color="yellow"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Status"
          name="status"
          type="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
