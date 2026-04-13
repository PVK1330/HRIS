import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  HiArrowRightOnRectangle,
  HiBars3,
  HiBell,
  HiCalendar,
  HiChartBar,
  HiClipboardDocumentCheck,
  HiClock,
  HiCog6Tooth,
  HiCreditCard,
  HiCurrencyDollar,
  HiDocument,
  HiEnvelope,
  HiSquares2X2,
  HiUser,
  HiUserPlus,
  HiUsers,
} from 'react-icons/hi2'
import { Sidebar } from '../components/ui/Sidebar.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const adminNavGroups = [
  {
    groupLabel: 'EMPLOYEE MANAGEMENT',
    items: [
      { label: 'Dashboard', icon: HiSquares2X2, path: '/admin/dashboard' },
      { label: 'Employee Directory', icon: HiUsers, path: '/admin/employee-directory' },
      { label: 'Employee Profile', icon: HiUser, path: '/admin/employee-profile' },
      { label: 'Attendance Management', icon: HiClock, path: '/admin/attendance' },
      { label: 'Leave & Absence', icon: HiCalendar, path: '/admin/leave' },
      { label: 'Document Repository', icon: HiDocument, path: '/admin/documents' },
      { label: 'Visa & Nationality', icon: HiCreditCard, path: '/admin/visa' },
    ],
  },
  {
    groupLabel: 'HR OPERATIONS',
    items: [
      { label: 'Performance Management', icon: HiChartBar, path: '/admin/performance' },
      { label: 'Company Policies', icon: HiClipboardDocumentCheck, path: '/admin/policies' },
      { label: 'Expense Management', icon: HiCurrencyDollar, path: '/admin/expenses' },
      { label: 'Onboarding Process', icon: HiUserPlus, path: '/admin/onboarding' },
      {
        label: 'Exit Management',
        icon: HiArrowRightOnRectangle,
        path: '/admin/exit-management',
      },
      { label: 'Letter Templates', icon: HiEnvelope, path: '/admin/letters' },
    ],
  },
  {
    groupLabel: 'ADMINISTRATION',
    items: [{ label: 'System Settings', icon: HiCog6Tooth, path: '/admin/settings' }],
  },
]

function titleCaseSegment(seg) {
  return seg
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'admin') return ['Home', 'Admin']
    const crumbs = ['Home', 'Admin']
    if (parts[1]) crumbs.push(titleCaseSegment(parts[1]))
    return crumbs
  }, [location.pathname])

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-background-tertiary">
      <Sidebar
        navGroups={adminNavGroups}
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
            <button
              type="button"
              className="relative rounded-lg p-2 text-text-secondary hover:bg-background-secondary"
              aria-label="Notifications"
            >
              <HiBell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-DEFAULT" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user?.name} size="sm" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-text-primary">{user?.name}</div>
                <div className="text-xs text-text-secondary">{user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</div>
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
