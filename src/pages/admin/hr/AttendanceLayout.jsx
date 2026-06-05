import { NavLink, Outlet } from 'react-router-dom'
import { HiCalendarDays, HiChartBar, HiClipboardDocumentList, HiTableCells, HiClock, HiUserCircle } from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  canManageAttendanceOverride,
  canRequestRegularization,
  canViewAllAttendance,
  canViewOwnAttendance,
  canViewTeamAttendance,
} from '../../../utils/rbac.js'
import { useAttendanceSettings } from '../../../hooks/useAttendanceSettings.js'

const tabs = [
  { to: '/admin/attendance', label: 'My Attendance', icon: HiUserCircle, end: true, kind: 'own' },
  { to: '/admin/attendance/log', label: 'Daily Log', icon: HiTableCells, kind: 'team' },
  { to: '/admin/attendance/dashboard', label: 'Dashboard', icon: HiChartBar, kind: 'team' },
  { to: '/admin/attendance/regularization', label: 'Regularization', icon: HiClipboardDocumentList, kind: 'regularization' },
  { to: '/admin/attendance/overtime', label: 'Overtime', icon: HiClock, kind: 'overtime' },
  { to: '/admin/attendance/reports', label: 'Reports', icon: HiCalendarDays, kind: 'team' },
  { to: '/admin/attendance/override', label: 'Override', icon: HiClipboardDocumentList, kind: 'manage' },
]

function tabVisible(tab, mods, overtimeEnabled) {
  if (tab.kind === 'manage') return canManageAttendanceOverride(mods)
  // Overtime tab is shown only when overtime is enabled in settings AND the user can manage it.
  if (tab.kind === 'overtime') return overtimeEnabled && canManageAttendanceOverride(mods)
  if (tab.kind === 'team') return canViewTeamAttendance(mods) || canViewAllAttendance(mods)
  if (tab.kind === 'regularization') {
    return canRequestRegularization(mods) || canViewTeamAttendance(mods) || canViewAllAttendance(mods)
  }
  return canViewOwnAttendance(mods) || canViewTeamAttendance(mods) || canViewAllAttendance(mods)
}

export default function AttendanceLayout() {
  const { allowedModules } = useAuth()
  const { settings } = useAttendanceSettings()
  const mods = allowedModules || []
  const overtimeEnabled = settings?.overtimeSettings?.overtimeEligibility === true
  const visibleTabs = tabs.filter((t) => tabVisible(t, mods, overtimeEnabled))

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Track presence, regularizations, and reports</p>
      </div>

      <nav className="flex flex-wrap gap-3 border-b border-slate-200 pb-4">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'border-[1.5px] border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E]'
                    : 'border-[1.5px] border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? "h-4 w-4 text-[#0F766E]" : "h-4 w-4 text-slate-400"} />
                  {tab.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  )
}
