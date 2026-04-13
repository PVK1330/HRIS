import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { HiBars3, HiBell, HiHome, HiUsers, HiCalendar, HiClock, HiDocumentText, HiCurrencyDollar, HiChartBar, HiCog6Tooth, HiUserGroup, HiChatBubbleLeftRight } from 'react-icons/hi2'
import { Sidebar } from '../components/ui/Sidebar.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const hrNavGroups = [
  {
    groupLabel: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: HiHome, path: '/hr/dashboard' },
      { label: 'My Team', icon: HiUsers, path: '/hr/team' },
    ],
  },
  {
    groupLabel: 'APPROVALS',
    items: [
      { label: 'Leave Requests', icon: HiCalendar, path: '/hr/leave-approvals' },
      { label: 'Attendance', icon: HiClock, path: '/hr/attendance' },
      { label: 'Expense Claims', icon: HiCurrencyDollar, path: '/hr/expenses' },
    ],
  },
  {
    groupLabel: 'HR TOOLS',
    items: [
      { label: 'Performance', icon: HiChartBar, path: '/hr/performance' },
      { label: 'Letters & Documents', icon: HiDocumentText, path: '/hr/letters' },
      { label: 'Reports', icon: HiDocumentText, path: '/hr/reports' },
    ],
  },
  {
    groupLabel: 'EMPLOYEE MANAGEMENT',
    items: [
      { label: 'Employee Directory', icon: HiUserGroup, path: '/hr/employees' },
      { label: 'Onboarding', icon: HiDocumentText, path: '/hr/onboarding' },
      { label: 'Exit Management', icon: HiDocumentText, path: '/hr/exit' },
    ],
  },
  {
    groupLabel: 'COMMUNICATION',
    items: [
      { label: 'Announcements', icon: HiChatBubbleLeftRight, path: '/hr/announcements' },
      { label: 'Messages', icon: HiChatBubbleLeftRight, path: '/hr/messages' },
    ],
  },
  {
    groupLabel: 'SETTINGS',
    items: [
      { label: 'HR Settings', icon: HiCog6Tooth, path: '/hr/settings' },
    ],
  },
]

function titleCaseSegment(seg) {
  return seg
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function HRLayout() {
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
        navGroups={hrNavGroups}
        logoText="HRMatrix"
        logoBadge="HR Manager"
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
                  {user?.name || 'Neha Jain'}
                </div>
                <div className="text-xs text-text-secondary">
                  {user?.department || 'Sales & Marketing'}
                </div>
              </div>
              <Avatar name={user?.name || 'Neha Jain'} />
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
