import { Badge } from '../../../components/ui/Badge.jsx'

function TableSkeleton() {
  return <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
}

function statusColor(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('success') || normalized.includes('paid')) return 'green'
  if (normalized.includes('pending')) return 'amber'
  if (normalized.includes('failed') || normalized.includes('rejected')) return 'red'
  return 'gray'
}

export default function RecentTransactions({ transactions, loading }) {
  if (loading) return <TableSkeleton />

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
        <button type="button" className="text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-900">
          View All
        </button>
      </div>

      {!transactions.length ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No transactions available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[780px] w-full text-left">
            <thead className="border-y border-slate-200 bg-slate-50">
              <tr>
                {['Company Name', 'Transaction ID', 'Date', 'Package', 'Amount', 'Status'].map((label) => (
                  <th key={label} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50/70">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-xs font-semibold text-[#0F766E]">
                        {row.company.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{row.company}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{row.transactionId}</td>
                  <td className="px-3 py-3 text-sm text-slate-600">{row.date}</td>
                  <td className="px-3 py-3 text-sm text-slate-600">{row.packageName}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-slate-900">{row.amount}</td>
                  <td className="px-3 py-3">
                    <Badge label={row.status} color={statusColor(row.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
