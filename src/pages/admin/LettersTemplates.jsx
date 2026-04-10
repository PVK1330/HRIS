import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { letterTemplates, lettersKpis } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Active') return 'green'
  if (s === 'Draft') return 'orange'
  return 'gray'
}

export default function LettersTemplates() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return letterTemplates
    return letterTemplates.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(query))
  }, [q])

  const columns = [
    { key: 'name', label: 'Template' },
    { key: 'category', label: 'Category' },
    { key: 'updatedAt', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Generate" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Letters &amp; Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Standard HR letters and merge-ready templates.</p>
        </div>
        <Button label="New template" variant="primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Templates" value={lettersKpis.templates} subtitle="Library" color="blue" />
        <StatCard title="Generated this month" value={lettersKpis.generatedThisMonth} subtitle="Letters" color="green" />
        <StatCard title="Pending signatures" value={lettersKpis.pendingSignatures} subtitle="Awaiting" color="orange" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Template name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
