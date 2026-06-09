import {
  Bell,
  CalendarDays,
  Maximize2,
  Search,
  Settings,
  UserCircle2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardHeader({
  title,
  subtitle,
  onDateChange,
  dateRange = 'Last 30 days',
  notificationCount = 0,
}) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 rounded-xl border border-slate-200 bg-white/95 px-4 py-6 sm:px-6 sm:py-8 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-10 min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, employees..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              aria-label="Notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white animate-pulse">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              aria-label="Settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <CalendarDays className="h-4 w-4 text-[#0F766E]" />
            <select
              value={dateRange}
              onChange={(event) => onDateChange?.(event.target.value)}
              className="bg-transparent pr-4 outline-none"
            >
              <option>Today</option>
              <option>This week</option>
              <option>Last 30 days</option>
              <option>This quarter</option>
            </select>
          </label>

          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50">
            <UserCircle2 className="h-4 w-4 text-[#0F766E]" />
            Admin
          </button>
        </div>
      </div>
    </header>
  )
}
