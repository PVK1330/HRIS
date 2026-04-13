import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { onboardingKpis, onboardingTasks } from '../../../data/mockData.js'

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
          <h1 className="font-display text-2xl font-bold text-gray-900">Onboarding Management</h1>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Onboarding Checklist</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-700">Account creation & system access</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-700">IT equipment setup</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">HR documents collection</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">Policy acknowledgement</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">Manager introduction & team meet</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">Training session completion</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Document & Policy Integration</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Employment Contract</div>
                <div className="text-xs text-gray-500">Required for all new hires</div>
              </div>
              <Badge label="Signed" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Code of Conduct</div>
                <div className="text-xs text-gray-500">Mandatory policy</div>
              </div>
              <Badge label="Pending" color="orange" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">IT Security Policy</div>
                <div className="text-xs text-gray-500">System access requirements</div>
              </div>
              <Badge label="Pending" color="orange" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Data Privacy Agreement</div>
                <div className="text-xs text-gray-500">GDPR compliance</div>
              </div>
              <Badge label="Not Started" color="gray" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Progress Monitoring</h2>
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">John Smith - IT Developer</span>
              <span className="font-semibold text-gray-900">80% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[80%] rounded-full bg-green-500" />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">Sarah Johnson - HR Specialist</span>
              <span className="font-semibold text-gray-900">60% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[60%] rounded-full bg-blue-500" />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">Michael Brown - Finance Analyst</span>
              <span className="font-semibold text-gray-900">40% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[40%] rounded-full bg-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
