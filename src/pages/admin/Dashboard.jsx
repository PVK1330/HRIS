import { useMemo, useState } from 'react'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  dashboardAlerts,
  dashboardStats,
  joinersAndExits,
} from '../../data/mockData.js'

const dotClass = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-600',
}

const alertTone = {
  red: 'border-red-100 bg-red-50 text-red-800',
  blue: 'border-blue-100 bg-blue-50 text-blue-800',
  green: 'border-green-100 bg-green-50 text-green-800',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [qEmp, setQEmp] = useState('')
  const [qDoc, setQDoc] = useState('')
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  const joinColumns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'department', label: 'Department' },
    {
      key: 'date',
      label: 'Date',
      render: (v) => <span className="text-gray-600">{v}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          {todayLabel}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={dashboardStats.totalEmployees}
          subtitle="Company-wide headcount"
          color="blue"
        />
        <StatCard
          title="Active Employees"
          value={dashboardStats.activeEmployees}
          subtitle="Currently active"
          color="green"
        />
        <StatCard
          title="On Probation"
          value={dashboardStats.onProbation}
          subtitle="In evaluation window"
          color="yellow"
        />
        <StatCard
          title="In Notice"
          value={dashboardStats.inNotice}
          subtitle="Departing employees"
          color="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Today&apos;s Work Status</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.blue}`} />
                In Office
              </span>
              <span className="font-semibold text-gray-900">{dashboardStats.todayInOffice}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.green}`} />
                Remote
              </span>
              <span className="font-semibold text-gray-900">{dashboardStats.todayRemote}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.yellow}`} />
                On Leave
              </span>
              <span className="font-semibold text-gray-900">{dashboardStats.todayOnLeave}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.red}`} />
                Absent
              </span>
              <span className="font-semibold text-gray-900">{dashboardStats.todayAbsent}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Pending Approvals</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Leave requests</span>
              <Badge label={String(dashboardStats.pendingLeaves)} color="orange" />
            </li>
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Documents</span>
              <Badge label={String(dashboardStats.pendingDocuments)} color="blue" />
            </li>
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Expenses</span>
              <Badge label={String(dashboardStats.pendingExpenses)} color="purple" />
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Alerts &amp; Reminders</h2>
          <ul className="mt-4 space-y-3">
            {dashboardAlerts.map((a) => (
              <li
                key={a.id}
                className={`rounded-lg border px-3 py-2 text-sm ${alertTone[a.tone] ?? alertTone.blue}`}
              >
                <div className="font-semibold">{a.type}</div>
                <div className="mt-0.5 text-xs opacity-90">{a.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-900">New Joiners &amp; Exits</h2>
          <Table columns={joinColumns} data={joinersAndExits} pageSize={5} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Quick Search</h2>
          <p className="mt-1 text-sm text-gray-500">Find employees or cases without leaving the page.</p>
          <div className="mt-4 space-y-3">
            <Input
              label="Search employees"
              name="q-emp"
              placeholder="Name, department, or ID"
              value={qEmp}
              onChange={(e) => setQEmp(e.target.value)}
            />
            <Input
              label="Search documents"
              name="q-doc"
              placeholder="Policy, contract, or letter"
              value={qDoc}
              onChange={(e) => setQDoc(e.target.value)}
            />
            <Button label="Search" variant="secondary" icon={HiMagnifyingGlass} className="w-full sm:w-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
