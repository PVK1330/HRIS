import { Building2, TrendingUp, Users, Wallet } from 'lucide-react'

const iconByKey = {
  companies: Building2,
  employees: Users,
  subscriptions: TrendingUp,
  revenue: Wallet,
}

// One responsive grid shared by the skeleton and the live cards so they never
// drift: 1 column on phones, 2 on small tablets, 3 once there's room. The cards
// stretch to fill each row instead of leaving an empty 4th slot.
const STATS_GRID = 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

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
      <div className={STATS_GRID}>
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className={STATS_GRID}>
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

            <div className="mt-3 flex items-center justify-end">
              <span className="text-xs text-slate-500">{item.subtitle}</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
