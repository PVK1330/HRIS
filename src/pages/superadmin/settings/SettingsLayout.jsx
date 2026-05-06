import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { 
  HiChevronDown, 
  HiCog6Tooth, 
  HiGlobeAlt, 
  HiBuildingOffice, 
  HiEnvelope, 
  HiPhoto, 
  HiServer, 
  HiShieldCheck,
  HiCommandLine,
  HiTicket,
  HiLanguage,
  HiCircleStack,
  HiQueueList,
  HiDocumentText,
  HiCreditCard,
  HiArrowPath
} from 'react-icons/hi2'

const TOP_ITEMS = [
  { label: 'General Settings', to: '/superadmin/settings/general', icon: HiCog6Tooth },
  { label: 'Domain Settings', to: '/superadmin/settings/domain', icon: HiGlobeAlt },
  { label: 'Account Settings', to: '/superadmin/settings/account-settings', icon: HiShieldCheck },
  { label: 'Company Details', to: '/superadmin/settings/company', icon: HiBuildingOffice },
]

const EMAIL_CHILDREN = [
  { label: 'Email Templates', to: '/superadmin/settings/email/templates', icon: HiDocumentText },
  { label: 'Email Settings',  to: '/superadmin/settings/email/settings', icon: HiCog6Tooth },
  { label: 'Email Log',       to: '/superadmin/settings/email/log', icon: HiQueueList },
  { label: 'SMTP Settings',   to: '/superadmin/settings/email/settings?tab=smtp', icon: HiServer },
]

const BOTTOM_ITEMS = [
  { label: 'Currency', to: '/superadmin/settings/currency', icon: HiCreditCard },
  { label: 'Logo', to: '/superadmin/settings/logo', icon: HiPhoto },
  { label: 'Free Trial', to: '/superadmin/settings/free-trial', icon: HiTicket },
  { label: 'Payment Gateways', to: '/superadmin/settings/payments', icon: HiCreditCard },
  { label: 'System', to: '/superadmin/settings/system', icon: HiCircleStack },
  { label: 'reCAPTCHA', to: '/superadmin/settings/recaptcha', icon: HiShieldCheck },
]

const ACTIVE_CLS = 'bg-slate-900 text-white shadow-lg shadow-slate-200'
const INACTIVE_CLS = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
const DISABLED_CLS = 'cursor-not-allowed text-slate-300 opacity-60'

function NavItem({ item }) {
  const Icon = item.icon || HiCircleStack
  
  if (item.disabled) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 text-sm font-bold ${DISABLED_CLS}`}>
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={false}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isActive ? ACTIVE_CLS : INACTIVE_CLS
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="px-3.5 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </div>
  )
}

function EmailParent() {
  const location = useLocation()
  const isInsideEmail = location.pathname.startsWith('/superadmin/settings/email')
  const [open, setOpen] = useState(isInsideEmail)

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isInsideEmail ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
        }`}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <HiEnvelope className="h-5 w-5" />
          <span>Email Architecture</span>
        </div>
        <HiChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
          {EMAIL_CHILDREN.map((child) => (
            <ChildNavItem key={child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  )
}

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
      className={`block px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
        isActive
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {item.label}
    </NavLink>
  )
}

export default function SettingsLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] gap-6 items-start px-4 md:px-0">
      {/* Side Navigation */}
      <aside className="w-full md:w-[240px] shrink-0 md:sticky md:top-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <nav className="space-y-1">
            {TOP_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}

            <SectionLabel>Infrastructure</SectionLabel>
            <EmailParent />

            <SectionLabel>Global Config</SectionLabel>
            <div className="space-y-1">
              {BOTTOM_ITEMS.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="min-w-0 flex-1 w-full">
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
