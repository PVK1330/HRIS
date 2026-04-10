import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { dashboardStats } from '../../data/mockData.js'

export default function Settings() {
  const [companyName, setCompanyName] = useState('ElitePic Holdings')
  const [timezone, setTimezone] = useState('Asia/Dubai')
  const [notify, setNotify] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organization defaults (mock UI). Employees tracked: {dashboardStats.totalEmployees}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Company profile</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Company name"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              label="Timezone"
              name="timezone"
              type="select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'Asia/Dubai', label: 'Asia/Dubai' },
                { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
                { value: 'Europe/London', label: 'Europe/London' },
              ]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Notifications</h2>
          <div className="mt-4 space-y-4">
            <Toggle checked={notify} onChange={setNotify} label="Email HR admins for critical alerts" />
            <p className="text-xs text-gray-500">
              Toggle state is local only (no backend).
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button label="Save changes" variant="secondary" />
      </div>
    </div>
  )
}
