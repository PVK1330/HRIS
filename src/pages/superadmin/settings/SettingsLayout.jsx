import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { HiChevronDown } from 'react-icons/hi2'

const TOP_ITEMS = [
  { label: 'General Settings', to: '/superadmin/settings/general' },
  { label: 'Domain Settings', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Account Settings', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Company Details', to: '/superadmin/settings/company' },
]

const EMAIL_CHILDREN = [
  { label: 'Email Templates', to: '/superadmin/settings/email/templates' },
  { label: 'Email Settings',  to: '/superadmin/settings/email/settings' },
  { label: 'Email Log',       to: '/superadmin/settings/email/log' },
  { label: 'SMTP Settings',   to: '/superadmin/settings/email/settings?tab=smtp' },
]

const BOTTOM_ITEMS = [
  { label: 'Currency', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Logo', to: '/superadmin/settings/logo' },
  { label: 'Cron Job', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Free Trial', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Payment Gateways', disabled: true, tooltip: 'Coming Soon' },
  { label: 'System', to: '/superadmin/settings/system' },
  { label: 'reCAPTCHA', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Updates', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Debugging', disabled: true, tooltip: 'Coming Soon' },
]

const ACTIVE_CLS =
  'border-l-4 border-red-500 bg-red-50 font-medium text-red-600'
const DISABLED_CLS =
  'cursor-not-allowed pl-4 text-gray-400 opacity-60'
const HOVER_CLS = 'pl-4 text-gray-700 hover:bg-gray-50'

function NavItem({ item }) {
  if (item.disabled) {
    return (
      <span
        title={item.tooltip || 'Coming Soon'}
        className={`block py-2 pr-3 text-sm ${DISABLED_CLS}`}
      >
        {item.label}
      </span>
    )
  }
  return (
    <NavLink
      to={item.to}
      end={false}
      className={({ isActive }) =>
        `block py-2 pr-3 text-sm ${isActive ? ACTIVE_CLS + ' pl-3' : HOVER_CLS}`
      }
    >
      {item.label}
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </div>
  )
}

function EmailParent() {
  const location = useLocation()
  const isInsideEmail = location.pathname.startsWith('/superadmin/settings/email')
  const [open, setOpen] = useState(isInsideEmail)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between py-2 pl-4 pr-3 text-sm ${
          isInsideEmail ? 'font-medium text-red-600' : 'text-gray-700 hover:bg-gray-50'
        }`}
        aria-expanded={open}
      >
        <span>Email</span>
        <HiChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="ml-3 border-l border-gray-100">
          {EMAIL_CHILDREN.map((child) => (
            <ChildNavItem key={child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Email children may carry a query string (e.g. `?tab=smtp`) — NavLink's
 * isActive doesn't compare search params, so we compute active state manually
 * from `to` so that highlighting works correctly for the SMTP child.
 */
function ChildNavItem({ item }) {
  const location = useLocation()
  const [pathOnly, search] = item.to.split('?')
  const params = new URLSearchParams(search || '')
  const tab = params.get('tab')
  const currentTab = new URLSearchParams(location.search).get('tab')

  const isActive =
    location.pathname === pathOnly &&
    ((tab && currentTab === tab) || (!tab && !currentTab))

  return (
    <NavLink
      to={item.to}
      className={`block py-1.5 pr-3 text-[13px] ${
        isActive
          ? 'border-l-2 border-red-500 bg-red-50 pl-3 font-medium text-red-600'
          : 'pl-4 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {item.label}
    </NavLink>
  )
}

export default function SettingsLayout() {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] gap-4">
      <aside className="hidden w-[220px] shrink-0 self-start overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:block">
        <nav className="py-2">
          {TOP_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}

          <SectionLabel>Email</SectionLabel>
          <EmailParent />

          <div className="pt-2">
            {BOTTOM_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
