import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

export default function HRSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState('daily')
  const [theme, setTheme] = useState('light')
  const [files, setFiles] = useState({})
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">HR Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your HR panel preferences and workflow settings</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'general'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'notifications'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'workflow'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Workflow
        </button>
      </div>

      {activeTab === 'general' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Profile Information</h2>
              <div className="mt-4 space-y-4">
                <FileUpload
                  label="Profile Photo"
                  name="profilePhoto"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(fileList) => setFiles((prev) => ({ ...prev, profilePhoto: fileList }))}
                  helpText="PNG, JPG, or WebP. Recommended size: 200x200px."
                />
                <Input label="Full Name" name="fullName" placeholder="Your full name" />
                <Input label="Email Address" name="email" type="email" placeholder="your.email@hris.com" />
                <Input label="Phone Number" name="phone" placeholder="+971 50 123 4567" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Display Settings</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className={selectClass}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <Toggle checked={true} onChange={() => {}} label="Compact Mode" />
                <Toggle checked={true} onChange={() => {}} label="Show Weekend in Calendar" />
                <Toggle checked={false} onChange={() => {}} label="Show Department Filter" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Security</h2>
            <div className="mt-4 space-y-4">
              <Toggle checked={true} onChange={() => {}} label="Two-Factor Authentication" />
              <Button label="Change Password" variant="secondary" className="w-full" />
            </div>
          </div>
        </>
      )}

      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Notification Preferences</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
              label="Enable Notifications"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Digest Frequency</label>
              <select
                value={emailDigest}
                onChange={(e) => setEmailDigest(e.target.value)}
                className={selectClass}
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <Toggle checked={true} onChange={() => {}} label="Leave Request Notifications" />
            <Toggle checked={true} onChange={() => {}} label="Expense Approval Notifications" />
            <Toggle checked={true} onChange={() => {}} label="Attendance Alerts" />
            <Toggle checked={false} onChange={() => {}} label="Performance Review Reminders" />
            <Toggle checked={false} onChange={() => {}} label="Onboarding Updates" />
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Workflow Settings</h2>
          <div className="mt-4 space-y-4">
            <Toggle
              checked={true}
              onChange={() => {}}
              label="Auto-approve leave for team size under 5"
            />
            <Toggle
              checked={false}
              onChange={() => {}}
              label="Require manager approval for expenses over $500"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Default Leave Approval Timeframe (days)</label>
              <Input type="number" defaultValue="3" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Default Expense Approval Limit ($)</label>
              <Input type="number" defaultValue="500" />
            </div>
            <Toggle checked={true} onChange={() => {}} label="Send automated reminders for pending approvals" />
            <Toggle checked={false} onChange={() => {}} label="Escalate overdue approvals to manager" />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button label="Cancel" variant="ghost" />
        <Button label="Save Changes" variant="primary" />
      </div>
    </div>
  )
}
