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
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
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
      <label className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform active:scale-125"
          >
            {star <= value ? (
              <HiStar className="h-5 w-5 text-amber-400" />
            ) : (
              <HiOutlineStar className="h-5 w-5 text-slate-300 hover:text-amber-200" />
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
      <label className="mb-1 block text-sm font-medium text-slate-800">
        Employee
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white h-10 px-3 text-sm transition-all focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E]/20"
      >
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {value ? employees.find(e => e.id === value)?.name : 'Select employee...'}
        </span>
        <HiMagnifyingGlass className="h-4 w-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full animate-in fade-in slide-in-from-top-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl">
          <input
            autoFocus
            type="text"
            placeholder="Type to filter..."
            className="mb-2 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-[#0F766E]"
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] font-bold text-[10px]">
                  {e.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{e.name}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase">{e.empId}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 italic">No employee found</div>
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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 ${checked ? 'bg-[#0F766E]' : 'bg-slate-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
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
  const [compModalOpen, setCompModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [configData, setConfigData] = useState(initialConfigData)
  const [files, setFiles] = useState({})
  const [competencies, setCompetencies] = useState([
    { id: 1, name: 'Communication Skills', createdAt: '2026-01-10' },
    { id: 2, name: 'Problem Solving', createdAt: '2026-01-15' },
    { id: 3, name: 'Leadership', createdAt: '2026-02-01' },
    { id: 4, name: 'Teamwork & Collaboration', createdAt: '2026-02-10' },
    { id: 5, name: 'Adaptability', createdAt: '2026-03-05' },
  ])
  const [compForm, setCompForm] = useState({ competencyName: '' })
  const [compSearch, setCompSearch] = useState('')

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

  const handleAddCompetency = (e) => {
    e.preventDefault()
    if (!compForm.competencyName.trim()) return
    setCompetencies(prev => [
      ...prev,
      { id: Date.now(), name: compForm.competencyName.trim(), createdAt: new Date().toISOString().split('T')[0] }
    ])
    setCompForm({ competencyName: '' })
    setCompModalOpen(false)
  }

  const filteredComps = useMemo(() => {
    if (!compSearch.trim()) return competencies
    return competencies.filter(c => c.name.toLowerCase().includes(compSearch.toLowerCase()))
  }, [competencies, compSearch])

  const tabStats = useMemo(() => {
    const pendingReviews = reviews.filter((r) => r.status === 'Pending').length
    const completedReviews = reviews.filter((r) => r.status === 'Completed').length
    return {
      hub: [
        { label: 'TOTAL ASSESSMENTS', count: reviews.length, bgColor: 'bg-[#0F172A]', icon: HiClipboardDocumentCheck },
        { label: 'PENDING REVIEW', count: pendingReviews, bgColor: 'bg-[#F59E0B]', icon: HiClock },
        { label: 'COMPLETED', count: completedReviews, bgColor: 'bg-[#0F766E]', icon: HiArrowTrendingUp },
      ],
      cycles: [
        { label: 'ACTIVE CYCLES', count: performanceKpis.activeCycles, bgColor: 'bg-[#0F766E]', icon: HiCalendarDays },
        { label: 'UPCOMING', count: 1, bgColor: 'bg-[#3B82F6]', icon: HiClock },
        { label: 'COMPLETED', count: 1, bgColor: 'bg-[#0F172A]', icon: HiClipboardDocumentCheck },
      ],
      compCycle: [
        { label: 'COMPETENCIES', count: competencies.length, bgColor: 'bg-[#0F172A]', icon: HiAdjustmentsHorizontal },
        { label: 'ACTIVE IN CYCLES', count: performanceKpis.activeCycles, bgColor: 'bg-[#0F766E]', icon: HiBriefcase },
        { label: 'DUE THIS MONTH', count: performanceKpis.dueThisMonth, bgColor: 'bg-[#F59E0B]', icon: HiClock },
      ],
    }
  }, [competencies])

  const renderTabStats = (tabId) => {
    const cards = tabStats[tabId]
    if (!cards?.length) return null
    return (
      <div
        key={tabId}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm min-w-0"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">
                {card.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiIdentification className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{row.employee}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.empId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'cycle',
      label: 'Cycle',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>
    },
    {
      key: 'rating',
      label: 'Performance Band',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Outstanding' || v === 'Exceeds' ? 'green' : v === 'Meets' ? 'blue' : 'orange'}
          className="rounded-none"
        />
      ),
    },
    {
      key: 'manager',
      label: 'Performance Lead',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const isCompleted = v === 'Completed'
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {v}
            </span>
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setFormData({ ...initialFormData, employeeId: row.employeeId })
              setModalOpen(true)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
            aria-label="View assessment"
          >
            <HiClipboardDocumentCheck className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Performance Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>HR Operations</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Performance Listing</span>
          </div>
        </div>
        {/* {isHR && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfigModalOpen(true)}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Competency Ratings
            </button>
            <button
              onClick={() => setConfigModalOpen(true)}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Performance Cycle
            </button>
            <button
              onClick={openAddReview}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Add Assessment
            </button>
          </div>
        )} */}
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'hub', label: 'Employee Performance', icon: HiBriefcase },
            { id: 'cycles', label: 'Performance Cycle', icon: HiCalendarDays },
            { id: 'compCycle', label: 'Competency Ratings', icon: HiAdjustmentsHorizontal },
            { id: 'analytics', label: 'Performance Reports', icon: HiChartBar }
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

        {['hub', 'cycles', 'compCycle'].includes(activeTab) && renderTabStats(activeTab)}

        {activeTab === 'hub' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              {/* Green Table Header */}
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Employee Performance</h2>
                {isHR && (
                  <button
                    type="button"
                    onClick={openAddReview}
                    className="inline-flex items-center gap-1.5 rounded-none bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <HiPlus className="h-3.5 w-3.5" /> Add Assessment
                  </button>
                )}
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search employee, ID or manager..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ('')}
                      className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <Table columns={columns} data={filtered} pageSize={10} square />
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              {/* Green Header */}
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Performance Cycles</h2>
                <button
                  onClick={() => setConfigModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-none bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <HiPlus className="h-3.5 w-3.5" /> New Cycle
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search cycles..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <p className="text-xs font-medium text-slate-500">3 records shown</p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Cycle Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Period</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Completion</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { title: 'Q1 2026 Strategic Audit', period: 'Jan 01 – Mar 31, 2026', status: 'ACTIVE', progress: 85 },
                      { title: 'H1 2026 Performance Appraisal', period: 'Jan 01 – Jun 30, 2026', status: 'UPCOMING', progress: 0 },
                      { title: 'Annual 2025 Retrospective', period: 'Jan 01 – Dec 31, 2025', status: 'COMPLETED', progress: 100 },
                    ].map((cycle, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
                              <HiCalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{cycle.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-600">{cycle.period}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${cycle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                            cycle.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cycle.status === 'ACTIVE' ? 'bg-emerald-500' :
                              cycle.status === 'UPCOMING' ? 'bg-blue-500' :
                                'bg-slate-400'
                              }`} />
                            {cycle.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 w-48">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${cycle.status === 'ACTIVE' ? 'bg-emerald-500' :
                                  cycle.status === 'UPCOMING' ? 'bg-blue-500' :
                                    'bg-slate-400'
                                  }`}
                                style={{ width: `${cycle.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-8 text-right">{cycle.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 shadow-sm">
                              Manage
                            </button>
                            <button className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-black shadow-sm">
                              Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compCycle' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              {/* Green Header */}
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Competency Registry</h2>
                {isHR && (
                  <button
                    onClick={() => { setCompForm({ competencyName: '' }); setCompModalOpen(true) }}
                    className="inline-flex items-center gap-1.5 rounded-none bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <HiPlus className="h-3.5 w-3.5" /> Add Competency
                  </button>
                )}
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    placeholder="Search competencies..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-medium text-slate-500">{filteredComps.length} records shown</p>
                  {compSearch && (
                    <button
                      type="button"
                      onClick={() => setCompSearch('')}
                      className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">#</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Competency Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Created Date</th>
                      {isHR && <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComps.map((comp, i) => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E]">
                              <HiAdjustmentsHorizontal className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{comp.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-500">{comp.createdAt}</span>
                        </td>
                        {isHR && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => setCompetencies(prev => prev.filter(c => c.id !== comp.id))}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-50 text-red-500 transition hover:bg-red-100"
                                aria-label="Delete"
                              >
                                <HiXMark className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {filteredComps.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                          No competencies found. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                          <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
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
      {/* ── Performance Review Modal ───────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="xl"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              Performance Review
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure employee assessment details, ratings, and strategic feedback.
            </p>
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCloseModal()
          }}
          className="pt-2"
        >
          <div className="space-y-4">
            {/* Employee + Review Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <SearchableEmployeeSelect
                  value={formData.employeeId}
                  onChange={(id) => handleRatingChange('employeeId', id)}
                />
              </div>

              <Input
                label="Performance Cycle"
                name="reviewPeriod"
                type="select"
                value={formData.reviewPeriod}
                onChange={handleFormChange}
                required
                placeholder="Select review cycle"
                options={[
                  { label: 'Q1 2026', value: 'Q1 2026' },
                  { label: 'Q2 2026', value: 'Q2 2026' },
                  { label: 'H1 2026', value: 'H1 2026' },
                  { label: 'Annual 2025', value: 'ANNUAL 2025' },
                ]}
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-medium text-slate-800"
              />

            </div>

            {/* Ratings */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs font-medium text-slate-500 mb-4">Competency Ratings — rate each area from 1 to 5 stars</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StarRating label="Work Quality" value={formData.workQuality} onChange={(v) => handleRatingChange('workQuality', v)} />
                <StarRating label="Productivity" value={formData.productivity} onChange={(v) => handleRatingChange('productivity', v)} />
                <StarRating label="Communication" value={formData.communication} onChange={(v) => handleRatingChange('communication', v)} />
                <StarRating label="Collaboration" value={formData.teamwork} onChange={(v) => handleRatingChange('teamwork', v)} />
                <StarRating label="Leadership" value={formData.leadership} onChange={(v) => handleRatingChange('leadership', v)} />
                <StarRating label="Overall Rating" value={formData.overallRating} onChange={(v) => handleRatingChange('overallRating', v)} />
              </div>
            </div>

            {/* Feedback */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Key Contributions
                </label>

                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleFormChange}
                  placeholder="Describe employee strengths and achievements"
                  className="min-h-[120px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Growth Objectives
                </label>

                <textarea
                  name="goalsNextPeriod"
                  value={formData.goalsNextPeriod}
                  onChange={handleFormChange}
                  placeholder="Define goals and KPIs for the next review cycle"
                  className="min-h-[120px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              Save Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* Cycle Config Modal */}
      <Modal
        isOpen={configModalOpen}
        onClose={handleCloseConfigModal}
        title="Performance Cycle"
        size="lg"
        className="rounded-none"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCloseConfigModal(); }} className="pt-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Cycle Name</label>
              <input
                type="text"
                name="cycleName"
                value={configData.cycleName}
                onChange={handleConfigChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                placeholder="e.g. Q3 2026 Performance Review"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={configData.startDate}
                  onChange={handleConfigChange}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={configData.endDate}
                  onChange={handleConfigChange}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Submission Deadline</label>
              <input
                type="date"
                name="deadline"
                value={configData.deadline}
                onChange={handleConfigChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 py-3 border-y border-slate-100">
              <Toggle
                checked={configData.autoReminders}
                onChange={(v) => setConfigData(p => ({ ...p, autoReminders: v }))}
              />
              <span className="text-sm font-medium text-slate-700">Enable automated reminder notifications</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseConfigModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              Save Cycle
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Competency Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={compModalOpen}
        onClose={() => { setCompModalOpen(false); setCompForm({ competencyName: '' }) }}
        size="sm"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add Competency</h2>
            <p className="text-xs font-medium text-slate-500">Enter a new competency to add to the registry.</p>
          </div>
        }
      >
        <form onSubmit={handleAddCompetency} className="pt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">Competency Name</label>
            <input
              type="text"
              autoFocus
              required
              value={compForm.competencyName}
              onChange={(e) => setCompForm({ competencyName: e.target.value })}
              placeholder="e.g. Problem Solving"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20"
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => { setCompModalOpen(false); setCompForm({ competencyName: '' }) }}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              Add Competency
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
