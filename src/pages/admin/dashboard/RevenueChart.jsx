import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ChartSkeleton() {
  return <div className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
}

export default function RevenueChart({ data, loading }) {
  if (loading) return <ChartSkeleton />

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Revenue Analytics</h3>
        <span className="text-xs text-slate-500">This year</span>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis axisLine={false} tickLine={false} dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#1d4ed8"
              fill="#1d4ed8"
              fillOpacity={0.15}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
