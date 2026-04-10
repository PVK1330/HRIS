import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { onboardingKpis, onboardingTasks } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Done') return 'green'
  if (s === 'In Progress') return 'blue'
  if (s === 'Pending') return 'orange'
  return 'gray'
}

export default function Onboarding() {
  const [owner, setOwner] = useState('')

  const ownerOptions = useMemo(() => {
    const u = [...new Set(onboardingTasks.map((t) => t.owner))].sort()
    return [{ value: '', label: 'All owners' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const filtered = useMemo(() => {
    if (!owner) return onboardingTasks
    return onboardingTasks.filter((t) => t.owner === owner)
  }, [owner])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'task', label: 'Task' },
    { key: 'due', label: 'Due' },
    { key: 'owner', label: 'Owner' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Update" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Onboarding</h1>
          <p className="mt-1 text-sm text-gray-500">Coordinate tasks across HR, IT, and managers.</p>
        </div>
        <Button label="Create checklist" variant="primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="In progress" value={onboardingKpis.inProgress} subtitle="Active tasks" color="blue" />
        <StatCard title="Starts this month" value={onboardingKpis.startThisMonth} subtitle="New hires" color="green" />
        <StatCard title="Completed" value={onboardingKpis.completed} subtitle="Last 12 months" color="purple" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Owner"
          name="owner"
          type="select"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          options={ownerOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
