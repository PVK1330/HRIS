import { useMemo } from 'react'
import { HiUsers } from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { caseworkers, cases, clients } from '../../data/mockData.js'

function caseStatusColor(s) {
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

export default function Dashboard() {
  const stats = useMemo(() => {
    const totalCw = caseworkers.length
    const activeCases = cases.filter((c) => c.status !== 'Closed').length
    const highLoad = caseworkers.filter((c) => c.status === 'High Load').length
    const totalClients = clients.length
    return { totalCw, activeCases, highLoad, totalClients }
  }, [])

  const recentCaseColumns = [
    { key: 'caseRef', label: 'Case' },
    { key: 'clientName', label: 'Client' },
    { key: 'caseworker', label: 'Caseworker' },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={caseStatusColor(v)} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <Badge label={v} color={priorityColor(v)} />,
    },
    { key: 'dueDate', label: 'Due' },
  ]

  const perfColumns = [
    {
      key: 'name',
      label: 'Caseworker',
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (v, row) => {
        const filled = Math.min(10, Math.max(0, Math.round(Number(v) / 10)))
        return (
          <div className="flex items-center gap-2">
            <div className="flex w-28 gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`${row.id}-${i}`}
                  className={`h-2 flex-1 rounded-sm ${i < filled ? 'bg-[#004CA5]' : 'bg-gray-100'}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700">{v}%</span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'High Load' ? 'orange' : v === 'On Leave' ? 'yellow' : 'green'}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Operational snapshot across caseworkers, clients, and open cases.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Caseworkers"
          value={stats.totalCw}
          subtitle="Across departments"
          color="blue"
          icon={HiUsers}
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCases}
          subtitle="Excluding closed"
          color="orange"
        />
        <StatCard
          title="High Load"
          value={stats.highLoad}
          subtitle="Caseworkers over capacity"
          color="red"
        />
        <StatCard
          title="Clients"
          value={stats.totalClients}
          subtitle="Registered profiles"
          color="green"
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Recent Cases</h2>
        <Table columns={recentCaseColumns} data={cases} pageSize={5} />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Caseworker Performance</h2>
        <Table columns={perfColumns} data={caseworkers} pageSize={5} />
      </div>
    </div>
  )
}
