import { useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import useSettingsMeta from './useSettingsMeta.js'

const FALLBACK_SECTIONS = [
  { key: 'general', label: 'General', items: [{ label: 'General Settings', to: '/superadmin/settings/general' }] },
]

function SectionLabel({ children }) {
  return (
    <div className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 first:pt-2">
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
        isActive
          ? 'bg-[#0F766E] text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`text-xs font-bold transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>»</span>
      <span>{item.label}</span>
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
      <aside className="w-full md:w-[220px] shrink-0 md:sticky md:top-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <nav className="py-2">
            {loading && (
              <div className="space-y-1.5 p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            )}
            {!loading && sections.map((section, si) => (
              <div key={section.key || section.label} className={si > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                <SectionLabel>{section.label}</SectionLabel>
                <div className="px-2 space-y-0.5">
                  {(section.items || []).map((item) => (
                    <ChildNavItem key={`${section.key}-${item.label}`} item={item} />
                  ))}
                </div>
              </div>
            ))}
            {!!error && (
              <p className="px-3 py-2 text-xs text-red-500">{error}</p>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="min-w-0 flex-1 w-full">
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
