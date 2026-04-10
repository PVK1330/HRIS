import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { exitKpis, exitRecords } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Closed') return 'gray'
  if (s === 'Notice') return 'orange'
  if (s === 'Offboarding') return 'blue'
  return 'purple'
}

export default function ExitManagement() {
  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'lastDay', label: 'Last day' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Open checklist" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Exit Management</h1>
          <p className="mt-1 text-sm text-gray-500">Track notice periods and offboarding tasks.</p>
        </div>
        <Button label="Log exit" variant="secondary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="In notice" value={exitKpis.inNotice} subtitle="Employees" color="orange" />
        <StatCard title="Exits this quarter" value={exitKpis.exitsThisQuarter} subtitle="Completed" color="blue" />
        <StatCard title="Exit interviews" value={exitKpis.exitInterviews} subtitle="Scheduled" color="purple" />
      </div>

      <Table columns={columns} data={exitRecords} pageSize={5} />
    </div>
  )
}
