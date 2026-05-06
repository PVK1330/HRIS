import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { HiArrowRightOnRectangle, HiGlobeAlt, HiQuestionMarkCircle } from 'react-icons/hi2'
import { Avatar } from './Avatar.jsx'
import { Button } from './Button.jsx'

const FALLBACK_LOGO = '/HRIS_Logo.png'

function roleSubtitle(role) {
  if (role === 'superadmin') return 'SUPER ADMIN'
  if (role === 'admin') return 'ADMIN'
  if (role === 'hr') return 'HR ADMIN'
  if (role === 'employee') return 'EMPLOYEE'
  return (role ?? '').toUpperCase()
}

function panelName(role) {
  if (role === 'superadmin' || role === 'superadmin') return 'SUPER ADMIN'
  if (role === 'admin') return 'ADMIN PANEL'
  if (role === 'hr') return 'HR PANEL'
  if (role === 'employee') return 'EMPLOYEE PORTAL'
  return ''
}

export function Sidebar({ navGroups, role, user, onLogout, mobileOpen, onMobileClose, logoUrl }) {
  const avatarPalette = role === 'superadmin' ? 'bg-purple-100 text-[#6D28D9]' : undefined

  const initialSrc = logoUrl && logoUrl.trim() ? logoUrl : FALLBACK_LOGO
  const [imgSrc, setImgSrc] = useState(initialSrc)

  useEffect(() => {
    setImgSrc(logoUrl && logoUrl.trim() ? logoUrl : FALLBACK_LOGO)
  }, [logoUrl])

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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex shrink-0 items-center justify-center p-[5px] border-b border-slate-50">
          <img
            src={imgSrc}
            alt="HRIS Logo"
            className="h-16 w-auto object-contain"
            onError={() => {
              if (imgSrc !== FALLBACK_LOGO) setImgSrc(FALLBACK_LOGO)
            }}
          />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {navGroups.map((group) => (
            <div key={group.groupLabel}>
              <div className="mt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 first:mt-0">
                {group.groupLabel}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.path} className="relative group">
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      end
                      className={({ isActive }) =>
                        `mx-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#0F766E] text-white shadow-sm'
                            : 'text-slate-700 hover:bg-gray-50 hover:text-[#0F766E]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {Icon && (
                            <Icon 
                              className={`h-5 w-5 shrink-0 transition-opacity ${
                                isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                              }`} 
                              aria-hidden 
                            />
                          )}
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-gray-100 bg-white px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-3">
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

          <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <HiQuestionMarkCircle className="h-4 w-4 text-gray-400" aria-hidden />
              <a href="#support" className="hover:text-[#0F766E]" onClick={(e) => e.preventDefault()}>
                Support
              </a>
            </span>
            <span className="text-gray-400">v1.0.2</span>
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
