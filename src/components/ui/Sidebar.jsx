import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { HiArrowRightOnRectangle, HiQuestionMarkCircle, HiUserCircle } from 'react-icons/hi2'
import { Avatar } from './Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'



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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef(null)

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Where "My Profile" points, per role.
  const profilePath = role === 'superadmin' ? '/superadmin/profile' : '/admin/account'

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!profileMenuOpen) return undefined
    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [profileMenuOpen])

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
        <div className="flex h-20 shrink-0 items-center justify-center px-3 py-2 border-b border-[#E5E7EB]">
          {logoLoading ? (
            <div className="h-12 w-32 animate-pulse rounded-md bg-slate-100" aria-hidden />
          ) : (trimmedLogo && !imgBroken) ? (
            <img
              src={trimmedLogo}
              alt="Company logo"
              className="max-h-14 max-w-full object-contain"
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

        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4">
          <div ref={profileRef} className="relative">
            {/* Dropdown — opens above the profile row since it sits at the bottom. */}
            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                <Link
                  to={profilePath}
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    onMobileClose?.()
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0F766E]"
                >
                  <HiUserCircle className="h-5 w-5 shrink-0 text-slate-400" />
                  My Profile
                </Link>
                {onLogout && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false)
                      onLogout()
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-gray-100 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#991B1B]"
                  >
                    <HiArrowRightOnRectangle className="h-5 w-5 shrink-0 text-slate-400" />
                    Log out
                  </button>
                )}
              </div>
            )}

            {/* Profile trigger */}
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-3 py-3 text-left transition-colors hover:bg-gray-200/70"
            >
              <Avatar name={user?.name ?? 'User'} src={user?.profile_image_url} size="md" bgColor={avatarPalette} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#0F766E]">{user?.name ?? 'User'}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {roleSubtitle(role)}
                </span>
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
