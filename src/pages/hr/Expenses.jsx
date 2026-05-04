import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table } from '../../components/ui/Table.jsx'

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('pending')

  const pendingClaims = [
    { employee: 'Rohit Shah', category: 'Travel', amount: '₹4,200', date: '05 Apr 2026', description: 'Client visit — auto + train fare' },
  ]

  const history = [
    { employee: 'Priti Gupta', category: 'Meals', amount: '₹1,800', status: 'Approved', approvedBy: 'Neha Jain', date: '01 Apr 2026' },
    { employee: 'Anita Nair', category: 'Communication', amount: '₹600', status: 'Approved', approvedBy: 'Neha Jain', date: '25 Mar 2026' },
    { employee: 'Vijay More', category: 'Travel', amount: '₹3,500', status: 'Rejected', approvedBy: 'Neha Jain', date: '18 Mar 2026' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Expense Claims</h1>
        <p className="mt-1 text-sm text-text-secondary">Review and approve expense claims</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-tertiary">
        {[
          { id: 'pending', label: 'Pending (1)' },
          { id: 'history', label: 'Approved / Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-primary-DEFAULT text-primary-DEFAULT font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
            <Table
              columns={[
                { key: 'employee', label: 'Employee' },
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount' },
                { key: 'date', label: 'Date' },
                { key: 'description', label: 'Description' },
                { key: 'receipt', label: 'Receipt' },
                { key: 'action', label: 'Action' },
              ]}
              data={pendingClaims.map(claim => ({
                employee: claim.employee,
                category: <Badge variant="info">{claim.category}</Badge>,
                amount: claim.amount,
                date: claim.date,
                description: claim.description,
                receipt: <Button label="View" variant="secondary" size="sm" />,
                action: (
                  <div className="flex gap-2">
                    <Button label="Approve" variant="success" size="sm" />
                    <Button label="Reject" variant="danger" size="sm" />
                  </div>
                ),
              }))}
            />
          </div>

          <div className="rounded-xl border border-border-tertiary bg-background-secondary p-6 shadow-sm">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Approval comment</label>
              <textarea
                rows={2}
                placeholder="Add remark before approving or rejecting..."
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button label="Approve Claim" variant="success" />
              <Button label="Reject" variant="danger" />
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'category', label: 'Category' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'approvedBy', label: 'Approved By' },
              { key: 'date', label: 'Date' },
            ]}
            data={history.map(h => ({
              employee: h.employee,
              category: h.category,
              amount: h.amount,
              status: <Badge variant={h.status === 'Approved' ? 'success' : 'danger'}>{h.status}</Badge>,
              approvedBy: h.approvedBy,
              date: h.date,
            }))}
          />
        </div>
      )}
    </div>
  )
}
