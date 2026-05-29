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
import ExitWorkflowSettings from './ExitWorkflowSettings.jsx'

const navItems = [
  { id: 'general',       label: 'General',              Icon: HiBuildingOffice2    },
  { id: 'roles',         label: 'Roles & Permissions',  Icon: HiShieldCheck        },
  { id: 'sensitive',     label: 'Sensitive Data',        Icon: HiLockClosed         },
  { id: 'attendance',    label: 'Attendance & Time',     Icon: HiClock              },
  { id: 'leave',         label: 'Leave Settings',        Icon: HiCalendar           },
  { id: 'documents',     label: 'Document Settings',     Icon: HiDocumentText       },
  { id: 'assets',        label: 'Asset Settings',        Icon: HiBriefcase          },
  { id: 'exit',          label: 'Exit Management',       Icon: HiArrowRightOnRectangle },
  { id: 'notifications', label: 'Notifications',         Icon: HiBell               },
  { id: 'security',      label: 'Password & Security',   Icon: HiKey                },
]

const sectionMeta = {
  general: {
    title: 'General',
    subtitle: 'Company profile, working calendar, and default HR policies.',
  },
  roles: {
    title: 'Roles & Permissions',
    subtitle: 'Control module access and which employee records each role can view.',
  },
  sensitive: {
    title: 'Sensitive Data',
    subtitle: 'Control who can view salary, documents, and confidential employee data.',
  },
  attendance: {
    title: 'Attendance & Time',
    subtitle: 'Work hours, punctuality rules, regularization, and overtime policies.',
  },
  leave: {
    title: 'Leave Settings',
    subtitle: 'Configure leave types, entitlements, and approval rules.',
  },
  documents: {
    title: 'Document Settings',
    subtitle: 'Required document types, upload rules, and visibility per classification.',
  },
  assets: {
    title: 'Asset Settings',
    subtitle: 'Asset categories, assignment rules, and approval workflows.',
  },
  exit: {
    title: 'Exit Management',
    subtitle: 'Termination types, clearance checklist templates, and exit workflows.',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Enable channels and assign alerts to email, SMS, and in-app delivery.',
  },
  security: {
    title: 'Password & Security',
    subtitle: 'Password rules, session timeouts, and account recovery options.',
  },
}

const EXIT_TABS = [
  { id: 'termination', label: 'Termination Types',   Icon: HiArrowRightOnRectangle },
  { id: 'clearance',   label: 'Clearance Checklist', Icon: HiWrenchScrewdriver     },
  { id: 'workflow',    label: 'Exit Workflow',       Icon: HiCog6Tooth             },
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
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      {exitTab === 'termination' ? (
        <TerminationTypes embedded />
      ) : exitTab === 'clearance' ? (
        <ClearanceChecklistSettings embedded />
      ) : (
        <ExitWorkflowSettings embedded />
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
  const meta = sectionMeta[active]

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — matches Employee Profile */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">System Settings Portal</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Administration</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Organization Configuration</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          {toolbar ? (
            <>
              <button
                type="button"
                disabled={!toolbar.dirty || toolbar.saving}
                onClick={() => toolbar?.onDiscard?.()}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F766E] transition-colors shadow-2xs shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={toolbar.disableSave}
                onClick={() => toolbar?.onSave?.()}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none bg-[#0F766E] px-3 text-xs font-bold text-white hover:bg-[#0c6b64] transition-colors shadow-2xs shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {toolbar?.saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-400 hidden sm:inline">Auto-saved or read-only</span>
          )}
        </div>
      </div>

      {/* Context header panel — matches Employee Profile identity card */}
      <div className="relative overflow-hidden rounded-none border border-slate-200 bg-white p-4 shadow-2xs min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-emerald-50 text-[#0F766E] shadow-2xs">
              <HiCog6Tooth className="h-6 w-6" aria-hidden />
            </div>
            <div
              className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white"
              title="Active configuration"
            >
              <span className="h-1 w-1 rounded-full bg-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <HiCog6Tooth className="h-3.5 w-3.5 shrink-0 text-[#0F766E]" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] leading-none">System Settings</span>
            </div>
            <h2 className="mb-1.5 truncate text-xl font-black uppercase leading-none tracking-tight text-slate-900">
              {meta?.title || 'General'}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-black leading-none rounded-none border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
                {activeMeta?.label || '—'}
              </span>
              {meta?.subtitle ? (
                <span className="text-xs font-semibold leading-none text-slate-600 truncate max-w-xl">
                  • {meta.subtitle}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Tab card — matches Employee Profile tab strip */}
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
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-400">
            <HiClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              <span className="font-medium">Active module </span>
              <span className="font-bold text-slate-600">{activeMeta?.label || '—'}</span>
            </span>
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
  )
}
