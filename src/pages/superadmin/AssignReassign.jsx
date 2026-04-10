import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { assignQueue } from '../../data/mockData.js'

export default function AssignReassign() {
  const columns = [
    { key: 'caseRef', label: 'Case' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Applied' ? 'green' : 'blue'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Apply" variant="secondary" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Assign / Reassign</h1>
          <p className="mt-1 text-sm text-gray-500">Queue of reassignment actions (mock).</p>
        </div>
        <Button label="Log assignment" variant="outline" />
      </div>

      <Table columns={columns} data={assignQueue} pageSize={5} />
    </div>
  )
}
