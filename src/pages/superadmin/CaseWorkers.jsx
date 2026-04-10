import { useMemo, useState } from 'react'
import { HiPencilSquare, HiTrash } from 'react-icons/hi2'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { caseworkers } from '../../data/mockData.js'

function statusBadge(status) {
  if (status === 'Active') return 'green'
  if (status === 'High Load') return 'orange'
  if (status === 'On Leave') return 'yellow'
  return 'gray'
}

export default function CaseWorkers() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [dept, setDept] = useState('')

  const stats = useMemo(() => {
    const total = caseworkers.length
    const active = caseworkers.filter((c) => c.status === 'Active').length
    const high = caseworkers.filter((c) => c.status === 'High Load').length
    const leave = caseworkers.filter((c) => c.status === 'On Leave').length
    return { total, active, high, leave }
  }, [])

  const deptOptions = useMemo(() => {
    const u = [...new Set(caseworkers.map((c) => c.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'High Load', label: 'High Load' },
    { value: 'On Leave', label: 'On Leave' },
  ]

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return caseworkers.filter((c) => {
      if (status && c.status !== status) return false
      if (dept && c.department !== dept) return false
      if (!query) return true
      const blob = `${c.name} ${c.email} ${c.role}`.toLowerCase()
      return blob.includes(query)
    })
  }, [q, status, dept])

  const columns = [
    {
      key: 'name',
      label: 'Caseworker',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.role}</div>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'activeCases',
      label: 'Active Cases',
      render: (v) => <Badge label={String(v)} color="blue" />,
    },
    {
      key: 'overdue',
      label: 'Overdue',
      render: (v) => <Badge label={String(v)} color={v > 0 ? 'red' : 'green'} />,
    },
    { key: 'completed', label: 'Completed' },
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
      render: (v) => <Badge label={v} color={statusBadge(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex items-center gap-1">
          <Button ariaLabel="Edit" variant="ghost" size="sm" icon={HiPencilSquare} />
          <Button ariaLabel="Delete" variant="ghost" size="sm" icon={HiTrash} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Case Workers</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor workload, performance, and availability.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button label="Performance Report" variant="outline" />
          <Button label="+ Add Caseworker" variant="primary" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Caseworkers" value={stats.total} subtitle="Across teams" color="blue" />
        <StatCard title="Active" value={stats.active} subtitle="Available today" color="green" />
        <StatCard title="High Load" value={stats.high} subtitle="Needs attention" color="orange" />
        <StatCard title="On Leave" value={stats.leave} subtitle="Out of office" color="yellow" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Search"
            name="q"
            placeholder="Name, email, role…"
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
          <Input
            label="Department"
            name="dept"
            type="select"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            options={deptOptions}
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
