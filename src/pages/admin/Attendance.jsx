import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { dashboardStats, employees } from '../../data/mockData.js'

export default function Attendance() {
  const [dept, setDept] = useState('')

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const rows = useMemo(() => {
    return employees.slice(0, 8).map((e, idx) => ({
      id: e.id,
      employee: e.name,
      department: e.department,
      status: idx % 2 === 0 ? 'Present' : idx % 3 === 0 ? 'Remote' : 'Late',
      checkIn: idx % 2 === 0 ? '08:55' : '09:18',
    }))
  }, [])

  const filtered = useMemo(() => {
    if (!dept) return rows
    return rows.filter((r) => r.department === dept)
  }, [rows, dept])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'department', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Present' ? 'green' : v === 'Remote' ? 'blue' : 'orange'}
        />
      ),
    },
    { key: 'checkIn', label: 'Check-in' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Daily attendance snapshot (mock data).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="In Office" value={dashboardStats.todayInOffice} subtitle="Today" color="blue" />
        <StatCard title="Remote" value={dashboardStats.todayRemote} subtitle="Today" color="green" />
        <StatCard title="On Leave" value={dashboardStats.todayOnLeave} subtitle="Today" color="yellow" />
        <StatCard title="Absent" value={dashboardStats.todayAbsent} subtitle="Today" color="red" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Department"
          name="dept"
          type="select"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          options={deptOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
