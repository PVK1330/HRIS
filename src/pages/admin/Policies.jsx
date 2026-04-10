import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { policyDocuments, policyKpis } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Published') return 'green'
  if (s === 'Draft') return 'orange'
  if (s === 'Review') return 'blue'
  return 'gray'
}

export default function Policies() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return policyDocuments
    return policyDocuments.filter((p) => `${p.name} ${p.owner}`.toLowerCase().includes(query))
  }, [q])

  const columns = [
    { key: 'name', label: 'Policy' },
    { key: 'owner', label: 'Owner' },
    { key: 'updatedAt', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Open" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Policies</h1>
          <p className="mt-1 text-sm text-gray-500">Publish updates and track acknowledgements.</p>
        </div>
        <Button label="New policy" variant="primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Published" value={policyKpis.published} subtitle="Live documents" color="green" />
        <StatCard title="Pending acknowledgement" value={policyKpis.pendingAck} subtitle="Employees" color="orange" />
        <StatCard title="Overdue" value={policyKpis.overdue} subtitle="Needs follow-up" color="red" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Policy name or owner…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
