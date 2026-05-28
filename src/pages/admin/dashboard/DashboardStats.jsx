import { Building2, TrendingUp, Users, Wallet } from 'lucide-react'

const iconByKey = {
  companies: Building2,
  employees: Users,
  subscriptions: TrendingUp,
  revenue: Wallet,
}

function CardSkeleton() {
  return <div className="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
}

function MiniBars({ points = [] }) {
  return (
    <div className="mt-3 flex h-8 items-end gap-1">
      {points.map((point, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={`${point}-${index}`}
          className="w-2 rounded-sm bg-slate-300"
          style={{ height: `${Math.max(16, point)}%` }}
        />
      ))}
    </div>
  )
}

export default function DashboardStats({ items, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = iconByKey[item.key] || Building2
        const isPositive = item.change >= 0
        return (
          <article
            key={item.key}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
                <Icon className="h-5 w-5" />
              </span>
            </div>

            <MiniBars points={item.graph} />

            <div className="mt-3 flex items-center justify-between">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isPositive ? '+' : ''}
                {item.change}%
              </span>
              <span className="text-xs text-slate-500">{item.subtitle}</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
