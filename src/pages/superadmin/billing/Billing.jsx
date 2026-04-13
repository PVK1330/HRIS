import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiArrowTrendingDown, HiCurrencyDollar, HiDocument } from 'react-icons/hi2'

export default function Billing() {
  const invoices = useMemo(() => [
    { id: 'INV-2026-041', tenant: 'AlphaCorp HR', plan: 'Enterprise', amount: 2400, issueDate: '01 Apr 2026', dueDate: '01 Apr 2026', status: 'Paid' },
    { id: 'INV-2026-042', tenant: 'TalentCo FZCO', plan: 'Pro', amount: 1299, issueDate: '01 Apr 2026', dueDate: '01 Apr 2026', status: 'Paid' },
    { id: 'INV-2026-038', tenant: 'Zenith People', plan: 'Starter', amount: 299, issueDate: '01 Mar 2026', dueDate: '01 Mar 2026', status: 'Unpaid', overdue: '14d' },
  ], [])

  const statusColor = (status) => {
    const colors = {
      'Paid': 'green',
      'Unpaid': 'red',
      'Pending': 'amber',
    }
    return colors[status] || 'gray'
  }

  const planColor = (plan) => {
    const colors = {
      'Enterprise': 'amber',
      'Growth': 'cyan',
      'Pro': 'indigo',
      'Starter': 'gray',
    }
    return colors[plan] || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Revenue</h1>
          <p className="mt-1 text-sm text-gray-600">Track invoices, payments, and revenue metrics</p>
        </div>
        <div className="flex gap-2">
          <Button label="Export Report" variant="ghost" size="sm" />
          <Button label="Generate Invoice" variant="primary" size="sm" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="MRR" value="$47.2k" valueColor="green" icon={HiCurrencyDollar} />
        <StatCard title="ANNUALIZED" value="$566.4k" valueColor="indigo" icon={HiCurrencyDollar} />
        <StatCard title="OVERDUE" value="$896" valueColor="red" icon={HiDocument} />
        <StatCard title="CHURN RATE" value="2.1%" valueColor="amber" icon={HiArrowTrendingDown} />
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Invoice History</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <Table
            columns={[
              { key: 'invoice', label: 'Invoice #' },
              { key: 'tenant', label: 'Tenant' },
              { key: 'plan', label: 'Plan' },
              { key: 'amount', label: 'Amount' },
              { key: 'issueDate', label: 'Issue Date' },
              { key: 'dueDate', label: 'Due Date' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={invoices.map((invoice) => ({
              invoice: <span className="font-mono text-xs text-indigo-500">{invoice.id}</span>,
              tenant: <span className="text-sm font-semibold text-gray-900">{invoice.tenant}</span>,
              plan: <Badge variant={planColor(invoice.plan)}>{invoice.plan}</Badge>,
              amount: <span className={`font-mono ${invoice.status === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>${invoice.amount.toFixed(2)}</span>,
              issueDate: <span className="text-sm text-gray-500">{invoice.issueDate}</span>,
              dueDate: <span className={`text-sm ${invoice.overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{invoice.dueDate}{invoice.overdue && ` (${invoice.overdue})`}</span>,
              status: <Badge variant={statusColor(invoice.status)}>{invoice.status}</Badge>,
              actions: (
                <div className="flex gap-1">
                  <Button label="Download" variant="ghost" size="sm" />
                  {invoice.status === 'Unpaid' && <Button label="Send Reminder" variant="danger" size="sm" />}
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </div>
  )
}
