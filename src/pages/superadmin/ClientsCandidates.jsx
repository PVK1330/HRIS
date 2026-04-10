import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { clients } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Active') return 'green'
  if (s === 'Pending') return 'orange'
  if (s === 'On Hold') return 'yellow'
  if (s === 'Closed') return 'gray'
  return 'blue'
}

export default function ClientsCandidates() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  const statusOptions = useMemo(() => {
    const u = [...new Set(clients.map((c) => c.status))].sort()
    return [{ value: '', label: 'All statuses' }, ...u.map((s) => ({ value: s, label: s }))]
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return clients.filter((c) => {
      if (status && c.status !== status) return false
      if (!query) return true
      return `${c.name} ${c.email} ${c.caseType}`.toLowerCase().includes(query)
    })
  }, [q, status])

  const columns = [
    { key: 'name', label: 'Client' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'nationality', label: 'Nationality' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    { key: 'assignedTo', label: 'Assigned to' },
    { key: 'caseType', label: 'Case type' },
    { key: 'createdAt', label: 'Created' },
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
          <h1 className="font-display text-2xl font-bold text-gray-900">Clients / Candidates</h1>
          <p className="mt-1 text-sm text-gray-500">Search, filter, and open client profiles.</p>
        </div>
        <Button label="Add client" variant="primary" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Search"
            name="q"
            placeholder="Name, email, case type…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Input
            label="Status"
            name="status"
            type="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
