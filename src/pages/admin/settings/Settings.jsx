import { useState } from 'react'
import GeneralSection from './sections/GeneralSection.jsx'
import AttendanceSection from './sections/AttendanceSection.jsx'
import LeaveSettings from './LeaveSettings.jsx'
import { ModulesSection } from './sections/PlaceholderSections.jsx'
import AssetSettingsSection from './sections/AssetSettingsSection.jsx'
import DocumentSettings from './DocumentSettings.jsx'
import NotificationSettings from './NotificationSettings.jsx'
import PasswordSecurity from './PasswordSecurity.jsx'
import RolesPermissions from './RolesPermissions.jsx'
import SensitiveData from './SensitiveData.jsx'

const navItems = [
  { id: 'general', label: 'General', icon: '🏢', desc: 'Company & Policies' },
  { id: 'roles', label: 'Roles & Permissions', icon: '🔐', desc: 'Access Control' },
  { id: 'modules', label: 'Module Visibility', icon: '👁️', desc: 'Role-based Views' },
  { id: 'sensitive', label: 'Sensitive Data', icon: '🔒', desc: 'Data Permissions' },
  { id: 'attendance', label: 'Attendance & Time', icon: '🕐', desc: 'Work Hours & Rules' },
  { id: 'leave', label: 'Leave Settings', icon: '🌴', desc: 'Leave Types & Rules' },
  { id: 'documents', label: 'Document Settings', icon: '📄', desc: 'Upload & Tracking' },
  { id: 'assets', label: 'Asset Settings', icon: '💼', desc: 'Categories & Rules' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', desc: 'Alerts & Channels' },
  { id: 'security', label: 'Password & Security', icon: '🛡️', desc: 'Auth & Policies' },
]

function ActiveSection({
  active,
  registerGeneralToolbar,
  registerAttendanceToolbar,
  registerAssetsToolbar,
  registerLeaveToolbar,
}) {
  switch (active) {
    case 'general':
      return <GeneralSection registerToolbar={registerGeneralToolbar} />
    case 'roles':
      return <RolesPermissions />
    case 'modules':
      return <ModulesSection />
    case 'sensitive':
      return <SensitiveData />
    case 'attendance':
      return <AttendanceSection registerToolbar={registerAttendanceToolbar} />
    case 'leave':
      return <LeaveSettings registerToolbar={registerLeaveToolbar} />
    case 'documents':
      return <DocumentSettings />
    case 'assets':
      return <AssetSettingsSection registerToolbar={registerAssetsToolbar} />
    case 'notifications':
      return <NotificationSettings />
    case 'security':
      return <PasswordSecurity />
    default:
      return null
  }
}

export default function HRISSettings() {
  const [active, setActive] = useState('general')
  const [generalToolbar, setGeneralToolbar] = useState(null)
  const [attendanceToolbar, setAttendanceToolbar] = useState(null)
  const [assetsToolbar, setAssetsToolbar] = useState(null)
  const [leaveToolbar, setLeaveToolbar] = useState(null)

  const current = navItems.find((n) => n.id === active)

  const toolbar =
    active === 'general'
      ? generalToolbar
      : active === 'attendance'
        ? attendanceToolbar
        : active === 'assets'
          ? assetsToolbar
          : active === 'leave'
            ? leaveToolbar
            : null

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">HRIS Settings</p>
              <p className="text-xs text-gray-400">System Configuration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                active === item.id
                  ? 'bg-[#0f766e] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-xs font-semibold ${
                    active === item.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </p>
                <p className="truncate text-[10px] text-gray-400">{item.desc}</p>
              </div>
              {active === item.id ? (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              ) : null}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{current.label}</h1>
            <p className="mt-0.5 text-xs text-gray-400">{current.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!toolbar || !toolbar.dirty || toolbar.saving}
              onClick={() => toolbar?.onDiscard?.()}
              className="h-8 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!toolbar || toolbar.disableSave}
              onClick={() => toolbar?.onSave?.()}
              className="h-8 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {toolbar?.saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </header>

        <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-8 py-2 text-xs text-gray-400">
          <span>Settings</span>
          <span>/</span>
          <span className="font-medium text-indigo-600">{current.label}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <ActiveSection
            active={active}
            registerGeneralToolbar={setGeneralToolbar}
            registerAttendanceToolbar={setAttendanceToolbar}
            registerAssetsToolbar={setAssetsToolbar}
            registerLeaveToolbar={setLeaveToolbar}
          />
        </div>
      </main>
    </div>
  )
}
