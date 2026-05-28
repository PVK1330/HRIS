import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ChartSkeleton() {
  return <div className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
}

export default function CompanyGrowthChart({ data, loading }) {
  if (loading) return <ChartSkeleton />

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Companies Growth</h3>
        <span className="text-xs text-slate-500">Monthly</span>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis axisLine={false} tickLine={false} dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="companies" fill="#0F766E" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
