import { useMemo, useState } from 'react'
import { 
  HiDocumentText, 
  HiShieldCheck, 
  HiUserGroup, 
  HiClock, 
  HiPlus, 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiChevronRight,
  HiArrowDownTray,
  HiPencilSquare,
  HiEye,
  HiBellAlert,
  HiFolderPlus,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { employees } from '../../../data/mockData.js'

const POLICY_CATEGORIES = [
  'HR Policies',
  'Payroll Policies',
  'Attendance Policies',
  'IT & Security',
  'Code of Conduct',
  'Travel & Expense Policy',
  'Remote Work Policy',
  'Leave Policies',
  'Custom Categories'
]

const initialFormData = {
  title: '',
  category: '',
  version: '1.0',
  description: '',
  effectiveDate: '',
  reviewDate: '',
  ackRequired: true,
  audience: 'All Employees',
  status: 'Draft'
}

const mockPolicies = [
  { id: 1, name: 'Remote Work Policy', category: 'HR Policies', count: 1, updated: '2026-04-15', status: 'Published', ack: 'Yes' },
  { id: 2, name: 'Data Privacy Policy', category: 'IT & Security', count: 2, updated: '2026-05-01', status: 'Draft', ack: 'Yes' },
  { id: 3, name: 'Travel Expense v2', category: 'Travel & Expense Policy', count: 1, updated: '2026-03-20', status: 'Published', ack: 'No' },
  { id: 4, name: 'Attendance Rules', category: 'Attendance Policies', count: 3, updated: '2026-05-05', status: 'Published', ack: 'Yes' },
]

export default function Policies() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('dashboard') // dashboard, editor, tracking
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return mockPolicies
    return mockPolicies.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query))
  }, [q])

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const columns = [
    {
      key: 'name',
      label: 'Policy Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E]/10 text-[#0F766E]">
            <HiDocumentText className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.category}</div>
          </div>
        </div>
      ),
    },
    { key: 'count', label: 'Docs' },
    { key: 'updated', label: 'Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Published' ? 'green' : 'orange'} variant="outline" />,
    },
    {
      key: 'ack',
      label: 'Ack Required',
      render: (v) => (
        <div className="flex items-center gap-1.5">
          {v === 'Yes' ? <HiCheckCircle className="h-4 w-4 text-emerald-500" /> : <HiXCircle className="h-4 w-4 text-slate-300" />}
          <span className="text-xs font-medium text-slate-600">{v}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            label="View"
            variant="ghost"
            size="sm"
            icon={HiEye}
            onClick={() => {
              setSelectedPolicy(row)
              setActiveView('editor')
            }}
          />
          {isHR && (
            <Button
              label="Track"
              variant="ghost"
              size="sm"
              icon={HiUserGroup}
              onClick={() => {
                setSelectedPolicy(row)
                setActiveView('tracking')
              }}
            />
          )}
        </div>
      ),
    },
  ]

  const DashboardView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Compliance & Policies</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Maintain organizational standards, manage versioning, and track employee acknowledgements across all corporate directives.
            </p>
          </div>
          {isHR && (
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
              >
                <HiFolderPlus className="h-4 w-4" /> Add Category
              </button>
              <button 
                onClick={() => setActiveView('editor')}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <HiPlus className="h-4 w-4" /> New Policy
              </button>
            </div>
          )}
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard title="Total Policies" value="24" subtitle="Across 9 categories" color="blue" icon={HiDocumentText} />
        <StatCard title="Acknowledgement" value="92%" subtitle="Average compliance rate" color="green" icon={HiShieldCheck} />
        <StatCard title="Overdue" value="12" subtitle="Pending acknowledgements" color="orange" icon={HiBellAlert} />
      </div>

      <div className="space-y-6">
        <div className="group relative rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Policy name, category or ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:outline-none appearance-none transition-all">
                <option>All Categories</option>
                {POLICY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Button label="Filters" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px]" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Policy Registry</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Records</div>
            </div>
          </div>
          <Table columns={columns} data={filtered} pageSize={5} />
        </div>
      </div>
    </div>
  )

  const EditorView = () => (
    <div className="animate-in slide-in-from-right-10 duration-500 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200"
          >
            <HiChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedPolicy?.name || 'New Policy Directive'}</h2>
            <p className="text-sm text-slate-500">{selectedPolicy?.category || 'Creating new document'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button label="Save Draft" variant="ghost" icon={HiPencilSquare} />
          <Button label="Publish" variant="primary" icon={HiShieldCheck} />
          <Button label="Download PDF" variant="secondary" icon={HiArrowDownTray} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content Sections */}
        <div className="lg:col-span-3 space-y-8">
          {[
            { title: 'Policy Introduction', content: 'Provide a high-level overview of the policy purpose and historical context.' },
            { title: 'Purpose', content: 'Clearly state what this policy aims to achieve and why it is being implemented.' },
            { title: 'Scope', content: 'Define which employees, departments, or locations this policy applies to.' },
            { title: 'Definitions', content: 'Key terms used within the document that require specific interpretation.' },
            { title: 'Rules & Procedures', content: 'Detailed step-by-step instructions or behavioral standards required.' },
            { title: 'Exceptions', content: 'Conditions under which this policy may not apply or special permissions.' }
          ].map((section, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#0F766E]/30">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0F766E]" /> {section.title}
              </h3>
              <div className="min-h-[120px] rounded-xl bg-slate-50/50 p-4 border border-dashed border-slate-200 text-slate-400 italic text-sm">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Document Meta</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-[10px] font-black text-slate-400 uppercase">Version No</div>
                <div className="text-sm font-bold text-slate-700">v2.4</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-[10px] font-black text-slate-400 uppercase">Last Edited</div>
                <div className="text-sm font-bold text-slate-700">May 05, 2026</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-[10px] font-black text-slate-400 uppercase">Edited By</div>
                <div className="text-sm font-bold text-slate-700">HR Admin (Sarah)</div>
              </div>
              <Button label="View History" icon={HiArrowPath} variant="ghost" className="w-full text-xs" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Audience Settings</h3>
            <div className="space-y-3">
              {['All employees', 'Specific departments', 'Specific roles', 'New joiners only'].map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-50 p-2 transition-all hover:bg-emerald-50">
                  <input type="radio" name="audience" className="h-4 w-4 border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
                  <span className="text-xs font-medium text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
            <HiArrowDownTray className="h-8 w-8 text-emerald-400/50" />
            <h3 className="mt-4 font-bold">Assets & Forms</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">Attach supplementary PDF forms or internal Word templates.</p>
            <button className="mt-6 w-full rounded-xl bg-white/10 py-3 text-xs font-bold text-white transition-all hover:bg-white/20 border border-white/10">
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const TrackingView = () => (
    <div className="animate-in slide-in-from-right-10 duration-500 space-y-6">
       <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200"
          >
            <HiChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Acknowledgement Tracking</h2>
            <p className="text-sm text-slate-500">{selectedPolicy?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button label="Send Reminders" variant="secondary" icon={HiBellAlert} />
          <Button label="Export Status" variant="ghost" icon={HiArrowDownTray} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">Employee Compliance Log</div>
            <Badge label="92% Completion" color="green" />
          </div>
        </div>
        <Table 
          columns={[
            {
              key: 'name',
              label: 'Employee Name',
              render: (_, row) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                    {row.name.charAt(0)}
                  </div>
                  <div className="font-semibold text-slate-900">{row.name}</div>
                </div>
              )
            },
            { key: 'empId', label: 'Employee ID' },
            { key: 'department', label: 'Department' },
            { key: 'role', label: 'Job Title' },
            {
              key: 'status',
              label: 'Status',
              render: (v) => <Badge label={v} color={v === 'Acknowledged' ? 'green' : v === 'Pending' ? 'orange' : 'gray'} variant="outline" />
            },
            { key: 'date', label: 'Acknowledged On' }
          ]} 
          data={employees.slice(0, 10).map((e, idx) => ({
            name: e.name,
            empId: e.empId,
            department: e.department,
            role: e.role,
            status: idx % 4 === 0 ? 'Pending' : idx % 7 === 0 ? 'Not Applicable' : 'Acknowledged',
            date: idx % 4 === 0 ? '—' : '2026-05-02'
          }))} 
          pageSize={10} 
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-[600px]">
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'editor' && <EditorView />}
      {activeView === 'tracking' && <TrackingView />}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Policy Category" size="md">
        <div className="space-y-4">
          <Input label="Category Name" placeholder="e.g., Remote Operations" />
          <div className="w-full">
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon Representation</label>
            <div className="grid grid-cols-4 gap-2">
              {[HiDocumentText, HiShieldCheck, HiUserGroup, HiClock].map((Icon, i) => (
                <button key={i} className="flex h-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-all hover:border-[#0F766E] hover:text-[#0F766E]">
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
            <Button label="Add Category" variant="primary" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
