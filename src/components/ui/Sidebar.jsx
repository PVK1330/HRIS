import { NavLink } from 'react-router-dom'
import { HiArrowRightOnRectangle, HiGlobeAlt, HiQuestionMarkCircle } from 'react-icons/hi2'
import { Avatar } from './Avatar.jsx'
import { Button } from './Button.jsx'

function roleSubtitle(role) {
  if (role === 'superadmin') return 'SUPER ADMIN'
  if (role === 'admin') return 'ADMIN'
  return (role ?? '').toUpperCase()
}

export function Sidebar({ navGroups, role, user, onLogout, mobileOpen, onMobileClose }) {
  const avatarPalette = role === 'superadmin' ? 'bg-pink-100 text-[#C8102E]' : undefined

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
        <div className="flex shrink-0 items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004CA5]/10 text-[#004CA5]">
            <HiGlobeAlt className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-tight text-[#004CA5]">ElitePic</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#C8102E]">ADMIN PANEL</div>
          </div>
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
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    end
                    className={({ isActive }) =>
                      `mx-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#C8102E] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-gray-50 hover:text-[#004CA5]'
                      }`
                    }
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />}
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-gray-100 bg-white px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-3">
            <Avatar name={user?.name ?? 'User'} size="md" bgColor={avatarPalette} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-[#004CA5]">{user?.name ?? 'User'}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {roleSubtitle(role)}
              </div>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                icon={HiArrowRightOnRectangle}
                ariaLabel="Log out"
                onClick={onLogout}
                className="shrink-0 p-2 text-gray-500 hover:bg-white hover:text-[#C8102E]"
              />
            )}
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <HiQuestionMarkCircle className="h-4 w-4 text-gray-400" aria-hidden />
              <a href="#support" className="hover:text-[#004CA5]" onClick={(e) => e.preventDefault()}>
                Support
              </a>
            </span>
            <span className="text-gray-400">v1.0.2</span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg py-2 text-center text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#004CA5] md:hidden"
            >
              Log out
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
