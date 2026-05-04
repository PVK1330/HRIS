import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'

export default function HRSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState('daily')
  const [theme, setTheme] = useState('light')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">HR Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Configure your HR panel preferences</p>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Notification Preferences</h2>
        <div className="mt-4 space-y-4">
          <Toggle
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
            label="Enable Notifications"
            description="Receive notifications for leave requests, expense approvals, etc."
          />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Email Digest Frequency</label>
            <select
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value)}
              className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Display Settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <Toggle
            checked={true}
            onChange={() => {}}
            label="Compact Mode"
            description="Use compact spacing for tables and lists"
          />
        </div>
      </div>

      {/* Workflow Settings */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Workflow Settings</h2>
        <div className="mt-4 space-y-4">
          <Toggle
            checked={true}
            onChange={() => {}}
            label="Auto-approve leave for team size under 5"
            description="Automatically approve leave requests for smaller teams"
          />
          <Toggle
            checked={false}
            onChange={() => {}}
            label="Require manager approval for expenses over $500"
            description="Additional approval needed for high-value expenses"
          />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Default Leave Approval Timeframe (days)</label>
            <Input type="number" defaultValue="3" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button label="Save Settings" variant="primary" />
      </div>
    </div>
  )
}
