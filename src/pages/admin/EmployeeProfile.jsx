import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employeeProfileEvents, employees } from '../../data/mockData.js'

export default function EmployeeProfile() {
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? '')

  const selected = employees.find((e) => e.id === selectedId) ?? employees[0]

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'event', label: 'Event' },
    { key: 'owner', label: 'Owner' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Employee Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Review core details and recent HR milestones.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Select employee"
          name="emp"
          type="select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.empId})` }))}
        />
      </div>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-gray-900">{selected.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge label={selected.status} color="green" />
              <Badge label={selected.department} color="blue" />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</dt>
                <dd className="text-gray-800">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</dt>
                <dd className="text-gray-800">{selected.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Job title</dt>
                <dd className="text-gray-800">{selected.jobTitle}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Manager</dt>
                <dd className="text-gray-800">{selected.manager}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</dt>
                <dd className="text-gray-800">{selected.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nationality</dt>
                <dd className="text-gray-800">{selected.nationality}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button label="Request update" variant="secondary" />
              <Button label="Download profile" variant="outline" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-bold text-gray-900">Notes</h3>
            <p className="mt-2 text-sm text-gray-600">
              Profile data is sourced from `mockData` employees. No API calls are wired yet.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Recent HR events</h2>
        <Table columns={columns} data={employeeProfileEvents} pageSize={5} emptyMessage="No records" />
      </div>
    </div>
  )
}
