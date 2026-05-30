import { useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import useSettingsMeta from './useSettingsMeta.js'

const FALLBACK_SECTIONS = [
  { key: 'general', label: 'General', items: [{ label: 'General Settings', to: '/superadmin/settings/general' }] },
]

const ACTIVE_CLS = 'bg-slate-900 text-white shadow-lg shadow-slate-200'
const INACTIVE_CLS = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
const DISABLED_CLS = 'cursor-not-allowed text-slate-300 opacity-60'

function SectionLabel({ children }) {
  return (
    <div className="px-3.5 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {children}
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
  const { meta, loading, error } = useSettingsMeta()
  const sections = useMemo(
    () => meta?.navigation?.sections || FALLBACK_SECTIONS,
    [meta]
  )

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] gap-6 items-start px-4 md:px-0">
      {/* Side Navigation */}
      <aside className="w-full md:w-[240px] shrink-0 md:sticky md:top-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <nav className="space-y-1">
            {loading && (
              <div className="space-y-2 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            )}
            {!loading && sections.map((section) => (
              <div key={section.key || section.label}>
                <SectionLabel>{section.label}</SectionLabel>
                <div className="space-y-1">
                  {(section.items || []).map((item) => (
                    <ChildNavItem key={`${section.key}-${item.label}`} item={item} />
                  ))}
                </div>
              </div>
            ))}
            {!!error && (
              <p className="px-3.5 py-2 text-xs text-red-500">{error}</p>
            )}
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
