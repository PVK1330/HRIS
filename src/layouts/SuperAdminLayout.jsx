import { useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
} from "react-icons/hi2";
import { Sidebar } from "../components/ui/Sidebar.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const superNavGroups = [
  {
    groupLabel: 'PLATFORM',
    items: [
      { 
        label: 'Dashboard', 
        icon: HiHome, 
        path: '/superadmin/dashboard', 
        roles: ['super_admin', 'support_admin', 'billing_admin'],
        why: 'Real-time overview of your platform performance and system health.'
      },
      { 
        label: 'Organizations', 
        icon: HiDocumentText, 
        path: '/superadmin/tenants', 
        roles: ['super_admin', 'support_admin', 'billing_admin'],
        why: 'Manage all companies using the platform and their individual settings.'
      },
      { 
        label: 'Pricing Plans', 
        icon: HiCurrencyDollar, 
        path: '/superadmin/subscriptions', 
        roles: ['super_admin', 'billing_admin'],
        why: 'Create and manage your subscription tiers and feature limits.'
      },
      { 
        label: 'Billing', 
        icon: HiCurrencyDollar, 
        path: '/superadmin/billing', 
        roles: ['super_admin', 'billing_admin'],
        why: 'Track all payments, invoices, and revenue from organizations.'
      },
    ],
  },
  {
    groupLabel: 'TEAM & SECURITY',
    items: [
      { 
        label: 'Admin Users', 
        icon: HiUserCircle, 
        path: '/superadmin/admin-users', 
        roles: ['super_admin'],
        why: 'Manage your internal staff who have access to this superadmin panel.'
      },
      { 
        label: 'Permissions', 
        icon: HiLockClosed, 
        path: '/superadmin/permissions', 
        roles: ['super_admin'],
        why: 'Define what each admin user can see and do on the platform.'
      },
      { 
        label: 'Modules', 
        icon: HiSquares2X2, 
        path: '/superadmin/modules', 
        roles: ['super_admin'],
        why: 'Enable or disable specific HR features like Payroll or Attendance globally.'
      },
      { 
        label: 'Announcements', 
        icon: HiDocumentText, 
        path: '/superadmin/announcements', 
        roles: ['super_admin'],
        why: 'Send important updates and maintenance news to all organizations.'
      },
    ],
  },
  {
    groupLabel: 'SYSTEM',
    items: [
      { 
        label: 'Audit Logs', 
        icon: HiShieldCheck, 
        path: '/superadmin/audit', 
        roles: ['super_admin', 'support_admin'],
        why: 'View a detailed history of every action taken by administrators.'
      },
      { 
        label: 'Support', 
        icon: HiExclamationTriangle, 
        path: '/superadmin/support', 
        roles: ['super_admin', 'support_admin'],
        why: 'Manage and resolve help requests from organization admins.'
      },
      { 
        label: 'Settings', 
        icon: HiCog6Tooth, 
        path: '/superadmin/settings', 
        roles: ['super_admin'],
        why: 'Manage global platform settings like emails and security.'
      },
    ],
  },
]

function titleCaseSegment(seg) {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ROLE_DISPLAY = {
  super_admin: 'Super Admin',
  support_admin: 'Support Admin',
  billing_admin: 'Billing Admin',
}

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const filteredNavGroups = useMemo(() => {
    return superNavGroups.map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(user?.role))
    })).filter(group => group.items.length > 0)
  }, [user])

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'superadmin') return ['Home', 'Super Admin']
    const crumbs = ['Home', 'Super Admin']
    if (parts[1]) crumbs.push(titleCaseSegment(parts[1]))
    return crumbs
  }, [location.pathname])

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-background-tertiary">
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
                    <Link to="/superadmin/dashboard" className="hover:text-primary">
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
            <Link to="/superadmin/profile" className="hidden items-center gap-2 sm:flex group">
              <Avatar name={user?.name} size="sm" className="group-hover:ring-2 group-hover:ring-indigo-600 transition-all" />
              <div className="min-w-0 text-right">
                <div className="truncate text-sm font-semibold text-text-primary group-hover:text-indigo-600 transition-colors">{user?.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary opacity-60">
                  {ROLE_DISPLAY[user?.role] || 'Super Admin'}
                </div>
              </div>
            </Link>
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
  );
}
