import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'

export default function Announcements() {
  const [announcements] = useState([
    {
      id: 1,
      title: 'Platform Upgrade v2.4.0',
      message: 'New performance improvements and bug fixes deployed.',
      audience: 'All Tenants',
      type: 'Info',
      sentDate: '01 Apr 2026',
      recipients: 48,
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      message: 'Planned downtime on 15 Apr from 02:00–04:00 UTC.',
      audience: 'All Tenants',
      type: 'Warning',
      sentDate: '08 Apr 2026',
      recipients: 48,
    },
    {
      id: 3,
      title: 'Trial Expiry Reminder',
      message: 'Your trial ends in 3 days. Please upgrade to continue.',
      audience: 'Trial Tenants',
      type: 'Critical',
      sentDate: '09 Apr 2026',
      recipients: 6,
    },
  ])

  const typeColor = (type) => {
    const colors = {
      'Info': 'blue',
      'Warning': 'amber',
      'Critical': 'red',
    }
    return colors[type] || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-600">Broadcast messages to tenants and end users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create Announcement */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Create Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Title</label>
                <Input placeholder="e.g. Platform Maintenance Notice" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Message</label>
                <textarea
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
                  placeholder="Write your announcement here..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Audience</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                  <option>All Tenants</option>
                  <option>Specific Tenants</option>
                  <option>Plan: Enterprise</option>
                  <option>Plan: Pro</option>
                  <option>Trial Tenants</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Type</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Critical</option>
                  <option>Feature Update</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Schedule (Optional)</label>
                <Input type="datetime-local" />
              </div>
              <div className="flex gap-2">
                <Button label="Send Now" variant="primary" />
                <Button label="Schedule" variant="ghost" />
              </div>
            </div>
          </div>
        </div>

        {/* Sent Announcements */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Sent Announcements</h2>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`rounded-lg border p-3 ${
                    announcement.type === 'Critical'
                      ? 'border-red-200 bg-red-50'
                      : announcement.type === 'Warning'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-indigo-200 bg-indigo-50'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{announcement.title}</span>
                    <Badge variant={typeColor(announcement.type)}>{announcement.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{announcement.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Sent to {announcement.audience} · {announcement.sentDate} · {announcement.recipients} recipients
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
