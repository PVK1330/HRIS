import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { adminUsers } from '../../data/mockData.js'

export default function Settings() {
  const [auditRetention, setAuditRetention] = useState('90')
  const [enforceMfa, setEnforceMfa] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Super Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform controls (mock UI). Admin accounts tracked: {adminUsers.length}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Security</h2>
          <div className="mt-4 space-y-4">
            <Toggle checked={enforceMfa} onChange={setEnforceMfa} label="Enforce MFA for admin users" />
            <Input
              label="Audit log retention (days)"
              name="auditRetention"
              value={auditRetention}
              onChange={(e) => setAuditRetention(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Operations</h2>
          <p className="mt-2 text-sm text-gray-600">
            These settings are local-only placeholders until a backend is connected.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button label="Save changes" variant="secondary" />
      </div>
    </div>
  )
}
