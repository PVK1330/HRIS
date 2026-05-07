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
  HiChartPie,
  HiArrowTrendingUp,
  HiBolt,
  HiShieldCheck,
  HiMapPin,
  HiArrowPath,
  HiGlobeAlt,
  HiIdentification,
  HiUserGroup,
  HiArrowRight,
  HiEnvelope,
  HiFlag
} from 'react-icons/hi2'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminDashboardService } from '../../services/adminDashboardService'
import { dashboardStats, dashboardAlerts } from '../../data/mockData.js'
import toast from 'react-hot-toast'

const COLORS = ['#0F766E', '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4']

// Mock Data for SaaS RBAC Environment
const growthData = [
  { name: 'Jan', headcount: 45 },
  { name: 'Feb', headcount: 52 },
  { name: 'Mar', headcount: 48 },
  { name: 'Apr', headcount: 61 },
  { name: 'May', headcount: 55 },
  { name: 'Jun', headcount: 67 },
  { name: 'Jul', headcount: 75 },
]

const attendanceData = [
  { name: 'Mon', present: 68, remote: 5 },
  { name: 'Tue', present: 72, remote: 3 },
  { name: 'Wed', present: 65, remote: 10 },
  { name: 'Thu', present: 70, remote: 5 },
  { name: 'Fri', present: 60, remote: 15 },
]

const deptData = [
  { name: 'Engineering', value: 45 },
  { name: 'Sales', value: 25 },
  { name: 'Marketing', value: 15 },
  { name: 'HR', value: 10 },
  { name: 'Operations', value: 5 },
]

const dotClass = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
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
    // loadDashboardData() 
    setIsLoading(false)
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await adminDashboardService.getDashboardData()
      setDashboardData(response.data.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Synchronization failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Determine view based on role
  const isHRAdmin = user?.role === 'hr_admin'
  const isManager = user?.role === 'manager'
  const isEmployee = user?.role === 'employee'

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
    },
    personal: {
       leaveBalance: 14,
       attendanceRate: '98%',
       pendingTasks: 3
    }
  }

  const announcements = dashboardData?.announcements || [
    { id: 1, title: 'Annual General Meeting 2026', content: 'The annual general meeting for all shareholders and employees will be held in the main auditorium.', priority: 'High', created_at: new Date().toISOString() },
    { id: 2, title: 'New Health Insurance Policy', content: 'We have updated our health insurance provider to ensure better coverage for all employees.', priority: 'Standard', created_at: new Date().toISOString() },
  ]

  const birthdays = dashboardData?.birthdays || [
    { name: 'Sarah Ahmed', type: 'Birthday', icon: '🎂', date: 'Today' },
    { name: 'Omar Hassan', type: 'Anniversary', icon: '🎉', date: 'Tomorrow' },
  ]

  const expiryAlerts = [
     { name: 'Passport Expiry', count: 3, items: ['John Doe', 'Jane Smith', 'Mike Ross'], color: 'rose' },
     { name: 'Visa Expiry', count: 5, items: ['Ali Khan', 'Sara Lee', 'David B.'], color: 'amber' },
  ]

  const joinersExits = {
     newJoiners: [
        { name: 'Alice Wong', dept: 'IT', date: '01 May' },
        { name: 'Bob Saget', dept: 'Sales', date: '03 May' },
     ],
     exits: [
        { name: 'Charlie Sheen', dept: 'Legal', date: '15 May' },
     ]
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500">
      {/* SaaS Premium Hero Orchestrator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
               <HiBolt className="w-4 h-4 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                  {isHRAdmin ? 'Corporate Command Center' : isManager ? 'Team Orchestrator' : 'Identity Portal'}
               </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
               {isEmployee ? 'Identity Overview,' : 'Welcome Back,'} <br/>
               <span className="text-emerald-300">{user?.name?.split(' ')[0] ?? 'Admin'}</span>
            </h1>
            <p className="mt-2 text-emerald-100/70 text-sm max-w-lg leading-relaxed font-medium">
               Secure Access for <span className="text-white font-bold">{user?.tenantName || 'Microlan IT'}</span> • <span className="text-emerald-200">{user?.role?.replace('_', ' ').toUpperCase()}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4">
             <div className="text-right">
                <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Sync Status</p>
                <p className="text-sm font-black text-white leading-none">{todayLabel}</p>
             </div>
             <button 
                onClick={loadDashboardData}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400 text-[#0F766E] transition-all hover:scale-105 active:scale-95 shadow-lg"
             >
                <HiArrowPath className="h-5 w-5" />
             </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* RBAC Stats Registry */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
         {isHRAdmin ? (
            <>
               <StatCard title="Total Headcount" value={stats.employees.total} subtitle="Global Identity" color="blue" icon={HiUsers} />
               <StatCard title="Active Talent" value={stats.employees.active} subtitle="Operational" color="emerald" icon={HiBriefcase} />
               <StatCard title="Evaluation" value={stats.employees.probation} subtitle="In Probation" color="amber" icon={HiClock} />
               <StatCard title="Exit Risk" value={stats.employees.notice} subtitle="Notice Period" color="rose" icon={HiArrowRightOnRectangle} />
            </>
         ) : isManager ? (
            <>
               <StatCard title="Team Count" value="12" subtitle="Direct Reports" color="blue" icon={HiUserGroup} />
               <StatCard title="Presence" value="10" subtitle="In-Office Today" color="emerald" icon={HiBuildingOffice} />
               <StatCard title="Leaves" value="2" subtitle="Active Absence" color="amber" icon={HiCalendar} />
               <StatCard title="Performance" value="4.2" subtitle="Avg Team Score" color="indigo" icon={HiChartBar} />
            </>
         ) : (
            <>
               <StatCard title="Leave Balance" value={stats.personal.leaveBalance} subtitle="Available Days" color="emerald" icon={HiCalendar} />
               <StatCard title="Presence Rate" value={stats.personal.attendanceRate} subtitle="Last 30 Days" color="blue" icon={HiClock} />
               <StatCard title="Pending Tasks" value={stats.personal.pendingTasks} subtitle="Action Required" color="amber" icon={HiClipboardDocumentCheck} />
               <StatCard title="Payslip" value="View" subtitle="Last Generated" color="indigo" icon={HiCreditCard} />
            </>
         )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Intelligence Section */}
        <div className="lg:col-span-2 space-y-6">
           {/* Work Status Summary */}
           <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Operational Audit</h2>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Work Status Summary</h3>
                 </div>
                 <Badge label="REAL-TIME SYNC" variant="soft" color="green" className="text-[8px] font-black" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-[#0F766E]">{stats.attendance.present}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">In Office</p>
                 </div>
                 <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-blue-600">{stats.attendance.remote}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Remote</p>
                 </div>
                 <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-rose-500">{stats.attendance.absent}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">On Leave</p>
                 </div>
              </div>
           </div>

           {/* Trends / Graphs (Visible to Admin/Manager) */}
           {!isEmployee && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Workforce Trends</h3>
                    <HiArrowTrendingUp className="h-5 w-5 text-[#0F766E]" />
                 </div>
                 <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="headcount" stroke="#0F766E" strokeWidth={3} fill="#0F766E" fillOpacity={0.1} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           )}

           {/* Quick Access Grid */}
           <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Access Modules</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[
                    { label: 'Directory', icon: HiUsers, path: '/admin/employee-directory', color: 'blue' },
                    { label: 'Profile', icon: HiIdentification, path: '/admin/employee-profile', color: 'emerald' },
                    { label: 'Attendance', icon: HiClock, path: '/admin/attendance', color: 'amber' },
                    { label: 'Leave', icon: HiCalendar, path: '/admin/leave', color: 'rose' },
                    { label: 'Documents', icon: HiDocument, path: '/admin/documents', color: 'indigo' },
                    { label: 'Visa/Nat', icon: HiCreditCard, path: '/admin/visa', color: 'purple' },
                    { label: 'Policies', icon: HiClipboardDocumentCheck, path: '/admin/policies', color: 'emerald' },
                    { label: 'Performance', icon: HiChartBar, path: '/admin/performance', color: 'blue' },
                    ...(isHRAdmin ? [{ label: 'Settings', icon: HiCog6Tooth, path: '/admin/settings', color: 'slate' }] : [])
                 ].map((mod) => (
                    <Link key={mod.label} to={mod.path} className="flex flex-col items-center p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-emerald-200 hover:shadow-lg transition-all group">
                       <mod.icon className={`h-5 w-5 text-${mod.color}-600 mb-2 group-hover:scale-110 transition-transform`} />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{mod.label}</span>
                    </Link>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Intelligence (Alerts, Approvals, reminders) */}
        <div className="space-y-6">
           {/* Pending Approvals */}
           {(isHRAdmin || isManager) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                    Pending Approvals <HiBellAlert className="h-4 w-4 text-amber-500" />
                 </h3>
                 <div className="space-y-2">
                    {[
                       { label: 'Leave Requests', count: stats.pending.leaves, path: '/admin/leave' },
                       { label: 'Expense Claims', count: stats.pending.expenses, path: '/admin/expenses' },
                       { label: 'Document Audits', count: stats.pending.documents, path: '/admin/documents' }
                    ].map(item => (
                       <Link key={item.label} to={item.path} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-50 hover:bg-white hover:border-slate-100 transition-all">
                          <span className="text-[10px] font-bold text-slate-700 uppercase">{item.label}</span>
                          <Badge label={item.count} color="amber" variant="soft" className="font-black" />
                       </Link>
                    ))}
                 </div>
              </div>
           )}

           {/* Compliance Alerts (Admin Only) */}
           {isHRAdmin && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                    Compliance Alerts <HiShieldCheck className="h-4 w-4 text-rose-500" />
                 </h3>
                 <div className="space-y-3">
                    {expiryAlerts.map(alert => (
                       <div key={alert.name} className={`p-3 rounded-xl bg-${alert.color}-50 border border-${alert.color}-100`}>
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[9px] font-black text-${alert.color}-700 uppercase`}>{alert.name}</span>
                             <Badge label={alert.count} color={alert.color} className="text-[8px]" />
                          </div>
                          <p className="text-[9px] text-slate-500 font-medium truncate">{alert.items.join(', ')}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Calendar & Holidays */}
           <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                 Upcoming Holidays <HiFlag className="h-4 w-4 text-[#0F766E]" />
              </h3>
              <div className="space-y-2">
                 {[
                    { name: 'Eid Al Adha', date: '16 June', days: 'In 40 days' },
                    { name: 'Islamic New Year', date: '07 July', days: 'Upcoming' }
                 ].map(h => (
                    <div key={h.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
                       <div>
                          <p className="text-[10px] font-black text-slate-900 leading-none mb-1">{h.name}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">{h.date}</p>
                       </div>
                       <span className="text-[8px] font-black text-[#0F766E] uppercase">{h.days}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Reminders: Birthdays & Anniversaries */}
           <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                 Celebrations <HiGift className="h-4 w-4 text-rose-500" />
              </h3>
              <div className="space-y-3">
                 {birthdays.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-50 hover:bg-white hover:shadow-md transition-all group">
                       <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-white text-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          {b.icon}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-900 leading-none mb-1">{b.name}</p>
                          <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">{b.type} • {b.date}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Strategic Broadcasts & Joiners/Exits */}
      <div className="grid gap-6 lg:grid-cols-3">
         <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Platform Broadcasts</h3>
               <HiMegaphone className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
               {announcements.map((ann) => (
                  <button
                     key={ann.id}
                     onClick={() => setSelectedAnnouncement(ann)}
                     className="w-full text-left rounded-xl bg-slate-50 p-5 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-emerald-200 group"
                  >
                     <div className="flex items-center gap-2 mb-2">
                        <Badge label={ann.priority} color={ann.priority === 'High' ? 'red' : 'emerald'} variant="soft" className="text-[8px] font-black px-2 py-0.5" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString()}</span>
                     </div>
                     <h3 className="font-black text-slate-900 group-hover:text-[#0F766E] transition-colors text-sm uppercase mb-1">{ann.title}</h3>
                     <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">{ann.content}</p>
                  </button>
               ))}
            </div>
         </div>

         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Joiners & Exits Summary</h3>
            <div className="space-y-4">
               <div>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-2">New Identity Integrations</p>
                  <div className="space-y-2">
                     {joinersExits.newJoiners.map(j => (
                        <div key={j.name} className="flex items-center justify-between text-[10px]">
                           <span className="font-bold text-slate-700">{j.name} <span className="text-slate-400 font-medium">({j.dept})</span></span>
                           <span className="font-black text-slate-900">{j.date}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="pt-4 border-t border-slate-50">
                  <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-2">Offboarding Pipeline</p>
                  <div className="space-y-2">
                     {joinersExits.exits.map(e => (
                        <div key={e.name} className="flex items-center justify-between text-[10px]">
                           <span className="font-bold text-slate-700">{e.name} <span className="text-slate-400 font-medium">({e.dept})</span></span>
                           <span className="font-black text-slate-900">{e.date}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Modal - Unified Sizing */}
      {selectedAnnouncement && (
        <Modal title="Broadcast Analysis" isOpen={true} onClose={() => setSelectedAnnouncement(null)} size="lg">
          <div className="space-y-6 pt-2">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3 mb-4">
                 <Badge label={selectedAnnouncement.priority} color={selectedAnnouncement.priority === 'High' ? 'red' : 'emerald'} className="text-[9px] font-black px-4" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedAnnouncement.created_at).toLocaleString()}</span>
               </div>
               <h2 className="text-2xl font-black text-slate-900 uppercase mb-4 leading-tight">{selectedAnnouncement.title}</h2>
               <div className="text-slate-600 text-sm font-medium leading-relaxed bg-white/50 p-6 rounded-xl border border-white">
                 {selectedAnnouncement.content}
               </div>
            </div>
            <div className="flex gap-3">
               <Button label="ACKNOWLEDGE" variant="primary" onClick={() => setSelectedAnnouncement(null)} className="flex-1 py-4 uppercase font-black text-[10px] tracking-widest rounded-xl shadow-lg" />
               <Button label="ARCHIVE" variant="ghost" onClick={() => setSelectedAnnouncement(null)} className="py-4 font-black text-slate-400 uppercase text-[10px] rounded-xl" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
