import { useState } from 'react'
import {
  HiArrowRightOnRectangle,
  HiBell,
  HiBriefcase,
  HiBuildingOffice2,
  HiCalendar,
  HiClock,
  HiCog6Tooth,
  HiDocumentText,
  HiKey,
  HiLockClosed,
  HiShieldCheck,
  HiWrenchScrewdriver,
} from 'react-icons/hi2'
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
import TerminationTypes from './TerminationTypes.jsx'
import ClearanceChecklistSettings from './ClearanceChecklist.jsx'
import { SettingsPageHeader } from './components/ui'

const navItems = [
  { id: 'general',       label: 'General',              Icon: HiBuildingOffice2    },
  { id: 'roles',         label: 'Roles & Permissions',  Icon: HiShieldCheck        },
  { id: 'sensitive',     label: 'Sensitive Data',        Icon: HiLockClosed         },
  { id: 'attendance',    label: 'Attendance & Time',     Icon: HiClock              },
  { id: 'leave',         label: 'Leave Settings',        Icon: HiCalendar           },
  { id: 'documents',     label: 'Document Settings',     Icon: HiDocumentText       },
  { id: 'assets',        label: 'Asset Settings',        Icon: HiBriefcase          },
  { id: 'exit',          label: 'Exit Settings',         Icon: HiArrowRightOnRectangle },
  { id: 'notifications', label: 'Notifications',         Icon: HiBell               },
  { id: 'security',      label: 'Password & Security',   Icon: HiKey                },
]

const EXIT_TABS = [
  { id: 'termination', label: 'Termination Types',   Icon: HiArrowRightOnRectangle },
  { id: 'clearance',   label: 'Clearance Checklist', Icon: HiWrenchScrewdriver     },
]

function ExitSettingsSection() {
  const [exitTab, setExitTab] = useState('termination')
  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        {EXIT_TABS.map((t) => {
          const Icon = t.Icon
          const isActive = exitTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setExitTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      {exitTab === 'termination' ? (
        <TerminationTypes embedded />
      ) : (
        <ClearanceChecklistSettings embedded />
      )}
    </div>
  )
}

function ActiveSection({
  active,
  registerGeneralToolbar,
  registerAttendanceToolbar,
  registerAssetsToolbar,
  registerLeaveToolbar,
  registerSensitiveToolbar,
  registerSecurityToolbar,
  registerNotificationsToolbar,
  registerRolesToolbar,
}) {
  switch (active) {
    case 'general':
      return <GeneralSection registerToolbar={registerGeneralToolbar} />
    case 'roles':
      return <RolesPermissions registerToolbar={registerRolesToolbar} />
    case 'modules':
      return <ModulesSection />
    case 'sensitive':
      return <SensitiveData registerToolbar={registerSensitiveToolbar} />
    case 'attendance':
      return <AttendanceSection registerToolbar={registerAttendanceToolbar} />
    case 'leave':
      return <LeaveSettings registerToolbar={registerLeaveToolbar} />
    case 'documents':
      return <DocumentSettings />
    case 'assets':
      return <AssetSettingsSection registerToolbar={registerAssetsToolbar} />
    case 'exit':
      return <ExitSettingsSection />
    case 'notifications':
      return <NotificationSettings registerToolbar={registerNotificationsToolbar} />
    case 'security':
      return <PasswordSecurity registerToolbar={registerSecurityToolbar} />
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
  const [sensitiveToolbar, setSensitiveToolbar] = useState(null)
  const [securityToolbar, setSecurityToolbar] = useState(null)
  const [notificationsToolbar, setNotificationsToolbar] = useState(null)
  const [rolesToolbar, setRolesToolbar] = useState(null)

  const toolbar =
    active === 'general'        ? generalToolbar        :
    active === 'attendance'     ? attendanceToolbar     :
    active === 'assets'         ? assetsToolbar         :
    active === 'leave'          ? leaveToolbar          :
    active === 'sensitive'      ? sensitiveToolbar      :
    active === 'security'       ? securityToolbar       :
    active === 'notifications'  ? notificationsToolbar  :
    active === 'roles'          ? rolesToolbar          :
    null

  const activeMeta = navItems.find((n) => n.id === active)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <SettingsPageHeader
          title="System Settings"
          subtitle="Configure organization policies, access controls, and module behavior."
        />

        <div className="rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = active === item.id
                const Icon = item.Icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0F766E] text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 min-w-0 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <HiCog6Tooth className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="font-medium">Settings</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-700">{activeMeta?.label}</span>
              </div>

              {toolbar ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={!toolbar.dirty || toolbar.saving}
                    onClick={() => toolbar?.onDiscard?.()}
                    className="h-8 border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={toolbar.disableSave}
                    onClick={() => toolbar?.onSave?.()}
                    className="h-8 bg-[#0F766E] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6d66] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {toolbar?.saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 p-4 sm:p-6">
            <ActiveSection
              active={active}
              registerGeneralToolbar={setGeneralToolbar}
              registerAttendanceToolbar={setAttendanceToolbar}
              registerAssetsToolbar={setAssetsToolbar}
              registerLeaveToolbar={setLeaveToolbar}
              registerSensitiveToolbar={setSensitiveToolbar}
              registerSecurityToolbar={setSecurityToolbar}
              registerNotificationsToolbar={setNotificationsToolbar}
              registerRolesToolbar={setRolesToolbar}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
