import { Badge } from '../../../components/ui/Badge.jsx'

export default function ExpiredPlans({ plans, loading }) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Expired Plans</h3>
      </div>
      {!plans.length ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No expired plans.
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 p-3 transition-colors duration-200 hover:bg-rose-50/70">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{plan.company}</p>
                <p className="mt-1 text-xs text-slate-500">Expired: {plan.expiryDate}</p>
              </div>
              <div className="text-right">
                <Badge label={plan.packageName} color="red" />
                <button type="button" className="mt-1 block text-xs font-medium text-rose-700 hover:underline">
                  Send Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
