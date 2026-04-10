import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employees, performanceKpis } from '../../data/mockData.js'

const reviews = employees.slice(0, 8).map((e, idx) => ({
  id: `pr-${e.id}`,
  employee: e.name,
  cycle: 'H1 2026',
  rating: idx % 3 === 0 ? 'Exceeds' : idx % 3 === 1 ? 'Meets' : 'Developing',
  manager: e.manager,
  due: '2026-04-30',
}))

export default function Performance() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return reviews
    return reviews.filter((r) => `${r.employee} ${r.manager}`.toLowerCase().includes(query))
  }, [q])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'cycle', label: 'Cycle' },
    {
      key: 'rating',
      label: 'Rating',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Exceeds' ? 'green' : v === 'Meets' ? 'blue' : 'orange'}
        />
      ),
    },
    { key: 'manager', label: 'Manager' },
    { key: 'due', label: 'Due' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Open review" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">Review cycles and manager assessments.</p>
        </div>
        <Button label="Start cycle" variant="secondary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active cycles"
          value={performanceKpis.activeCycles}
          subtitle="Company-wide"
          color="blue"
        />
        <StatCard
          title="Due this month"
          value={performanceKpis.dueThisMonth}
          subtitle="Needs submission"
          color="orange"
        />
        <StatCard
          title="Completed"
          value={performanceKpis.completedLast12Months}
          subtitle="Last 12 months"
          color="green"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Employee or manager…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
