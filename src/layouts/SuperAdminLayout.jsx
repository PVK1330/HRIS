import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  HiBars3,
  HiBell,
  HiCog6Tooth,
  HiCurrencyDollar,
  HiDocumentText,
  HiExclamationTriangle,
  HiGlobeAlt,
  HiHome,
  HiLockClosed,
  HiServer,
  HiShieldCheck,
  HiSquares2X2,
  HiUserCircle,
  HiUsers,
} from 'react-icons/hi2'
import { Sidebar } from '../components/ui/Sidebar.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const superNavGroups = [
  {
    groupLabel: 'PLATFORM OVERVIEW',
    items: [
      { label: 'Dashboard', icon: HiHome, path: '/superadmin/dashboard' },
      { label: 'Tenant Management', icon: HiDocumentText, path: '/superadmin/tenants' },
      { label: 'Domains & SSL', icon: HiGlobeAlt, path: '/superadmin/domains' },
      { label: 'Subscription Plans', icon: HiCurrencyDollar, path: '/superadmin/subscriptions' },
      { label: 'Billing & Revenue', icon: HiCurrencyDollar, path: '/superadmin/billing' },
    ],
  },
  {
    groupLabel: 'USER MANAGEMENT',
    items: [
      { label: 'Admin Users', icon: HiUserCircle, path: '/superadmin/admin-users' },
      { label: 'Role Permissions', icon: HiLockClosed, path: '/superadmin/permissions' },
      { label: 'Module Configuration', icon: HiSquares2X2, path: '/superadmin/modules' },
      { label: 'System Announcements', icon: HiDocumentText, path: '/superadmin/announcements' },
    ],
  },
  {
    groupLabel: 'SYSTEM ADMINISTRATION',
    items: [
      { label: 'Audit Logs', icon: HiShieldCheck, path: '/superadmin/audit' },
      { label: 'Support Tickets', icon: HiExclamationTriangle, path: '/superadmin/support' },
      { label: 'Platform Configuration', icon: HiCog6Tooth, path: '/superadmin/settings' },
    ],
  },
]

function titleCaseSegment(seg) {
  return seg
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    const crumbs = ['Home', 'Super Admin']
    if (parts[1]) crumbs.push(titleCaseSegment(parts[1]))
    return crumbs
  }, [location.pathname])

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        navGroups={superNavGroups}
        logoText="HRIS"
        logoBadge="Super Admin"
        mobileOpen={false}
        onMobileClose={() => {}}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-64">
        <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:h-16 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <HiBars3 className="h-6 w-6" />
            </button>
            <nav className="hidden min-w-0 max-w-[50vw] truncate text-sm text-gray-600 sm:flex sm:items-center sm:gap-2 md:max-w-none">
              {breadcrumb.map((c, i) => (
                <span key={`${c}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-300">/</span>}
                  {i === 0 ? (
                    <Link to="/superadmin/dashboard" className="hover:text-[#004CA5]">
                      {c}
                    </Link>
                  ) : (
                    <span className={i === breadcrumb.length - 1 ? 'font-semibold text-gray-900' : ''}>
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
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <HiBell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C8102E]" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user?.name} size="sm" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
            </div>
            <Button label="Log out" variant="ghost" size="sm" onClick={logout} />
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto min-w-0 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
