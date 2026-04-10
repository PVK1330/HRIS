import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { caseActivityByCaseId, cases } from '../../data/mockData.js'

function statusColor(s) {
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

export default function CaseDetail() {
  const [caseId, setCaseId] = useState(cases[0]?.id ?? '')

  const selected = cases.find((c) => c.id === caseId) ?? cases[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Case Detail</h1>
        <p className="mt-1 text-sm text-gray-500">Review core details for a selected case.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Select case"
          name="case"
          type="select"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          options={cases.map((c) => ({ value: c.id, label: `${c.caseRef} — ${c.clientName}` }))}
        />
      </div>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-bold text-gray-900">{selected.caseRef}</h2>
              <Badge label={selected.status} color={statusColor(selected.status)} />
              <Badge label={selected.priority} color={priorityColor(selected.priority)} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Client</dt>
                <dd className="text-gray-800">{selected.clientName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Caseworker</dt>
                <dd className="text-gray-800">{selected.caseworker}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Type</dt>
                <dd className="text-gray-800">{selected.type}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Due</dt>
                <dd className="text-gray-800">{selected.dueDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Created</dt>
                <dd className="text-gray-800">{selected.createdAt}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button label="Add note" variant="secondary" />
              <Button label="Reassign" variant="outline" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-bold text-gray-900">Activity</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {(caseActivityByCaseId[selected.id] ?? []).map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
