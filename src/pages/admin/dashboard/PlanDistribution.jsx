import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

function EmptyState() {
  return (
    <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      No plan distribution data available.
    </div>
  )
}

export default function PlanDistribution({ data, loading }) {
  if (loading) {
    return <div className="h-[340px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (!total) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Plans Distribution</h3>
        <EmptyState />
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Plans Distribution</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={60} outerRadius={88} paddingAngle={2}>
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 self-center">
          {data.map((item) => {
            const percent = Math.round((item.value / total) * 100)
            return (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{percent}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
