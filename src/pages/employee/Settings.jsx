import { useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

export default function EmployeeSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState('daily')
  const [theme, setTheme] = useState('light')
  const [files, setFiles] = useState({})
  const [fullName, setFullName] = useState('John Smith')
  const [email, setEmail] = useState('john.smith@hris.com')
  const [phone, setPhone] = useState('+971 50 123 4567')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account preferences and profile information</p>
      </div>

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
            <Input
              label="Full Name"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

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
            <Toggle checked={true} onChange={() => {}} label="Leave Request Reminders" />
            <Toggle checked={true} onChange={() => {}} label="Timesheet Submission Reminders" />
            <Toggle checked={false} onChange={() => {}} label="Performance Review Notifications" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Security</h2>
          <div className="mt-4 space-y-4">
            <Toggle checked={true} onChange={() => {}} label="Two-Factor Authentication" />
            <Button label="Change Password" variant="secondary" className="w-full" />
            <Button label="Enable 2FA" variant="secondary" className="w-full" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button label="Cancel" variant="ghost" />
        <Button label="Save Changes" variant="primary" />
      </div>
    </div>
  )
}
