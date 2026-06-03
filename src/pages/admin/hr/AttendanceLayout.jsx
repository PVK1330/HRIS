import { NavLink, Outlet } from 'react-router-dom'
import { HiCalendarDays, HiChartBar, HiClipboardDocumentList, HiTableCells } from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  canManageAttendanceOverride,
  canRequestRegularization,
  canViewAllAttendance,
  canViewOwnAttendance,
  canViewTeamAttendance,
} from '../../../utils/rbac.js'

const tabs = [
  { to: '/admin/attendance', label: 'Daily Log', icon: HiTableCells, end: true, kind: 'log' },
  { to: '/admin/attendance/dashboard', label: 'Dashboard', icon: HiChartBar, kind: 'team' },
  { to: '/admin/attendance/regularization', label: 'Regularization', icon: HiClipboardDocumentList, kind: 'regularization' },
  { to: '/admin/attendance/reports', label: 'Reports', icon: HiCalendarDays, kind: 'team' },
  { to: '/admin/attendance/override', label: 'Override', icon: HiClipboardDocumentList, kind: 'manage' },
]

function tabVisible(tab, mods) {
  if (tab.kind === 'manage') return canManageAttendanceOverride(mods)
  if (tab.kind === 'team') return canViewTeamAttendance(mods) || canViewAllAttendance(mods)
  if (tab.kind === 'regularization') {
    return canRequestRegularization(mods) || canViewTeamAttendance(mods) || canViewAllAttendance(mods)
  }
  return canViewOwnAttendance(mods) || canViewTeamAttendance(mods) || canViewAllAttendance(mods)
}

export default function AttendanceLayout() {
  const { allowedModules } = useAuth()
  const mods = allowedModules || []
  const visibleTabs = tabs.filter((t) => tabVisible(t, mods))

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Track presence, regularizations, and reports</p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {visibleTabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
