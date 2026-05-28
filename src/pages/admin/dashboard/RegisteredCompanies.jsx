import { Building2 } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge.jsx'

export default function RegisteredCompanies({ companies, loading }) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recently Registered Companies</h3>
      </div>
      {!companies.length ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No newly registered companies.
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors duration-200 hover:bg-slate-50/70">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#0F766E]" />
                  <p className="truncate text-sm font-semibold text-slate-900">{company.name}</p>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{company.domain}</p>
              </div>
              <div className="text-right">
                <Badge label={company.plan} color={company.plan.toLowerCase().includes('enterprise') ? 'amber' : 'blue'} />
                <p className="mt-1 text-xs text-slate-500">{company.users} users</p>
                <button type="button" className="mt-1 text-xs font-medium text-[#0F766E] hover:underline">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
