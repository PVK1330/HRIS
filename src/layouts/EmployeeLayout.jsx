import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { HiBars3, HiBell, HiHome, HiCalendar, HiClock, HiDocumentText, HiCurrencyDollar, HiChatBubbleLeftRight, HiCog6Tooth, HiUser } from 'react-icons/hi2'
import { Sidebar } from '../components/ui/Sidebar.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const employeeNavGroups = [
  {
    groupLabel: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: HiHome, path: '/employee/dashboard' },
      { label: 'My Profile', icon: HiUser, path: '/employee/profile' },
    ],
  },
  {
    groupLabel: 'TIME & ATTENDANCE',
    items: [
      { label: 'My Attendance', icon: HiClock, path: '/employee/attendance' },
      { label: 'Leave Requests', icon: HiCalendar, path: '/employee/leave' },
      { label: 'Timesheet', icon: HiDocumentText, path: '/employee/timesheet' },
    ],
  },
  {
    groupLabel: 'PERFORMANCE',
    items: [
      { label: 'My Goals', icon: HiDocumentText, path: '/employee/goals' },
      { label: 'Performance Reviews', icon: HiDocumentText, path: '/employee/reviews' },
    ],
  },
  {
    groupLabel: 'COMPENSATION',
    items: [
      { label: 'Payslips', icon: HiCurrencyDollar, path: '/employee/payslips' },
      { label: 'Expense Claims', icon: HiDocumentText, path: '/employee/expenses' },
    ],
  },
  {
    groupLabel: 'COMMUNICATION',
    items: [
      { label: 'Messages', icon: HiChatBubbleLeftRight, path: '/employee/messages' },
      { label: 'Announcements', icon: HiDocumentText, path: '/employee/announcements' },
    ],
  },
  {
    groupLabel: 'SETTINGS',
    items: [
      { label: 'Account Settings', icon: HiCog6Tooth, path: '/employee/settings' },
    ],
  },
]

function titleCaseSegment(seg) {
  return seg
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'employee') return ['Home', 'Employee']
    const crumbs = ['Home', 'Employee']
    if (parts[1]) crumbs.push(titleCaseSegment(parts[1]))
    return crumbs
  }, [location.pathname])

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-background-tertiary">
      <Sidebar
        navGroups={employeeNavGroups}
        role={user?.role}
        user={user}
        onLogout={() => { logout(); navigate('/login') }}
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
                    <Link to="/employee/dashboard" className="hover:text-primary">
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
                <div className="text-xs text-text-secondary">{user?.department || 'Employee'}</div>
              </div>
            </div>
            <Button label="Log out" variant="ghost" size="sm" onClick={() => { logout(); navigate('/login') }} />
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
