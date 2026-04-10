import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employees, visaSummary } from '../../data/mockData.js'

const rows = employees.map((e, idx) => ({
  id: `visa-${e.id}`,
  employee: e.name,
  nationality: e.nationality,
  visaType: idx % 2 === 0 ? 'Employment' : 'Dependent',
  expiry: '2025-12-20',
  daysLeft: 45 + idx,
}))

export default function VisaNationality() {
  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'visaType', label: 'Visa type' },
    { key: 'expiry', label: 'Expiry' },
    {
      key: 'daysLeft',
      label: 'Days left',
      render: (v) => {
        const n = Number(v)
        const color = n < 60 ? 'red' : 'green'
        return <Badge label={`${n} days`} color={color} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Renew" variant="outline" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Visa &amp; Nationality</h1>
          <p className="mt-1 text-sm text-gray-500">Track renewals and compliance risk.</p>
        </div>
        <Button label="Export report" variant="secondary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Tracked employees" value={rows.length} subtitle="Mock records" color="blue" />
        <StatCard
          title="Renewals under 90 days"
          value={visaSummary.renewalsUnder90Days}
          subtitle="Needs planning"
          color="orange"
        />
        <StatCard
          title="Completed"
          value={visaSummary.completedLast12Months}
          subtitle="Last 12 months"
          color="green"
        />
      </div>

      <Table columns={columns} data={rows} pageSize={5} />
    </div>
  )
}
