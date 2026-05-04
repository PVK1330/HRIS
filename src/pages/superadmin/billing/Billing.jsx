import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { 
  HiArrowTrendingDown, 
  HiCurrencyDollar, 
  HiDocumentText, 
  HiCloudArrowDown,
  HiBellAlert,
  HiArrowPath,
  HiDocumentPlus
} from 'react-icons/hi2'

export default function Billing() {
  const invoices = useMemo(() => [
    { id: 'INV-2026-041', tenant: 'AlphaCorp HR', plan: 'Enterprise', amount: 2400, issueDate: '01 Apr 2026', dueDate: '01 Apr 2026', status: 'Paid' },
    { id: 'INV-2026-042', tenant: 'TalentCo FZCO', plan: 'Pro', amount: 1299, issueDate: '01 Apr 2026', dueDate: '01 Apr 2026', status: 'Paid' },
    { id: 'INV-2026-038', tenant: 'Zenith People', plan: 'Starter', amount: 299, issueDate: '01 Mar 2026', dueDate: '01 Mar 2026', status: 'Unpaid', overdue: '14d' },
    { id: 'INV-2026-039', tenant: 'Meridian HR', plan: 'Growth', amount: 699, issueDate: '01 Mar 2026', dueDate: '01 Mar 2026', status: 'Processing' },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Control</h1>
          <p className="mt-1 text-sm text-gray-500">Global revenue tracking, invoicing, and subscription reconciliation.</p>
        </div>
        <div className="flex gap-2">
           <Button label="Sync Payments" variant="ghost" icon={HiArrowPath} onClick={() => alert('Syncing with Stripe/PayPal...')} />
           <Button label="Manual Invoice" variant="primary" icon={HiDocumentPlus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="MONTHLY REVENUE" value="$48,290" icon={HiCurrencyDollar} trend="+12.5%" trendColor="green" />
        <StatCard title="ANNUAL RUN RATE" value="$579.4k" icon={HiCurrencyDollar} trend="+8.2%" trendColor="green" />
        <StatCard title="OUTSTANDING" value="$896" icon={HiBellAlert} trendColor="red" />
        <StatCard title="NET CHURN" value="1.8%" icon={HiArrowTrendingDown} trend="-0.3%" trendColor="green" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
           <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Invoicing & Ledger</h2>
           <Button label="Export History" variant="ghost" size="sm" />
        </div>
        <Table
          columns={[
            { key: 'invoice', label: 'Reference' },
            { key: 'tenant', label: 'Tenant' },
            { key: 'plan', label: 'Plan Tier' },
            { key: 'amount', label: 'Amount' },
            { key: 'dates', label: 'Issue / Due Date' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={invoices.map((invoice) => ({
            invoice: (
              <div className="flex items-center gap-2">
                 <HiDocumentText className="text-gray-400 h-4 w-4" />
                 <span className="font-mono text-[11px] font-bold text-indigo-600">{invoice.id}</span>
              </div>
            ),
            tenant: <span className="text-sm font-bold text-gray-900">{invoice.tenant}</span>,
            plan: <Badge label={invoice.plan} color={invoice.plan === 'Enterprise' ? 'amber' : 'blue'} />,
            amount: (
               <div className="flex flex-col">
                  <span className={`text-sm font-bold ${invoice.status === 'Paid' ? 'text-gray-900' : 'text-red-600'}`}>${invoice.amount.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400">USD (Net)</span>
               </div>
            ),
            dates: (
               <div className="flex flex-col">
                  <span className="text-xs text-gray-600 font-medium">{invoice.issueDate}</span>
                  <span className={`text-[10px] ${invoice.overdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                     Due: {invoice.dueDate} {invoice.overdue && `(LATE ${invoice.overdue})`}
                  </span>
               </div>
            ),
            status: <Badge label={invoice.status} color={invoice.status === 'Paid' ? 'green' : invoice.status === 'Unpaid' ? 'red' : 'gray'} />,
            actions: (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" icon={HiCloudArrowDown} title="Download PDF" onClick={() => alert('Generating PDF...')} />
                {invoice.status === 'Unpaid' && (
                  <Button variant="ghost" size="sm" icon={HiBellAlert} className="text-red-500 hover:bg-red-50" title="Send Reminder" onClick={() => alert(`Reminder sent to ${invoice.tenant}`)} />
                )}
              </div>
            ),
          }))}
        />
      </div>
    </div>
  )
}
