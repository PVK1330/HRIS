import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  HiArrowRightOnRectangle,
  HiBars3,
  HiBell,
  HiBuildingOffice,
  HiCalendar,
  HiChartBar,
  HiClipboardDocumentCheck,
  HiClock,
  HiCog6Tooth,
  HiCreditCard,
  HiCurrencyDollar,
  HiDocument,
  HiDocumentText,
  HiEnvelope,
  HiFlag,
  HiFolder,
  HiSquares2X2,
  HiUser,
  HiUserPlus,
  HiUsers,
  HiBriefcase,
  HiMegaphone,
  HiChartPie,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2'
import { Sidebar } from '../components/ui/Sidebar.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Button } from '../components/ui/Button.jsx'
import NotificationDropdown from '../components/layout/NotificationDropdown.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const adminNavGroups = [
  {
    groupLabel: 'MANAGEMENT',
    items: [
      { label: 'Dashboard', icon: HiSquares2X2, path: '/admin/dashboard', permission: 'view_dashboard' },
      { label: 'Employee Directory', icon: HiUsers, path: '/admin/employee-directory', permission: 'view_employees' },
      { label: 'Attendance', icon: HiClock, path: '/admin/attendance', permission: 'view_attendance' },
      { label: 'Leave & Absence', icon: HiCalendar, path: '/admin/leave', permission: 'view_leave' },
      { label: 'Documents & Approval', icon: HiDocument, path: '/admin/documents', permission: 'view_documents' },
      { label: 'Visa & Nationality', icon: HiCreditCard, path: '/admin/visa', permission: 'view_visa' },
      { label: 'Assets', icon: HiBriefcase, path: '/admin/assets', permission: 'view_assets' },
    ],
  },
  {
    groupLabel: 'HR OPERATIONS',
    items: [
      { label: 'Performance', icon: HiChartBar, path: '/admin/performance', permission: 'view_performance' },
      { label: 'Policies', icon: HiClipboardDocumentCheck, path: '/admin/policies', permission: 'view_policies' },
      { label: 'Expenses', icon: HiCurrencyDollar, path: '/admin/expenses', permission: 'view_expenses' },
      { label: 'Onboarding', icon: HiUserPlus, path: '/admin/onboarding', permission: 'view_onboarding' },
      { label: 'Exit Management', icon: HiArrowRightOnRectangle, path: '/admin/exit-management', permission: 'view_exit' },
      { label: 'Letter Templates', icon: HiEnvelope, path: '/admin/letters', permission: 'view_letters' },
      { label: 'Reports & Analytics', icon: HiChartPie, path: '/admin/reports', permission: 'view_reports' },
      { label: 'Announcements', icon: HiMegaphone, path: '/admin/announcements', permission: 'view_announcements' },
      { label: 'Payroll Management', icon: HiCurrencyDollar, path: '/admin/payroll', permission: 'view_payroll' },
    ],
  },
  {
    groupLabel: 'ORGANIZATION',
    items: [
      { label: 'Departments', icon: HiBuildingOffice, path: '/admin/departments', permission: 'edit_settings' },
      { label: 'Projects', icon: HiFolder, path: '/admin/projects', permission: 'edit_settings' },
      { label: 'Tasks', icon: HiFlag, path: '/admin/tasks', permission: 'edit_settings' },
      { label: 'Template Generator', icon: HiDocumentText, path: '/admin/templates', permission: 'edit_settings' },
    ],
  },
  {
    groupLabel: 'ADMINISTRATION',
    items: [
      { label: 'System Settings', icon: HiCog6Tooth, path: '/admin/settings', permission: 'edit_settings' },
    ],
  },
]

function titleCaseSegment(seg) {
  return seg
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const ROLE_DISPLAY = {
  hr_admin: 'HR Admin',
  hr_executive: 'HR Executive',
  manager: 'Manager',
  employee: 'Employee',
}

export default function AdminLayout() {
  const { user, logout, hasPermission, switchRole } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  const filteredNavGroups = useMemo(() => {
    return adminNavGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.permission) return true
        // Special case for dashboard - everyone sees it
        if (item.path === '/admin/dashboard') return true
        
        // Detailed permission check
        if (item.permission === 'view_employees' && (user.role === 'hr_admin' || user.role === 'hr_executive' || user.role === 'manager')) return true
        if (item.permission === 'view_attendance' && true) return true // everyone sees attendance
        if (item.permission === 'view_leave' && true) return true // everyone sees leave
        if (item.permission === 'view_documents' && (user.role === 'hr_admin' || user.role === 'hr_executive' || user.role === 'employee')) return true
        if (item.permission === 'view_visa' && (user.role === 'hr_admin' || user.role === 'hr_executive')) return true
        if (item.permission === 'view_assets' && (user.role === 'hr_admin' || user.role === 'hr_executive' || user.role === 'employee')) return true
        if (item.permission === 'view_performance' && true) return true
        if (item.permission === 'view_policies' && true) return true
        if (item.permission === 'view_expenses' && true) return true
        if (item.permission === 'view_onboarding' && (user.role === 'hr_admin' || user.role === 'hr_executive')) return true
        if (item.permission === 'view_exit' && (user.role === 'hr_admin' || user.role === 'hr_executive')) return true
        if (item.permission === 'view_letters' && (user.role === 'hr_admin')) return true
        if (item.permission === 'view_reports' && (user.role === 'hr_admin' || user.role === 'hr_executive')) return true
        if (item.permission === 'view_announcements' && true) return true
        if (item.permission === 'view_messages' && true) return true
        if (item.permission === 'view_payroll' && (user.role === 'hr_admin')) return true
        if (item.permission === 'edit_settings' && (user.role === 'hr_admin')) return true
        
        return hasPermission(item.permission)
      })
    })).filter(group => group.items.length > 0)
  }, [user, hasPermission])

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'admin') return ['Home', 'Admin']
    const crumbs = ['Home', 'Admin']
    if (parts[1]) crumbs.push(titleCaseSegment(parts[1]))
    return crumbs
  }, [location.pathname])

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-background-tertiary">
      {/* Dev Role Indicator Banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex h-1 items-center bg-primary" title={`Viewing as: ${ROLE_DISPLAY[user?.role]}`} />
      
      <Sidebar
        navGroups={filteredNavGroups}
        role={user?.role}
        user={user}
        onLogout={logout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-64">
        <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-border-tertiary bg-background-primary px-3 sm:h-16 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-text-secondary hover:bg-background-secondary md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <HiBars3 className="h-6 w-6" />
            </button>
            <nav className="hidden min-w-0 max-w-[50vw] truncate text-sm text-text-secondary sm:flex sm:items-center sm:gap-2 md:max-w-none">
              {breadcrumb.map((c, i) => (
                <span key={`${c}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span className="text-text-tertiary">/</span>}
                  {i === 0 ? (
                    <Link to="/admin/dashboard" className="hover:text-primary">
                      {c}
                    </Link>
                  ) : (
                    <span className={i === breadcrumb.length - 1 ? 'font-semibold text-text-primary' : ''}>
                      {c}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dev Switch Role */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-all hover:bg-primary/20"
              >
                <span>Viewing as: {ROLE_DISPLAY[user?.role]}</span>
                <span className="text-[10px] opacity-60">▼</span>
              </button>
              
              {showRoleSwitcher && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border-tertiary bg-background-primary p-2 shadow-2xl">
                  {Object.entries(ROLE_DISPLAY).map(([roleKey, label]) => (
                    <button
                      key={roleKey}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-all hover:bg-background-tertiary ${user?.role === roleKey ? 'bg-primary/10 text-primary' : 'text-text-secondary'}`}
                      onClick={() => {
                        switchRole(roleKey);
                        setShowRoleSwitcher(false);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <NotificationDropdown />
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user?.name} size="sm" />
              <div className="min-w-0 text-right">
                <div className="truncate text-sm font-semibold text-text-primary">{user?.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {ROLE_DISPLAY[user?.role]}
                </div>
              </div>
            </div>
            <Button label="Log out" variant="ghost" size="sm" onClick={logout} />
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-background-tertiary p-4 sm:p-6">
          <div className="mx-auto min-w-0 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
