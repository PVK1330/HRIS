import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { HiArrowRightOnRectangle, HiQuestionMarkCircle } from 'react-icons/hi2'
import { Avatar } from './Avatar.jsx'
import { Button } from './Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'



function roleSubtitle(role) {
  if (role === 'superadmin') return 'SUPER ADMIN'
  if (role === 'admin') return 'ADMIN'
  if (role === 'hr') return 'HR ADMIN'
  if (role === 'employee') return 'EMPLOYEE'
  return (role ?? '').replace(/_/g, ' ').toUpperCase()
}

function panelName(role) {
  if (role === 'superadmin' || role === 'superadmin') return 'SUPER ADMIN'
  if (role === 'admin') return 'ADMIN PANEL'
  if (role === 'hr') return 'HR PANEL'
  if (role === 'employee') return 'EMPLOYEE PORTAL'
  return ''
}

export function Sidebar({
  navGroups,
  role,
  user,
  onLogout,
  mobileOpen,
  onMobileClose,
  logoUrl,
  logoLoading = false,
  logoFallbackLabel,
}) {
  const location = useLocation()
  const avatarPalette = role === 'superadmin' ? 'bg-purple-100 text-[#6D28D9]' : undefined
  const { hasModule } = useAuth()

  const resolvedLabel = logoFallbackLabel ?? 'HRIS'
  const trimmedLogo = logoUrl && String(logoUrl).trim()

  const [imgBroken, setImgBroken] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const navigate = useNavigate()

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex min-h-[4rem] shrink-0 items-center justify-center px-3 py-[5px] border-b border-slate-50">
          {logoLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-md bg-slate-100" aria-hidden />
          ) : (trimmedLogo && !imgBroken) ? (
            <img
              src={trimmedLogo}
              alt="Company logo"
              className="h-16 max-w-full object-contain"
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span className="truncate text-center text-lg font-bold leading-tight tracking-tight text-[#0F766E]">
              {resolvedLabel}
            </span>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) =>
                item.key == null ||
                item.key === 'dashboard' ||
                hasModule(item.key),
            )
            if (visibleItems.length === 0) return null
            return (
              <div key={group.groupLabel}>
                <div className="mt-4 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 first:mt-0">
                  {group.groupLabel}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const itemKey = item.path ?? item.key
                  const hasChildren = item.children && item.children.length > 0
                  const isExpanded = expandedMenus[itemKey]

                  const isActive = item.path
                    ? (location.pathname === item.path.split('#')[0] ||
                      location.pathname.startsWith(item.path.split('#')[0]))
                    : false

                  return (
                    <div key={itemKey} className="relative mb-0.5">
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleMenu(itemKey)}
                            className={`w-full mx-0 flex items-center justify-between rounded-none px-4 py-2.5 text-sm font-bold transition-all ${isExpanded ? 'bg-slate-50 text-[#0F766E]' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {Icon && <Icon className={`h-5 w-5 shrink-0 ${isExpanded ? 'text-[#0F766E]' : 'text-slate-400'}`} />}
                              <span>{item.label}</span>
                            </div>
                            <svg
                              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="mt-1 space-y-0.5 border-l-2 border-slate-100 ml-6 pl-2">
                              {item.children.map((child) => (
                                <NavLink
                                  key={child.path}
                                  to={child.path}
                                  onClick={onMobileClose}
                                  className={({ isActive }) =>
                                    `flex items-center px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${isActive
                                      ? 'text-[#0F766E]'
                                      : 'text-slate-400 hover:text-slate-600'
                                    }`
                                  }
                                >
                                  {child.label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <NavLink
                          to={item.path}
                          onClick={onMobileClose}
                          end
                          className={({ isActive: isNavLinkActive }) => {
                            const active = isActive || isNavLinkActive
                            return `flex items-center gap-3 rounded-none px-4 py-2.5 text-sm font-bold transition-all ${active
                              ? 'bg-[#0F766E] text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F766E]'
                              }`
                          }}
                        >
                          {({ isActive: isNavLinkActive }) => {
                            const active = isActive || isNavLinkActive
                            return (
                              <>
                                {Icon && (
                                  <Icon
                                    className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-[#0F766E]'}`}
                                    aria-hidden
                                  />
                                )}
                                <span>{item.label}</span>
                              </>
                            )
                          }}
                        </NavLink>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-gray-100 bg-white px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-3">
            <Avatar name={user?.name ?? 'User'} size="md" bgColor={avatarPalette} />
            <Link
              to={role === 'superadmin' || role === 'superadmin' ? '/superadmin/profile' : '/admin/employee-profile'}
              className="min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="truncate text-sm font-bold text-[#0F766E]">{user?.name ?? 'User'}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {roleSubtitle(role)}
              </div>
            </Link>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                icon={HiArrowRightOnRectangle}
                ariaLabel="Log out"
                onClick={onLogout}
                className="shrink-0 p-2 text-gray-500 hover:bg-white hover:text-[#991B1B]"
              />
            )}
          </div>


          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg py-2 text-center text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#0F766E] md:hidden"
            >
              Log out
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
