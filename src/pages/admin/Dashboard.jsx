import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiUsers,
  HiClock,
  HiCalendar,
  HiDocument,
  HiCreditCard,
  HiClipboardDocumentCheck,
  HiChartBar,
  HiBuildingOffice,
  HiBriefcase,
  HiMegaphone,
  HiSparkles,
  HiBellAlert,
  HiGift,
  HiArrowRightOnRectangle,
  HiChartPie
} from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminDashboardService } from '../../services/adminDashboardService'
import { dashboardStats, dashboardAlerts } from '../../data/mockData.js'
import toast from 'react-hot-toast'

const dotClass = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

const alertTone = {
  red: 'border-rose-100 bg-rose-50 text-rose-800',
  blue: 'border-blue-100 bg-blue-50 text-blue-800',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-800',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  useEffect(() => {
    // loadDashboardData() // Disabled for now to show mock data
    setIsLoading(false)
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await adminDashboardService.getDashboardData()
      setDashboardData(response.data.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to synchronize dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = dashboardData?.stats || {
    employees: {
      total: dashboardStats.totalEmployees,
      active: dashboardStats.activeEmployees,
      probation: dashboardStats.onProbation,
      notice: dashboardStats.inNotice
    },
    attendance: {
      present: dashboardStats.todayInOffice,
      remote: dashboardStats.todayRemote,
      absent: dashboardStats.todayAbsent
    },
    pending: {
      leaves: dashboardStats.pendingLeaves,
      documents: dashboardStats.pendingDocuments,
      expenses: dashboardStats.pendingExpenses
    }
  }

  const alerts = dashboardData?.alerts || dashboardAlerts
  const birthdays = dashboardData?.birthdays || [
    { name: 'Sarah Ahmed', type: 'Birthday', icon: '🎂' },
    { name: 'Omar Hassan', type: 'Work Anniversary', icon: '🎉' },
    { name: 'Emily Clarke', type: 'Birthday', icon: '🎈' },
    { name: 'Raj Malhotra', type: 'Birthday', icon: '🍰' },
  ]
  const announcements = dashboardData?.announcements || [
    { id: 1, title: 'Annual General Meeting 2026', content: 'The annual general meeting for all shareholders and employees will be held in the main auditorium.', priority: 'High', created_at: new Date().toISOString() },
    { id: 2, title: 'New Health Insurance Policy', content: 'We have updated our health insurance provider to ensure better coverage for all employees.', priority: 'Standard', created_at: new Date().toISOString() },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Synchronizing organization intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10 animate-slide-up">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <HiSparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Executive Overview</span>
          </div>
          <h1 className="font-display text-4xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name?.split(' ')[0] ?? 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Current status of <span className="font-semibold text-slate-700">{user?.tenantName}</span> as of today.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-200 p-2 shadow-sm">
          <div className="px-4 py-1.5 text-sm font-bold text-slate-700">
            {todayLabel}
          </div>
          <Button
            ariaLabel="Refresh Data"
            variant="primary"
            size="sm"
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Headcount"
          value={stats.employees.total}
          subtitle="Organization-wide"
          color="emerald"
          icon={HiUsers}
        />
        <StatCard
          title="Active Talent"
          value={stats.employees.active}
          subtitle="Currently operational"
          color="slate"
          icon={HiBriefcase}
        />
        <StatCard
          title="In Probation"
          value={stats.employees.probation}
          subtitle="Evaluation window"
          color="amber"
          icon={HiClock}
        />
        <StatCard
          title="Notice Period"
          value={stats.employees.notice}
          subtitle="Awaiting offboarding"
          color="rose"
          icon={HiArrowRightOnRectangle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work Status Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-black text-slate-900">Real-time Presence</h2>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-5 transition-all hover:bg-emerald-50 group border border-transparent hover:border-emerald-100">
              <div className="flex items-center gap-4">
                <div className={`h-4 w-4 rounded-full ${dotClass.emerald} shadow-[0_0_12px_rgba(16,185,129,0.6)]`} />
                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">On-site Talent</span>
              </div>
              <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-900">{stats.attendance.present}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-5 transition-all hover:bg-blue-50 group border border-transparent hover:border-blue-100">
              <div className="flex items-center gap-4">
                <div className={`h-4 w-4 rounded-full ${dotClass.blue} shadow-[0_0_12px_rgba(59,130,246,0.6)]`} />
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700 transition-colors uppercase tracking-tight">Remote Workforce</span>
              </div>
              <span className="text-2xl font-black text-slate-900 group-hover:text-blue-900">{stats.attendance.remote}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-5 transition-all hover:bg-rose-50 group border border-transparent hover:border-rose-100">
              <div className="flex items-center gap-4">
                <div className={`h-4 w-4 rounded-full ${dotClass.rose} shadow-[0_0_12px_rgba(244,63,94,0.6)]`} />
                <span className="text-sm font-bold text-slate-600 group-hover:text-rose-700 transition-colors uppercase tracking-tight">Current Absentees</span>
              </div>
              <span className="text-2xl font-black text-slate-900 group-hover:text-rose-900">{stats.attendance.absent}</span>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-black text-slate-900">Action Center</h2>
            <HiBellAlert className="h-6 w-6 text-amber-500" />
          </div>
          <div className="space-y-4">
            {[
              { to: '/admin/leave', icon: HiCalendar, label: 'Leave Requests', count: stats.pending.leaves, color: 'emerald' },
              { to: '/admin/documents', icon: HiDocument, label: 'Policy Documents', count: stats.pending.documents, color: 'blue' },
              { to: '/admin/expenses', icon: HiCreditCard, label: 'Expense Claims', count: stats.pending.expenses, color: 'amber' },
            ].map((item) => (
              <Link key={item.label} to={item.to} className="flex items-center justify-between rounded-lg border border-slate-100 p-5 transition-all hover:border-slate-200 hover:bg-slate-50 group">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg bg-${item.color}-50 p-3 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 uppercase tracking-tight">{item.label}</span>
                </div>
                <div className={`flex h-8 min-w-8 items-center justify-center rounded-full bg-${item.count > 0 ? item.color : 'slate'}-100 px-3 text-xs font-black text-${item.count > 0 ? item.color : 'slate'}-700`}>
                  {item.count}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Talent Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-black text-slate-900">Talent Distribution</h2>
            <HiChartPie className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-6">
            {[
              { name: 'Engineering', count: 12, percent: 45, color: 'emerald' },
              { name: 'Sales & Marketing', count: 8, percent: 30, color: 'blue' },
              { name: 'Operations', count: 4, percent: 15, color: 'amber' },
              { name: 'Human Resources', count: 3, percent: 10, color: 'rose' },
            ].map((dept) => (
              <div key={dept.name} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700 uppercase tracking-tighter">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{dept.percent}%</span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${dept.color}-500 transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                    style={{ width: `${dept.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Alerts */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5">
          <h2 className="font-display text-xl font-black text-slate-900 mb-8">Platform Broadcasts</h2>
          <div className="space-y-4">
            {announcements.map((ann) => (
              <button
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="w-full text-left rounded-lg bg-slate-50 p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-200 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Badge label={ann.priority} color={ann.priority === 'High' ? 'red' : 'emerald'} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-lg">{ann.title}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-1 font-medium">{ann.content}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Celebrations */}
      <div className="rounded-lg border border-slate-200 bg-white p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5">
        <div className="flex items-center gap-4 mb-10">
          <div className="rounded-lg bg-rose-50 p-4 text-rose-500 shadow-inner">
            <HiGift className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">Organization Celebrations</h2>
            <p className="text-sm font-bold text-rose-400 uppercase tracking-widest mt-1">Nurturing Culture</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {birthdays.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-lg bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white text-4xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                {item.icon}
              </div>
              <div className="font-black text-slate-900 text-lg mb-1">{item.name}</div>
              <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.15em]">{item.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <Modal
          title={selectedAnnouncement.title}
          isOpen={true}
          onClose={() => setSelectedAnnouncement(null)}
          size="lg"
        >
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <Badge label={selectedAnnouncement.priority} color={selectedAnnouncement.priority === 'High' ? 'red' : 'emerald'} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                POSTED ON {new Date(selectedAnnouncement.created_at).toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-8 text-slate-700 text-lg font-medium leading-relaxed border border-slate-100 shadow-inner">
              {selectedAnnouncement.content}
            </div>
            <div className="flex justify-end pt-4">
              <Button label="Acknowledge" variant="primary" onClick={() => setSelectedAnnouncement(null)} className="rounded-lg px-8" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
