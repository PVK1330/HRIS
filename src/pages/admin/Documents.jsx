import { useMemo, useState } from 'react'
import { HiArrowDownTray } from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employees } from '../../data/mockData.js'

const docRows = employees.slice(0, 8).map((e, idx) => ({
  id: `doc-${e.id}`,
  employee: e.name,
  docType: idx % 3 === 0 ? 'Contract' : idx % 3 === 1 ? 'ID' : 'Policy Ack',
  version: `v${1 + (idx % 3)}`,
  updated: '2026-04-04',
  status: idx % 4 === 0 ? 'Pending review' : 'Signed',
}))

export default function Documents() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return docRows
    return docRows.filter((r) => `${r.employee} ${r.docType}`.toLowerCase().includes(query))
  }, [q])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'docType', label: 'Document' },
    { key: 'version', label: 'Version' },
    { key: 'updated', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v.includes('Pending') ? 'orange' : 'green'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Download" variant="ghost" size="sm" icon={HiArrowDownTray} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Contracts, IDs, and acknowledgements.</p>
        </div>
        <Button label="Upload document" variant="primary" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Employee or document type…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
