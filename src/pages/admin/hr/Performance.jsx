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
import FileUpload from '../../../components/ui/FileUpload.jsx'
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
        className="flex w-full cursor-pointer items-center justify-between rounded-none border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm transition-all focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E]"
      >
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {value ? employees.find(e => e.id === value)?.name : 'Search by name or ID...'}
        </span>
        <HiMagnifyingGlass className="h-4 w-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full animate-in fade-in slide-in-from-top-2 rounded-none border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl">
          <input
            autoFocus
            type="text"
            placeholder="Type to filter..."
            className="mb-2 w-full rounded-none border border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-[#0F766E]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-sm transition-colors hover:bg-emerald-50"
                onClick={() => {
                  onChange(e.id)
                  setIsOpen(false)
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E]/10 text-[#0F766E] font-bold text-[10px]">
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

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#0F766E]' : 'bg-slate-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
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

  const handleConfigChange = (e) => {
    const { name, value } = e.target
    setConfigData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddReview = () => {
    setFormData(initialFormData)
    setFiles({})
    setModalOpen(true)
  }

  const columns = [
    {
      key: 'employee',
      label: 'Talent Asset',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 font-black text-[10px] border border-slate-200">
            {row.employee.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-black text-slate-900 uppercase text-[11px] tracking-tight truncate">{row.employee}</div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{row.empId}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'cycle', 
      label: 'Cycle Identifier',
      render: (v) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{v}</span>
    },
    {
      key: 'rating',
      label: 'Performance Band',
      render: (v) => (
        <Badge
          label={v.toUpperCase()}
          color={v === 'Outstanding' || v === 'Exceeds' ? 'green' : v === 'Meets' ? 'blue' : 'orange'}
          className="rounded-none text-[9px] font-black tracking-widest"
        />
      ),
    },
    { 
      key: 'manager', 
      label: 'Governance Lead',
      render: (v) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{v}</span>
    },
    {
      key: 'status',
      label: 'System Status',
      render: (v) => (
        <div className="flex items-center gap-1.5">
           <div className={`h-1.5 w-1.5 rounded-none ${v === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
           <span className={`text-[10px] font-black uppercase tracking-widest ${v === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>{v}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Execution',
      render: (_, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setFormData({ ...initialFormData, employeeId: row.employeeId })
            setModalOpen(true)
          }}
          className="text-[10px] font-black uppercase tracking-widest text-[#0F766E] hover:underline"
        >
          View Dossier
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0 border-b border-slate-100 pb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Performance Intelligence</h1>
          <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Assessment Governance & Talent Optimization</p>
        </div>
        {isHR && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setConfigModalOpen(true)}
              type="button"
              className="h-10 inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50"
            >
              <HiCalendarDays className="h-4 w-4" /> Cycle Parameters
            </button>
            <button
              onClick={openAddReview}
              type="button"
              className="h-10 inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
            >
              <HiPlus className="h-4 w-4" /> Initialize Assessment
            </button>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3 min-w-0">
        {[
          {
            label: 'Active Governance Cycles',
            count: performanceKpis.activeCycles,
            color: 'text-slate-900',
            borderColor: 'border-slate-200',
            icon: HiArrowTrendingUp,
          },
          {
            label: 'Assessments Pending Audit',
            count: performanceKpis.dueThisMonth,
            color: 'text-amber-600',
            borderColor: 'border-amber-100',
            icon: HiClock,
          },
          {
            label: 'Success Quotient',
            count: '92.4%',
            color: 'text-emerald-600',
            borderColor: 'border-emerald-100',
            icon: HiClipboardDocumentCheck,
          }
        ].map((card, idx) => (
          <div key={idx} className={`flex flex-col gap-4 rounded-none border bg-white p-5 shadow-sm min-w-0 ${card.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                {card.label}
              </div>
              <card.icon className={`h-4 w-4 ${card.color} opacity-30`} />
            </div>
            <div className={`text-3xl font-black tracking-tight leading-none ${card.color}`}>{card.count}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'hub', label: 'Performance Hub', icon: HiBriefcase },
            { id: 'cycles', label: 'Governance Cycles', icon: HiCalendarDays },
            { id: 'analytics', label: 'Intelligence Reports', icon: HiChartBar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-3 px-8 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id
                  ? 'text-[#0F766E]'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F766E] animate-in fade-in duration-300" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'hub' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Filters */}
            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Talent Search</label>
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Name, ID or Reviewer..."
                      className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                  <select className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white focus:outline-none appearance-none transition-all cursor-pointer">
                    <option>All Classifications</option>
                    <option>Assessment Completed</option>
                    <option>Governance Pending</option>
                  </select>
                </div>
                <button className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                   Refine Results
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Talent Dossiers ({filtered.length})</div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-none bg-emerald-500" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completed</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-none bg-amber-500" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                   </div>
                </div>
              </div>
              <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="grid gap-6 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="lg:col-span-2 space-y-6">
              {[
                { title: 'Q1 2026 STRATEGIC AUDIT', period: 'JAN 01 - MAR 31, 2026', status: 'ACTIVE', progress: 85, color: 'emerald' },
                { title: 'H1 2026 PERFORMANCE APPRAISAL', period: 'JAN 01 - JUN 30, 2026', status: 'UPCOMING', progress: 0, color: 'blue' },
                { title: 'ANNUAL 2025 RETROSPECTIVE', period: 'JAN 01 - DEC 31, 2025', status: 'COMPLETED', progress: 100, color: 'slate' }
              ].map((cycle, i) => (
                <div key={i} className="rounded-none border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-none bg-slate-100 border border-slate-200 text-slate-600">
                        <HiCalendarDays className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{cycle.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{cycle.period}</p>
                      </div>
                    </div>
                    <Badge 
                      label={cycle.status} 
                      color={cycle.status === 'ACTIVE' ? 'green' : cycle.status === 'UPCOMING' ? 'blue' : 'gray'} 
                      className="rounded-none text-[9px] font-black tracking-widest"
                    />
                  </div>
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Completion Index</span>
                      <span className="text-[11px] font-black text-slate-900">{cycle.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-none bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${cycle.status === 'ACTIVE' ? 'bg-emerald-500' : cycle.status === 'UPCOMING' ? 'bg-blue-500' : 'bg-slate-500'}`} 
                        style={{ width: `${cycle.progress}%` }} 
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button className="flex-1 h-10 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                      Protocol Management
                    </button>
                    <button className="flex-1 h-10 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-colors">
                      Extract Intelligence
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-none bg-[#0F766E] p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-none bg-white/10 rotate-45" />
                <HiDocumentText className="h-12 w-12 text-emerald-200/40 relative z-10" />
                <h3 className="mt-6 text-xl font-black uppercase tracking-tight relative z-10">Governance Setup</h3>
                <p className="mt-3 text-[11px] font-bold text-emerald-50/70 leading-relaxed uppercase tracking-widest relative z-10">
                  Establish performance windows, define rating bands, and automate system notification triggers.
                </p>
                <button 
                  onClick={() => setConfigModalOpen(true)}
                  className="mt-8 w-full h-12 rounded-none bg-white text-[10px] font-black uppercase tracking-widest text-[#0F766E] transition-all hover:bg-emerald-50 relative z-10"
                >
                  Launch New Governance Cycle
                </button>
              </div>
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">Operational Velocity</h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mean Cycle Time</span>
                    <span className="text-[11px] font-black text-slate-900">14.2 DAYS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Response</span>
                    <span className="text-[11px] font-black text-slate-900 text-emerald-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strategic Alignment</span>
                    <span className="text-[11px] font-black text-slate-900">88.0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <HiUserGroup className="h-4 w-4 text-[#0F766E]" /> Headcount Distribution
                  </h3>
                  <div className="h-2 w-8 bg-slate-100" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.headcount}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900, textAnchor: 'middle' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                        {analyticsData.headcount.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <HiChartBar className="h-4 w-4 text-[#0F766E]" /> Performance Band Matrix
                  </h3>
                  <div className="h-2 w-8 bg-slate-100" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.performanceDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={0}
                        dataKey="count"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {analyticsData.performanceDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 border-t border-slate-50 pt-6">
                  {analyticsData.performanceDist.map((d, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{d.name}</div>
                      <div className="text-sm font-black text-slate-900 tracking-tight">{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
               <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
                    <HiClock className="h-4 w-4 text-[#0F766E]" /> Attendance Velocity
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.attendance}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                        <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                        <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900' }} />
                        <Area type="monotone" dataKey="rate" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4 text-red-600">
                    <HiArrowTrendingUp className="h-4 w-4" /> Systemic Attrition Risk
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.attrition}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                        <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900' }} />
                        <Line type="step" dataKey="rate" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
               <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                 <HiClipboardDocumentCheck className="h-4 w-4 text-[#0F766E]" /> Compliance Quota Report
               </h3>
               <div className="grid gap-6 md:grid-cols-4">
                 {[
                   { label: 'Visa Authentication', value: 95, color: 'bg-emerald-500' },
                   { label: 'Insurance Verification', value: 82, color: 'bg-amber-500' },
                   { label: 'Contract Integrity', value: 100, color: 'bg-[#0F766E]' },
                   { label: 'KYC Documentation', value: 98, color: 'bg-teal-500' }
                 ].map((item, i) => (
                   <div key={i} className="rounded-none border border-slate-100 p-5 bg-slate-50/30">
                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{item.label}</div>
                     <div className="flex items-end justify-between gap-4">
                       <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">{item.value}%</div>
                       <div className="flex-1 h-1.5 bg-slate-200 rounded-none overflow-hidden mb-1">
                         <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Assessment Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        title="PROTOCOL_DOSSIER_INITIALIZATION" 
        size="xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }} className="space-y-12 p-2">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-[#0F766E] uppercase tracking-[0.2em] border-l-4 border-[#0F766E] pl-4">IDENTITY_GOVERNANCE_CONTEXT</h4>
              <div className="space-y-6">
                <SearchableEmployeeSelect 
                  value={formData.employeeId} 
                  onChange={(id) => handleRatingChange('employeeId', id)} 
                />
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GOVERNANCE_CYCLE</label>
                    <select
                      name="reviewPeriod"
                      value={formData.reviewPeriod}
                      onChange={handleFormChange}
                      className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] focus:outline-none appearance-none cursor-pointer transition-all"
                      required
                    >
                      <option value="" disabled hidden>SELECT_CYCLE</option>
                      <option value="Q1 2026">Q1 2026</option>
                      <option value="Q2 2026">Q2 2026</option>
                      <option value="H1 2026">H1 2026</option>
                      <option value="ANNUAL 2025">ANNUAL 2025</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AUDIT_PROTOCOL</label>
                    <select
                      name="reviewType"
                      value={formData.reviewType}
                      onChange={handleFormChange}
                      className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] focus:outline-none appearance-none cursor-pointer transition-all"
                      required
                    >
                      <option value="" disabled hidden>SELECT_TYPE</option>
                      <option value="Self">SELF-ASSESSMENT</option>
                      <option value="Manager">GOVERNANCE AUDIT</option>
                      <option value="360 Degree">360° SYNTHESIS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-[#0F766E] uppercase tracking-[0.2em] border-l-4 border-[#0F766E] pl-4">COMPETENCY_VECTOR_RATINGS</h4>
              <div className="grid grid-cols-2 gap-y-8 gap-x-8">
                <StarRating label="WORK_QUALITY" value={formData.workQuality} onChange={(v) => handleRatingChange('workQuality', v)} />
                <StarRating label="PRODUCTIVITY" value={formData.productivity} onChange={(v) => handleRatingChange('productivity', v)} />
                <StarRating label="COMMUNICATION" value={formData.communication} onChange={(v) => handleRatingChange('communication', v)} />
                <StarRating label="COLLABORATION" value={formData.teamwork} onChange={(v) => handleRatingChange('teamwork', v)} />
                <StarRating label="STEWARDSHIP" value={formData.leadership} onChange={(v) => handleRatingChange('leadership', v)} />
                <StarRating label="CORE_INDEX" value={formData.overallRating} onChange={(v) => handleRatingChange('overallRating', v)} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-[#0F766E] uppercase tracking-[0.2em] border-l-4 border-[#0F766E] pl-4">STRATEGIC_INTELLIGENCE_FEEDBACK</h4>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KEY_VALUE_CONTRIBUTIONS</label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleFormChange}
                  className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:outline-none transition-all min-h-[140px] placeholder:text-slate-200"
                  placeholder="IDENTIFY CORE OPERATIONAL STRENGTHS..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">STRATEGIC_GROWTH_OBJECTIVES</label>
                <textarea
                  name="goalsNextPeriod"
                  value={formData.goalsNextPeriod}
                  onChange={handleFormChange}
                  className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:outline-none transition-all min-h-[140px] placeholder:text-slate-200"
                  placeholder="DEFINE MEASURABLE KPIS FOR NEXT GOVERNANCE CYCLE..."
                />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex justify-end gap-6">
            <button 
              type="button" 
              onClick={handleCloseModal}
              className="h-12 px-10 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              ABORT_ENTRY
            </button>
            <button 
              type="submit" 
              className="h-12 px-16 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-2xl shadow-slate-900/20"
            >
              COMMIT_ASSESSMENT_DOSSIER
            </button>
          </div>
        </form>
      </Modal>

      {/* Cycle Config Modal */}
      <Modal
        isOpen={configModalOpen}
        onClose={handleCloseConfigModal}
        title="GOVERNANCE CYCLE CONFIGURATION"
        size="lg"
        className="rounded-none"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCloseConfigModal(); }} className="space-y-8 p-2">
           <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Nomenclature</label>
                <input
                  type="text"
                  name="cycleName"
                  value={configData.cycleName}
                  onChange={handleConfigChange}
                  className="w-full rounded-none border border-slate-200 bg-white h-11 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:outline-none"
                  placeholder="e.g. Q3 2026 STRATEGIC AUDIT"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Window Inception</label>
                  <input
                    type="date"
                    name="startDate"
                    value={configData.startDate}
                    onChange={handleConfigChange}
                    className="w-full rounded-none border border-slate-200 bg-white h-11 px-4 text-[11px] font-bold uppercase focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Window Termination</label>
                  <input
                    type="date"
                    name="endDate"
                    value={configData.endDate}
                    onChange={handleConfigChange}
                    className="w-full rounded-none border border-slate-200 bg-white h-11 px-4 text-[11px] font-bold uppercase focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hard Commitment Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={configData.deadline}
                  onChange={handleConfigChange}
                  className="w-full rounded-none border border-slate-200 bg-white h-11 px-4 text-[11px] font-bold uppercase focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 py-4 border-y border-slate-50">
                 <Toggle
                    checked={configData.autoReminders}
                    onChange={(v) => setConfigData(p => ({ ...p, autoReminders: v }))}
                 />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enable Automated Compliance Reminders</span>
              </div>
           </div>
           <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={handleCloseConfigModal}
              className="h-11 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="h-11 px-10 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all"
            >
              Initialize Governance Window
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
