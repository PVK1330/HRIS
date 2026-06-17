import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  RiSettings3Line,
  RiBuildingLine,
  RiImageLine,
  RiGlobalLine,
  RiMoneyDollarCircleLine,
  RiTimerLine,
  RiBankCardLine,
  RiMailSettingsLine,
  RiMailLine,
  RiHistoryLine,
  RiShieldKeyholeLine,
  RiRefreshLine,
  RiServerLine,
} from 'react-icons/ri'

const SA_TABS = [
  { to: 'general',          label: 'General',       icon: RiSettings3Line,         group: 'Platform' },
  { to: 'company',          label: 'Company',        icon: RiBuildingLine,           group: 'Platform' },
  { to: 'logo',             label: 'Logo & Brand',   icon: RiImageLine,              group: 'Platform' },
  { to: 'domain',           label: 'Domain',         icon: RiGlobalLine,             group: 'Platform' },
  { to: 'currency',         label: 'Currency',       icon: RiMoneyDollarCircleLine,  group: 'Platform' },
  { to: 'free-trial',       label: 'Free Trial',     icon: RiTimerLine,              group: 'Platform' },
  { to: 'payments',         label: 'Payments',       icon: RiBankCardLine,           group: 'Platform' },
  { to: 'email/settings',   label: 'Email SMTP',     icon: RiMailSettingsLine,       group: 'Email' },
  { to: 'email/templates',  label: 'Templates',      icon: RiMailLine,               group: 'Email' },
  { to: 'email/log',        label: 'Email Log',      icon: RiHistoryLine,            group: 'Email' },
  { to: 'account-settings', label: 'Account',        icon: RiShieldKeyholeLine,      group: 'Security' },
  { to: 'recaptcha',        label: 'reCAPTCHA',      icon: RiRefreshLine,            group: 'Security' },
  { to: 'system',           label: 'System Info',    icon: RiServerLine,             group: 'System' },
]

export default function SettingsLayout() {
  const location = useLocation()

  const activeTab = SA_TABS.find((t) => {
    const abs = `/superadmin/settings/${t.to}`
    return location.pathname === abs || location.pathname.startsWith(abs + '/')
  })

  return (
    <div className="min-w-0 animate-in fade-in duration-500 space-y-6 pb-12">
      {/* Page header */}
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Platform Settings
        </h1>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span>Superadmin</span>
          <span className="text-slate-400">&gt;</span>
          <span className="uppercase tracking-wider text-slate-600">
            {activeTab?.label ?? 'Settings'}
          </span>
        </div>
      </div>

      {/* Tab strip + content panel */}
      <div className="min-w-0 rounded-none border border-slate-200 bg-white shadow-sm">
        {/* Horizontal tab bar */}
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            {SA_TABS.map((tab) => {
              const Icon = tab.icon
              const abs = `/superadmin/settings/${tab.to}`
              const isActive =
                location.pathname === abs ||
                location.pathname.startsWith(abs + '/')
              return (
                <NavLink
                  key={tab.to}
                  to={abs}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span>{tab.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Section heading + outlet */}
        <div className="min-w-0 p-4 sm:p-6">
          {activeTab && (
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{activeTab.label}</h2>
              </div>
              <div className="w-max rounded-none border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {activeTab.group}
              </div>
            </div>
          )}

          <main className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
