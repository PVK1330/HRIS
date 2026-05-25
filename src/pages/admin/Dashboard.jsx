import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  HiBellAlert,
  HiGift,
  HiArrowRightOnRectangle,
  HiArrowTrendingUp,
  HiBolt,
  HiShieldCheck,
  HiFlag,
  HiCog6Tooth,
  HiIdentification,
  HiUserGroup,
  HiArrowPath
} from 'react-icons/hi2'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Badge } from '../../components/ui/Badge.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { dashboardStats } from '../../data/mockData.js'
import api from '../../services/api.js'
import ManagerDashboard from '../../components/manager/ManagerDashboard.jsx'

const growthData = [
  { name: 'JAN', headcount: 45 },
  { name: 'FEB', headcount: 52 },
  { name: 'MAR', headcount: 48 },
  { name: 'APR', headcount: 61 },
  { name: 'MAY', headcount: 55 },
  { name: 'JUN', headcount: 67 },
  { name: 'JUL', headcount: 75 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [liveAnnouncements, setLiveAnnouncements] = useState([])

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).toUpperCase(),
    [],
  )

  const fetchLiveAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements')
      const allAnns = res.data?.data || []
      setLiveAnnouncements(
        allAnns
          .filter(a => a.status === 'Published' && (!a.dispatch_channels || a.dispatch_channels === 'In App' || a.dispatch_channels === 'Both'))
          .slice(0, 4)
      )
    } catch (e) {
      console.warn('Could not pull live broadcasts:', e)
    }
  }

  useEffect(() => {
    fetchLiveAnnouncements()
    setIsLoading(false)
  }, [])

  const loadDashboardData = () => {
    setIsLoading(true)
    fetchLiveAnnouncements()
    setTimeout(() => setIsLoading(false), 800)
  }

  const isHRAdmin = user?.role === 'hr_admin' || user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const isEmployee = user?.role === 'employee'

  const stats = {
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

  const announcements = liveAnnouncements.length > 0 ? liveAnnouncements : [
    { id: 1, title: 'Annual General Meeting 2026', content: 'The annual general meeting for all shareholders and employees will be held in the main auditorium.', priority: 'High', created_at: new Date().toISOString() },
    { id: 2, title: 'New Health Insurance Policy', content: 'We have updated our health insurance provider to ensure better coverage for all employees.', priority: 'Standard', created_at: new Date().toISOString() },
  ]

  const birthdays = [
    { name: 'Sarah Ahmed', type: 'Birthday', icon: '🎂', date: 'Today', dept: 'Engineering' },
    { name: 'Omar Hassan', type: 'Anniversary', icon: '🎉', date: 'Tomorrow', dept: 'Marketing' },
  ]

  const expiryAlerts = [
     { name: 'PASSPORT_EXPIRY', count: 3, items: ['John Doe', 'Jane Smith', 'Mike Ross'], color: 'rose' },
     { name: 'VISA_EXPIRY', count: 5, items: ['Ali Khan', 'Sara Lee', 'David B.'], color: 'amber' },
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
          <div className="h-10 w-10 animate-spin border-4 border-[#0F766E] border-t-transparent" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Intelligence...</p>
        </div>
      </div>
    )
  }

  // Render Manager Dashboard for managers
  if (isManager) {
    return <ManagerDashboard />
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 min-w-0">
      {/* SaaS Premium Hero Orchestrator - Industrial Refactor */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-10 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <HiBolt className="w-4 h-4 text-[#0F766E]" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  {isHRAdmin ? 'Corporate Command Center' : isManager ? 'Team Orchestrator' : 'Identity Portal'}
               </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
               {isEmployee ? 'Identity Overview,' : 'System Authorization,'} <br/>
               <span className="text-[#0F766E]">{user?.name?.split(' ')[0] ?? 'Admin'}</span>
            </h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
               SECURE ACCESS FOR <span className="text-slate-900">{user?.tenantName?.toUpperCase() || 'MICROLAN IT'}</span> • <span className="text-emerald-700">{user?.role?.replace('_', ' ').toUpperCase()}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 border-l border-slate-100 pl-10">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">System Time</p>
                <p className="text-sm font-black text-slate-900 leading-none">{todayLabel}</p>
             </div>
             <button 
                onClick={loadDashboardData}
                className="flex h-12 w-12 items-center justify-center rounded-none bg-slate-900 text-white transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-900/10"
             >
                <HiArrowPath className="h-5 w-5" />
             </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-slate-50 -z-10 skew-x-12 translate-x-1/2" />
      </div>

      {/* RBAC Stats Registry */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
         {isHRAdmin ? (
            <>
               <StatCard title="TOTAL HEADCOUNT" value={stats.employees.total} subtitle="Global Identity" color="slate" icon={HiUsers} square />
               <StatCard title="ACTIVE TALENT" value={stats.employees.active} subtitle="Operational" color="emerald" icon={HiBriefcase} square />
               <StatCard title="EVALUATION" value={stats.employees.probation} subtitle="In Probation" color="amber" icon={HiClock} square />
               <StatCard title="EXIT RISK" value={stats.employees.notice} subtitle="Notice Period" color="rose" icon={HiArrowRightOnRectangle} square />
            </>
         ) : isManager ? (
            <>
               <StatCard title="TEAM COUNT" value="12" subtitle="Direct Reports" color="slate" icon={HiUserGroup} square />
               <StatCard title="PRESENCE" value="10" subtitle="In-Office Today" color="emerald" icon={HiBuildingOffice} square />
               <StatCard title="LEAVES" value="2" subtitle="Active Absence" color="amber" icon={HiCalendar} square />
               <StatCard title="PERFORMANCE" value="4.2" subtitle="Avg Team Score" color="indigo" icon={HiChartBar} square />
            </>
         ) : (
            <>
               <StatCard title="LEAVE BALANCE" value={stats.personal.leaveBalance} subtitle="Available Days" color="emerald" icon={HiCalendar} square />
               <StatCard title="PRESENCE RATE" value={stats.personal.attendanceRate} subtitle="Last 30 Days" color="slate" icon={HiClock} square />
               <StatCard title="PENDING TASKS" value={stats.personal.pendingTasks} subtitle="Action Required" color="amber" icon={HiClipboardDocumentCheck} square />
               <StatCard title="PAYSLIP" value="VIEW" subtitle="Last Generated" color="indigo" icon={HiCreditCard} square />
            </>
         )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Intelligence Section */}
        <div className="lg:col-span-2 space-y-8">
           {/* Operational Audit & Distribution */}
           <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Operational Audit</h2>
                       <h3 className="text-xl font-black text-slate-900 leading-none uppercase">Work Distribution</h3>
                    </div>
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <div className="space-y-4">
                    {[
                        { label: 'IN OFFICE', count: stats.attendance.present, color: 'bg-[#0F766E]' },
                        { label: 'REMOTE', count: stats.attendance.remote, color: 'bg-blue-500' },
                        { label: 'ON LEAVE', count: stats.attendance.absent, color: 'bg-rose-500' }
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`h-1.5 w-6 ${item.color}`} />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{item.count}</span>
                        </div>
                    ))}
                 </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 w-full text-center">ANALYTIC_SCHEMA</h3>
                 <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={[
                                { name: 'Office', value: stats.attendance.present },
                                { name: 'Remote', value: stats.attendance.remote },
                                { name: 'Leave', value: stats.attendance.absent },
                             ]}
                             cx="50%"
                             cy="50%"
                             innerRadius={50}
                             outerRadius={65}
                             paddingAngle={4}
                             dataKey="value"
                          >
                             <Cell fill="#0F766E" strokeWidth={0} />
                             <Cell fill="#3B82F6" strokeWidth={0} />
                             <Cell fill="#EF4444" strokeWidth={0} />
                          </Pie>
                          <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px' }} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           {/* Trends / Graphs */}
           {!isEmployee && (
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Workforce Evolution Index</h3>
                    <HiArrowTrendingUp className="h-5 w-5 text-[#0F766E]" />
                 </div>
                 <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                          <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Area type="stepAfter" dataKey="headcount" stroke="#0F766E" strokeWidth={3} fill="#0F766E" fillOpacity={0.05} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           )}

           {/* Quick Access Grid */}
           <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Execution Gateways</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <Link key={mod.label} to={mod.path} className="flex flex-col items-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E] transition-all group">
                       <mod.icon className="h-5 w-5 text-slate-400 mb-3 group-hover:text-[#0F766E] transition-colors" />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{mod.label}</span>
                    </Link>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           {/* Pending Approvals */}
           {(isHRAdmin || isManager) && (
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                    PENDING_ACTION <HiBellAlert className="h-4 w-4 text-amber-500" />
                 </h3>
                 <div className="space-y-3">
                    {[
                       { label: 'Leave Requests', count: stats.pending.leaves, path: '/admin/leave' },
                       { label: 'Expense Claims', count: stats.pending.expenses, path: '/admin/expenses' },
                       { label: 'Document Audits', count: stats.pending.documents, path: '/admin/documents' }
                    ].map(item => (
                       <Link key={item.label} to={item.path} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E] transition-all">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                          <span className="text-[11px] font-black text-[#0F766E]">{item.count}</span>
                       </Link>
                    ))}
                 </div>
              </div>
           )}

           {/* Compliance Alerts */}
           {isHRAdmin && (
              <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                    COMPLIANCE_PROTOCOL <HiShieldCheck className="h-4 w-4 text-rose-500" />
                 </h3>
                 <div className="space-y-3">
                    {expiryAlerts.map(alert => (
                       <div key={alert.name} className="p-4 border border-slate-100 bg-slate-50/50">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{alert.name}</span>
                             <Badge label={alert.count} color={alert.color} variant="soft" className="text-[9px] font-black" />
                          </div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight truncate">{alert.items.join(', ')}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Celebrations: Visual List */}
           <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 EVENT_LOG <HiGift className="h-4 w-4 text-rose-500" />
              </h3>
              <div className="space-y-4">
                 {birthdays.map((b, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group">
                       <Avatar name={b.name} size="sm" className="rounded-none border-2 border-white shadow-sm" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-tight truncate">{b.name}</p>
                          <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">{b.type} • {b.date.toUpperCase()}</p>
                       </div>
                       <div className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">
                          {b.icon}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Upcoming Holidays */}
           <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 CALENDAR_PROTOCOL <HiFlag className="h-4 w-4 text-[#0F766E]" />
              </h3>
              <div className="space-y-3">
                 {[
                    { name: 'EID AL ADHA', date: '16 JUNE', days: 'IN 40 DAYS', color: 'emerald' },
                    { name: 'ISLAMIC NEW YEAR', date: '07 JULY', days: 'UPCOMING', color: 'blue' }
                 ].map(h => (
                    <div key={h.name} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50">
                       <div className="flex items-center gap-4">
                          <div className={`h-8 w-1 bg-${h.color}-500`} />
                          <div>
                             <p className="text-[10px] font-black text-slate-900 leading-none mb-1">{h.name}</p>
                             <p className="text-[8px] text-slate-400 font-black uppercase">{h.date}</p>
                          </div>
                       </div>
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{h.days}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Broadcasts & New Talent */}
      <div className="grid gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2 rounded-none border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Broadcast Repository</h3>
               <HiMegaphone className="h-5 w-5 text-[#0F766E]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
               {announcements.map((ann) => (
                  <button
                     key={ann.id}
                     onClick={() => setSelectedAnnouncement(ann)}
                     className="w-full text-left p-6 border border-slate-100 bg-slate-50/50 transition-all hover:bg-white hover:border-[#0F766E] group"
                  >
                     <div className="flex items-center gap-3 mb-3">
                        <Badge label={ann.priority} color={ann.priority === 'High' ? 'red' : 'emerald'} variant="soft" className="text-[9px] font-black" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString()}</span>
                     </div>
                     <h3 className="font-black text-slate-900 group-hover:text-[#0F766E] transition-colors text-sm uppercase mb-2 leading-tight">{ann.title}</h3>
                     <p className="text-[10px] text-slate-500 line-clamp-1 font-bold uppercase tracking-tight">{ann.content}</p>
                  </button>
               ))}
            </div>
         </div>

         <div className="rounded-none border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">TALENT_PIPELINE</h3>
            <div className="space-y-8">
               <div>
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-4">INDUCTION_AUDIT</p>
                  <div className="space-y-4">
                     {joinersExits.newJoiners.map(j => (
                        <div key={j.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Avatar name={j.name} size="xs" className="rounded-none" />
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 leading-none uppercase">{j.name}</p>
                                 <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{j.dept}</p>
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-slate-900">{j.date}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-100">
                  <p className="text-[9px] font-black text-rose-700 uppercase tracking-[0.3em] mb-4">TERMINATION_AUDIT</p>
                  <div className="space-y-4">
                     {joinersExits.exits.map(e => (
                        <div key={e.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Avatar name={e.name} size="xs" className="rounded-none" />
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 leading-none uppercase">{e.name}</p>
                                 <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{e.dept}</p>
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-slate-900">{e.date}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Modal */}
      {selectedAnnouncement && (
        <Modal title="BROADCAST_ANALYSIS" isOpen={true} onClose={() => setSelectedAnnouncement(null)} size="lg">
          <div className="space-y-8 pt-4">
            <div className="border border-slate-100 bg-slate-50 p-10">
               <div className="flex items-center gap-4 mb-6">
                 <Badge label={selectedAnnouncement.priority} color={selectedAnnouncement.priority === 'High' ? 'red' : 'emerald'} className="text-[10px] font-black px-6" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedAnnouncement.created_at).toLocaleString().toUpperCase()}</span>
               </div>
               <h2 className="text-3xl font-black text-slate-900 uppercase mb-6 leading-tight tracking-tighter">{selectedAnnouncement.title}</h2>
               <div className="text-slate-600 text-sm font-bold leading-relaxed bg-white p-8 border border-slate-200">
                 {selectedAnnouncement.content}
               </div>
            </div>
            <div className="flex gap-4">
               <button 
                  onClick={() => setSelectedAnnouncement(null)} 
                  className="flex-1 h-14 bg-slate-900 text-white uppercase font-black text-[11px] tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
               >
                  ACKNOWLEDGE_PROTOCOL
               </button>
               <button 
                  onClick={() => setSelectedAnnouncement(null)} 
                  className="px-10 h-14 border border-slate-200 text-slate-400 uppercase font-black text-[11px] tracking-widest hover:text-slate-600 transition-all"
               >
                  ARCHIVE
               </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
