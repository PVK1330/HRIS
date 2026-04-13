import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiClipboardDocumentCheck, HiEye, HiCheck } from 'react-icons/hi2'

function statusColor(status) {
  if (status === 'Acknowledged') return 'green'
  if (status === 'Pending') return 'orange'
  if (status === 'Overdue') return 'red'
  return 'gray'
}

export default function EmployeePolicies() {
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [q, setQ] = useState('')

  const policies = [
    {
      id: 1,
      title: 'HR Policies Handbook',
      category: 'HR',
      version: 'v2.1',
      publishedDate: '2026-03-15',
      status: 'Acknowledged',
      acknowledgedDate: '2026-03-20',
    },
    {
      id: 2,
      title: 'IT & Security Policy',
      category: 'IT',
      version: 'v2.1',
      publishedDate: '2026-04-01',
      status: 'Acknowledged',
      acknowledgedDate: '2026-04-05',
    },
    {
      id: 3,
      title: 'Code of Conduct',
      category: 'Compliance',
      version: 'v3.0',
      publishedDate: '2026-01-10',
      status: 'Acknowledged',
      acknowledgedDate: '2026-01-15',
    },
    {
      id: 4,
      title: 'Remote Work Policy',
      category: 'Operations',
      version: 'v2.0',
      publishedDate: '2026-04-10',
      status: 'Pending',
      acknowledgedDate: null,
    },
    {
      id: 5,
      title: 'Leave Management Policy',
      category: 'HR',
      version: 'v1.5',
      publishedDate: '2026-02-20',
      status: 'Acknowledged',
      acknowledgedDate: '2026-02-25',
    },
  ]

  const filtered = policies.filter((p) => {
    const query = q.trim().toLowerCase()
    if (!query) return true
    return `${p.title} ${p.category}`.toLowerCase().includes(query)
  })

  const summary = {
    total: policies.length,
    acknowledged: policies.filter((p) => p.status === 'Acknowledged').length,
    pending: policies.filter((p) => p.status === 'Pending').length,
    overdue: policies.filter((p) => p.status === 'Overdue').length,
  }

  const handleView = (policy) => {
    setSelectedPolicy(policy)
    setViewModalOpen(true)
  }

  const handleAcknowledge = (policyId) => {
    console.log('Acknowledge policy:', policyId)
    // In real implementation, this would update the status
  }

  const columns = [
    { key: 'title', label: 'Policy Title' },
    { key: 'category', label: 'Category' },
    { key: 'version', label: 'Version' },
    { key: 'publishedDate', label: 'Published' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'acknowledgedDate',
      label: 'Acknowledged On',
      render: (v) => <span className="text-gray-600">{v || '-'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            label="View"
            variant="ghost"
            size="sm"
            icon={HiEye}
            onClick={() => handleView(row)}
          />
          {row.status === 'Pending' && (
            <Button
              label="Acknowledge"
              variant="primary"
              size="sm"
              icon={HiCheck}
              onClick={() => handleAcknowledge(row.id)}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Policies</h1>
          <p className="mt-1 text-sm text-gray-500">View and acknowledge company policies.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Policies"
          value={summary.total}
          subtitle="All policies"
          color="blue"
          icon={HiClipboardDocumentCheck}
        />
        <StatCard
          title="Acknowledged"
          value={summary.acknowledged}
          subtitle="Completed"
          color="green"
          icon={HiCheck}
        />
        <StatCard
          title="Pending"
          value={summary.pending}
          subtitle="Action required"
          color="orange"
          icon={HiClipboardDocumentCheck}
        />
        <StatCard
          title="Overdue"
          value={summary.overdue}
          subtitle="Past due"
          color="red"
          icon={HiClipboardDocumentCheck}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Policy name or category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={10} />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Policy Acknowledgement History</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">IT & Security Policy v2.1</div>
              <div className="text-xs text-gray-500">Acknowledged on Apr 5, 2026</div>
            </div>
            <Badge label="Acknowledged" color="green" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">HR Policies Handbook v2.1</div>
              <div className="text-xs text-gray-500">Acknowledged on Mar 20, 2026</div>
            </div>
            <Badge label="Acknowledged" color="green" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Code of Conduct v3.0</div>
              <div className="text-xs text-gray-500">Acknowledged on Jan 15, 2026</div>
            </div>
            <Badge label="Acknowledged" color="green" />
          </div>
        </div>
      </div>

      {selectedPolicy && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={selectedPolicy.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Category</h3>
                <p className="text-gray-900">{selectedPolicy.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Version</h3>
                <p className="text-gray-900">{selectedPolicy.version}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Published Date</h3>
                <p className="text-gray-900">{selectedPolicy.publishedDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                <Badge label={selectedPolicy.status} color={statusColor(selectedPolicy.status)} />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Policy Content</h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="mb-2">
                  This policy outlines the guidelines and procedures for {selectedPolicy.category.toLowerCase()} related
                  matters within the organization.
                </p>
                <p className="mb-2">
                  All employees are required to read and understand the contents of this policy. Failure to comply may
                  result in disciplinary action.
                </p>
                <p>
                  For any questions or clarifications, please contact the HR department or your immediate supervisor.
                </p>
              </div>
            </div>

            {selectedPolicy.status === 'Pending' && (
              <div className="flex justify-end gap-2">
                <Button label="Close" variant="ghost" onClick={() => setViewModalOpen(false)} />
                <Button
                  label="Acknowledge Policy"
                  variant="primary"
                  onClick={() => {
                    handleAcknowledge(selectedPolicy.id)
                    setViewModalOpen(false)
                  }}
                />
              </div>
            )}

            {selectedPolicy.status === 'Acknowledged' && (
              <div className="flex justify-end">
                <Button label="Close" variant="secondary" onClick={() => setViewModalOpen(false)} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
