import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { sponsors } from '../../data/mockData.js'

function statusColor(s) {
  if (s === 'Active') return 'green'
  if (s === 'Pending Review') return 'orange'
  if (s === 'Suspended') return 'red'
  if (s === 'Inactive') return 'gray'
  return 'blue'
}

export default function SponsorsBusiness() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return sponsors
    return sponsors.filter((s) => `${s.companyName} ${s.contactName} ${s.email}`.toLowerCase().includes(query))
  }, [q])

  const columns = [
    { key: 'companyName', label: 'Company' },
    { key: 'contactName', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'activeClients', label: 'Active clients' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Open" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Sponsors / Businesses</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor sponsor relationships and utilization.</p>
        </div>
        <Button label="Add sponsor" variant="primary" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Company, contact, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />
    </div>
  )
}
