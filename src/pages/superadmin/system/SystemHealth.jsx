import { useState } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'

export default function SystemHealth() {
  const services = [
    { name: 'API Server', status: 'Operational', uptime: '99.98%', color: 'green' },
    { name: 'Database', status: 'Operational', latency: '12ms avg', color: 'green' },
    { name: 'File Storage', status: 'Operational', usage: '4.2TB used', color: 'green' },
    { name: 'Email Service', status: 'Degraded', latency: 'Queue delay', color: 'amber' },
    { name: 'CDN', status: 'Operational', latency: '38ms avg', color: 'green' },
    { name: 'Background Jobs', status: 'Operational', failed: '0 failed', color: 'green' },
  ]

  const resources = [
    { name: 'CPU Usage', value: 34, color: 'indigo' },
    { name: 'Memory', value: 61, color: 'cyan' },
    { name: 'Storage', value: 42, color: 'green' },
    { name: 'DB Connections', value: 39, max: 200, label: '78 / 200', color: 'amber' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="mt-1 text-sm text-gray-600">Monitor platform services and resource usage</p>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <span className={`h-3 w-3 flex-shrink-0 rounded-full ${service.color === 'green' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <div className="text-sm font-semibold text-gray-900">{service.name}</div>
              <div className={`text-xs font-semibold ${service.color === 'green' ? 'text-green-600' : 'text-amber-600'}`}>
                {service.status} · {service.uptime || service.latency || service.usage || service.failed}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Resource Usage */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Resource Usage</h2>
          <div className="space-y-4">
            {resources.map((resource, idx) => (
              <div key={idx}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-500">{resource.name}</span>
                  <span className="font-semibold text-gray-900">{resource.label || `${resource.value}%`}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full bg-${resource.color}-500`} style={{ width: `${resource.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Controls */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Maintenance Controls</h2>
          <div className="mb-6 flex flex-col gap-2">
            <Button label="🔄 Restart API Servers" variant="ghost" className="justify-start gap-2" />
            <Button label="🗑️ Clear Cache (All Tenants)" variant="ghost" className="justify-start gap-2" />
            <Button label="💾 Trigger Manual Backup" variant="ghost" className="justify-start gap-2" />
            <Button label="🚧 Enable Maintenance Mode" variant="danger" className="justify-start gap-2" />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 text-xs font-bold text-gray-500">MAINTENANCE WINDOW</div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Start Time</label>
                <Input type="datetime-local" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">End Time</label>
                <Input type="datetime-local" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Message to Tenants</label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                  placeholder="We'll be back shortly..."
                />
              </div>
              <Button label="Schedule Maintenance" variant="primary" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
