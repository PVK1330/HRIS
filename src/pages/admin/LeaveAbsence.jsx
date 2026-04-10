import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { leaveRequests } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Approved') return 'green'
  if (s === 'Pending') return 'orange'
  if (s === 'Rejected') return 'red'
  return 'gray'
}

export default function LeaveAbsence() {
  const [status, setStatus] = useState('')

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ]

  const filtered = useMemo(() => {
    if (!status) return leaveRequests
    return leaveRequests.filter((l) => l.status === status)
  }, [status])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'type', label: 'Type' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button label="Approve" variant="secondary" size="sm" />
          <Button label="Reject" variant="ghost" size="sm" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Leave &amp; Absence</h1>
          <p className="mt-1 text-sm text-gray-500">Review requests and approvals.</p>
        </div>
        <Button label="Log absence" variant="outline" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Status"
          name="status"
          type="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
