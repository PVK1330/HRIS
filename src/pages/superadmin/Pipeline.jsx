import { Badge } from '../../components/ui/Badge.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { cases, pipelineKpis, pipelineStages } from '../../data/mockData.js'

export default function Pipeline() {
  const totalOpen = cases.filter((c) => c.status !== 'Closed').length

  const stageColumns = [
    { key: 'name', label: 'Stage' },
    {
      key: 'count',
      label: 'Cases',
      render: (v) => <Badge label={String(v)} color="blue" />,
    },
    {
      key: 'slaHours',
      label: 'SLA (hours)',
      render: (v) => <span className="text-gray-700">{v}h</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="mt-1 text-sm text-gray-500">Stage throughput and SLA targets (mock data).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Open cases" value={totalOpen} subtitle="Across pipeline" color="blue" />
        <StatCard title="Stages" value={pipelineStages.length} subtitle="Configured" color="purple" />
        <StatCard
          title="Bottleneck"
          value={pipelineKpis.bottleneckStageName}
          subtitle="Highest WIP"
          color="orange"
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Stages</h2>
        <Table columns={stageColumns} data={pipelineStages} pageSize={10} />
      </div>
    </div>
  )
}
