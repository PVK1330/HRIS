import { useMemo, useState, useEffect } from 'react'
import { 
  HiChartBar, 
  HiClipboardDocumentCheck, 
  HiUserGroup, 
  HiClock, 
  HiIdentification, 
  HiArrowTrendingUp, 
  HiPlus, 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiCalendarDays,
  HiDocumentText,
  HiBriefcase,
  HiChevronRight,
  HiStar,
  HiOutlineStar,
  HiXMark
} from 'react-icons/hi2'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { employees, performanceKpis } from '../../../data/mockData.js'

const COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#99F6E4', '#F0FDFA']

const initialFormData = {
  employeeId: '',
  employeeName: '',
  reviewPeriod: '',
  reviewType: '',
  reviewerName: '',
  reviewDate: '',
  workQuality: 0,
  productivity: 0,
  communication: 0,
  teamwork: 0,
  leadership: 0,
  overallRating: 0,
  strengths: '',
  areasToImprove: '',
  goalsNextPeriod: '',
}

const reviews = employees.slice(0, 10).map((e, idx) => ({
  id: `pr-${e.id}`,
  employeeId: e.id,
  employee: e.name,
  empId: e.empId,
  cycle: 'H1 2026',
  rating: idx % 4 === 0 ? 'Exceeds' : idx % 4 === 1 ? 'Meets' : idx % 4 === 2 ? 'Outstanding' : 'Developing',
  manager: e.manager,
  due: '2026-04-30',
  status: idx % 2 === 0 ? 'Completed' : 'Pending',
}))

const analyticsData = {
  headcount: [
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 25 },
    { name: 'Sales', value: 38 },
    { name: 'HR', value: 12 },
    { name: 'Finance', value: 18 },
  ],
  attendance: [
    { day: 'Mon', rate: 94 },
    { day: 'Tue', rate: 96 },
    { day: 'Wed', rate: 92 },
    { day: 'Thu', rate: 95 },
    { day: 'Fri', rate: 91 },
  ],
  attrition: [
    { month: 'Jan', rate: 1.2 },
    { month: 'Feb', rate: 1.5 },
    { month: 'Mar', rate: 1.1 },
    { month: 'Apr', rate: 0.8 },
    { month: 'May', rate: 0.5 },
  ],
  performanceDist: [
    { name: 'Exceeds', count: 25 },
    { name: 'Meets', count: 45 },
    { name: 'Developing', count: 15 },
    { name: 'Unsatisfactory', count: 5 },
  ]
}

function StarRating({ label, value, onChange }) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex gap-1.5 p-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform active:scale-125"
          >
            {star <= value ? (
              <HiStar className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
            ) : (
              <HiOutlineStar className="h-6 w-6 text-slate-300 hover:text-amber-200" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function SearchableEmployeeSelect({ value, onChange }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return employees.slice(0, 5)
    return employees.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.empId.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8)
  }, [search])

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        Select Employee
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm transition-all focus-within:border-[#0F766E] focus-within:ring-4 focus-within:ring-emerald-500/10"
      >
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {value ? employees.find(e => e.id === value)?.name : 'Search by name or ID...'}
        </span>
        <HiMagnifyingGlass className="h-4 w-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full animate-in fade-in slide-in-from-top-2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl">
          <input
            autoFocus
            type="text"
            placeholder="Type to filter..."
            className="mb-2 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-emerald-50"
                onClick={() => {
                  onChange(e.id)
                  setIsOpen(false)
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E] font-bold text-[10px]">
                  {e.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{e.name}</div>
                  <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{e.empId}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 italic">No talent found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const initialConfigData = {
  cycleName: '',
  startDate: '',
  endDate: '',
  deadline: '',
  assessmentTypes: [],
  autoReminders: true,
  ratingScale: '5-star'
}

export default function Performance() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [activeTab, setActiveTab] = useState('hub')
  const [modalOpen, setModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [configData, setConfigData] = useState(initialConfigData)
  const [files, setFiles] = useState({})

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return reviews
    return reviews.filter((r) => `${r.employee} ${r.manager} ${r.empId}`.toLowerCase().includes(query))
  }, [q])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfigData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleRatingChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setFiles({})
  }

  const handleCloseConfigModal = () => {
    setConfigModalOpen(false)
    setConfigData(initialConfigData)
  }

  const openAddReview = () => {
    setFormData(initialFormData)
    setFiles({})
    setModalOpen(true)
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E] font-bold text-xs">
            {row.employee.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.employee}</div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{row.empId}</div>
          </div>
        </div>
      ),
    },
    { key: 'cycle', label: 'Cycle' },
    {
      key: 'rating',
      label: 'Rating',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Outstanding' || v === 'Exceeds' ? 'green' : v === 'Meets' ? 'blue' : 'orange'}
        />
      ),
    },
    { key: 'manager', label: 'Reviewer' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Completed' ? 'green' : 'orange'} variant="outline" />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          label="Open"
          variant="ghost"
          size="sm"
          icon={HiChevronRight}
          className="hover:bg-slate-100"
          onClick={(e) => {
            e.stopPropagation()
            setFormData({ ...initialFormData, employeeId: row.employeeId })
            setModalOpen(true)
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Performance Intelligence</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Driving organizational excellence through continuous feedback, objective goal alignment, and data-driven performance analytics.
            </p>
          </div>
          {isHR && (
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setConfigModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
              >
                <HiCalendarDays className="h-4 w-4" /> Configure Cycle
              </button>
              <button 
                onClick={openAddReview}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <HiPlus className="h-4 w-4" /> New Review
              </button>
            </div>
          )}
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          title="Active Performance Cycles"
          value={performanceKpis.activeCycles}
          subtitle="Organization-wide assessments"
          color="blue"
          icon={HiArrowTrendingUp}
        />
        <StatCard
          title="Reviews Due"
          value={performanceKpis.dueThisMonth}
          subtitle="Submission deadline approaching"
          color="orange"
          icon={HiClock}
        />
        <StatCard
          title="Success Rate"
          value="92%"
          subtitle="Completed vs Planned reviews"
          color="green"
          icon={HiClipboardDocumentCheck}
        />
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-8">
            {[
              { id: 'hub', label: 'Performance Hub', icon: HiBriefcase },
              { id: 'cycles', label: 'Review Cycles', icon: HiCalendarDays },
              { id: 'analytics', label: 'Executive Reports', icon: HiChartBar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                    ? 'text-[#0F766E]'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#0F766E] animate-in slide-in-from-left-full duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'hub' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Talent</label>
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Name, ID or Reviewer..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Status</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:outline-none appearance-none transition-all">
                    <option>All Statuses</option>
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                </div>
                <Button label="Filters" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px]" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-700">Review Registry ({filtered.length})</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Records</div>
                </div>
              </div>
              <Table columns={columns} data={filtered} pageSize={5} />
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {[
                { title: 'Q1 2026 Review Cycle', period: 'Jan 1 - Mar 31, 2026', status: 'Active', progress: 85, color: 'emerald' },
                { title: 'H1 2026 Performance Appraisal', period: 'Jan 1 - Jun 30, 2026', status: 'Upcoming', progress: 0, color: 'blue' },
                { title: 'Annual 2025 Retrospective', period: 'Jan 1 - Dec 31, 2025', status: 'Completed', progress: 100, color: 'slate' }
              ].map((cycle, i) => (
                <div key={i} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${cycle.color}-50 text-${cycle.color}-600`}>
                        <HiCalendarDays className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{cycle.title}</h3>
                        <p className="text-xs text-slate-400 font-medium">{cycle.period}</p>
                      </div>
                    </div>
                    <Badge label={cycle.status} color={cycle.status === 'Active' ? 'green' : cycle.status === 'Upcoming' ? 'blue' : 'gray'} />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle Completion</span>
                      <span className="text-sm font-bold text-slate-700">{cycle.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-${cycle.color}-500`} 
                        style={{ width: `${cycle.progress}%` }} 
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button label="Manage Cycle" variant="ghost" size="sm" className="flex-1" />
                    <Button label="View Reports" variant="secondary" size="sm" className="flex-1" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#0F766E] p-6 text-white shadow-xl">
                <HiDocumentText className="h-10 w-10 text-emerald-300/50" />
                <h3 className="mt-4 text-lg font-bold">Cycle Configuration</h3>
                <p className="mt-2 text-sm text-emerald-100/70 leading-relaxed">
                  Establish performance windows, define rating scales, and automate review notification triggers.
                </p>
                <button 
                  onClick={() => setConfigModalOpen(true)}
                  className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-bold text-[#0F766E] transition-all hover:bg-emerald-50 active:scale-95"
                >
                  Launch New Cycle
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Avg. Cycle Time</span>
                    <span className="text-sm font-bold text-slate-900">14 Days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Response Rate</span>
                    <span className="text-sm font-bold text-slate-900">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Goal Alignment</span>
                    <span className="text-sm font-bold text-slate-900">88%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Top Row: Headcount & Performance Distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                  <HiUserGroup className="h-4 w-4 text-[#0F766E]" /> Headcount Report
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.headcount}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {analyticsData.headcount.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                  <HiChartBar className="h-4 w-4 text-[#0F766E]" /> Performance Summary
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.performanceDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analyticsData.performanceDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {analyticsData.performanceDist.map((d, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{d.name}</div>
                      <div className="text-sm font-black text-slate-700">{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Row: Attendance & Attrition */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                  <HiClock className="h-4 w-4 text-[#0F766E]" /> Attendance Report
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.attendance}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F766E" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="#0F766E" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                  <HiArrowTrendingUp className="h-4 w-4 text-red-500" /> Attrition Report
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.attrition}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Line type="step" dataKey="rate" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tables for Compliance & Visa */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Leave Report (Recent)</div>
                </div>
                <div className="p-2">
                  <Table 
                    columns={[
                      { key: 'name', label: 'Employee' },
                      { key: 'type', label: 'Type' },
                      { key: 'days', label: 'Days' },
                      { key: 'status', label: 'Status', render: (v) => <Badge label={v} color="green" /> }
                    ]} 
                    data={[
                      { name: 'John Doe', type: 'Annual', days: 5, status: 'Approved' },
                      { name: 'Sarah Ahmed', type: 'Sick', days: 2, status: 'Approved' },
                      { name: 'Michael Chen', type: 'Annual', days: 10, status: 'Approved' },
                    ]} 
                    pageSize={3} 
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Visa Expiry Report</div>
                </div>
                <div className="p-2">
                  <Table 
                    columns={[
                      { key: 'name', label: 'Employee' },
                      { key: 'expiry', label: 'Expiry Date' },
                      { key: 'status', label: 'Risk', render: (v) => <Badge label={v} color={v === 'High' ? 'red' : 'orange'} /> }
                    ]} 
                    data={[
                      { name: 'Alex Rivera', expiry: '2026-06-12', status: 'High' },
                      { name: 'Elena Petrova', expiry: '2026-07-20', status: 'Medium' },
                      { name: 'David Smith', expiry: '2026-08-05', status: 'Medium' },
                    ]} 
                    pageSize={3} 
                  />
                </div>
              </div>
            </div>

            {/* Compliance Matrix */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                <HiClipboardDocumentCheck className="h-4 w-4 text-[#0F766E]" /> Document Compliance Report
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: 'Passport Copies', value: 98, color: 'emerald' },
                  { label: 'Visa Documents', value: 95, color: 'teal' },
                  { label: 'Insurance Cards', value: 82, color: 'amber' },
                  { label: 'Contracts', value: 100, color: 'blue' }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black text-slate-700">{item.value}%</div>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Performance Assessment" size="xl">
        <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity & Context</p>
              <div className="space-y-3">
                <SearchableEmployeeSelect 
                  value={formData.employeeId} 
                  onChange={(id) => handleRatingChange('employeeId', id)} 
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Period</label>
                    <select
                      name="reviewPeriod"
                      value={formData.reviewPeriod}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                      required
                    >
                      <option value="" disabled hidden>Period</option>
                      <option value="Q1 2026">Q1 2026</option>
                      <option value="Q2 2026">Q2 2026</option>
                      <option value="H1 2026">H1 2026</option>
                      <option value="Annual 2025">Annual 2025</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Type</label>
                    <select
                      name="reviewType"
                      value={formData.reviewType}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                      required
                    >
                      <option value="" disabled hidden>Type</option>
                      <option value="Self">Self</option>
                      <option value="Manager">Manager</option>
                      <option value="360 Degree">360 Degree</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Competency Ratings (Stars)</p>
              <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                <StarRating label="Work Quality" value={formData.workQuality} onChange={(v) => handleRatingChange('workQuality', v)} />
                <StarRating label="Productivity" value={formData.productivity} onChange={(v) => handleRatingChange('productivity', v)} />
                <StarRating label="Communication" value={formData.communication} onChange={(v) => handleRatingChange('communication', v)} />
                <StarRating label="Teamwork" value={formData.teamwork} onChange={(v) => handleRatingChange('teamwork', v)} />
                <StarRating label="Leadership" value={formData.leadership} onChange={(v) => handleRatingChange('leadership', v)} />
                <StarRating label="Overall Core" value={formData.overallRating} onChange={(v) => handleRatingChange('overallRating', v)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Feedback</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Strengths</label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  rows={3}
                  placeholder="Identify key value contributions..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Growth Objectives</label>
                <textarea
                  name="goalsNextPeriod"
                  value={formData.goalsNextPeriod}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  rows={3}
                  placeholder="Define measurable KPIs for next cycle..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" label="Discard" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Finalize Assessment" variant="primary" className="px-8 shadow-lg shadow-emerald-900/20" />
          </div>
        </form>
      </Modal>

      <Modal isOpen={configModalOpen} onClose={handleCloseConfigModal} title="Configure Performance Cycle" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); handleCloseConfigModal(); }} className="space-y-6">
          <div className="space-y-4">
            <div className="w-full">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Name</label>
              <input
                type="text"
                name="cycleName"
                placeholder="e.g., Annual Review 2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                value={configData.cycleName}
                onChange={handleConfigChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="w-full">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                  value={configData.startDate}
                  onChange={handleConfigChange}
                  required
                />
              </div>
              <div className="w-full">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                  value={configData.endDate}
                  onChange={handleConfigChange}
                  required
                />
              </div>
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Deadline</label>
              <input
                type="date"
                name="deadline"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                value={configData.deadline}
                onChange={handleConfigChange}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Inclusions</p>
            <div className="grid grid-cols-2 gap-3">
              {['Self Assessment', 'Manager Review', 'Peer Feedback', '360° Evaluation'].map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-emerald-50">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
                  <span className="text-sm font-medium text-slate-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-emerald-50/50 p-4 border border-emerald-100">
            <div>
              <div className="text-sm font-bold text-[#0F766E]">Automated Reminders</div>
              <div className="text-[10px] text-emerald-600 font-medium">Send email alerts 3 days before deadline</div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                name="autoReminders"
                className="peer sr-only" 
                checked={configData.autoReminders}
                onChange={handleConfigChange}
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0F766E] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseConfigModal} />
            <Button type="submit" label="Initialize Cycle" variant="primary" className="px-8" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
