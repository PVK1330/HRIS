import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { cases } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Open') return 'blue'
  if (s === 'In Progress') return 'orange'
  if (s === 'Resolved') return 'green'
  if (s === 'Closed') return 'gray'
  return 'gray'
}

function priorityColor(p) {
  if (p === 'High') return 'red'
  if (p === 'Medium') return 'yellow'
  return 'gray'
}

export default function AllCases() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  const statusOptions = useMemo(() => {
    const u = [...new Set(cases.map((c) => c.status))].sort()
    return [{ value: '', label: 'All statuses' }, ...u.map((s) => ({ value: s, label: s }))]
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return cases.filter((c) => {
      if (status && c.status !== status) return false
      if (!query) return true
      return `${c.caseRef} ${c.clientName} ${c.caseworker} ${c.type}`.toLowerCase().includes(query)
    })
  }, [q, status])

  const columns = [
    { key: 'caseRef', label: 'Case' },
    { key: 'clientName', label: 'Client' },
    { key: 'caseworker', label: 'Caseworker' },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <Badge label={v} color={priorityColor(v)} />,
    },
    { key: 'createdAt', label: 'Created' },
    { key: 'dueDate', label: 'Due' },
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
          <h1 className="font-display text-2xl font-bold text-gray-900">All Cases</h1>
          <p className="mt-1 text-sm text-gray-500">Search, filter, and triage cases.</p>
        </div>
        <Button label="Create case" variant="primary" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Search"
            name="q"
            placeholder="Case ref, client, caseworker…"
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
