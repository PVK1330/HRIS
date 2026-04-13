import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
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
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return []

    return pathSegments.map(titleCaseSegment)
  }, [location])

  return (
    <div className="flex min-h-screen bg-background-tertiary">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        navGroups={employeeNavGroups}
        logoText="HRMatrix"
        logoBadge="Employee"
      />

      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-[50px] items-center justify-between border-b border-border-tertiary bg-background-primary px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-2 hover:bg-background-secondary"
            >
              <HiBars3 className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-medium text-text-primary">
              {breadcrumbs[breadcrumbs.length - 1] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-md p-2 hover:bg-background-secondary">
              <HiBell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-DEFAULT" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">
                  {user?.name || 'John Doe'}
                </div>
                <div className="text-xs text-text-secondary">
                  {user?.department || 'Engineering'}
                </div>
              </div>
              <Avatar name={user?.name || 'John Doe'} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
