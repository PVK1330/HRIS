import { useMemo, useState } from 'react'
import { 
  HiReceiptPercent, 
  HiClock, 
  HiCheckBadge, 
  HiXCircle, 
  HiCurrencyDollar, 
  HiPlus, 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiChevronRight,
  HiArrowDownTray,
  HiEye,
  HiPaperClip,
  HiBanknotes,
  HiDocumentCheck
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { expenseClaims } from '../../../data/mockData.js'

const EXPENSE_TYPES = ['Travel', 'Meals', 'Accommodation', 'Equipment', 'Training', 'Medical', 'Communication', 'Other']

const initialFormData = {
  type: '',
  date: '',
  amount: '',
  description: '',
  receipts: []
}

export default function Expenses() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [formData, setFormData] = useState(initialFormData)

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

  const stats = useMemo(() => {
    return {
      pending: expenseClaims.filter(e => e.status === 'Pending').length,
      approved: expenseClaims.filter(e => e.status === 'Approved').length,
      rejected: expenseClaims.filter(e => e.status === 'Rejected').length,
      paid: expenseClaims.filter(e => e.status === 'Paid').length
    }
  }, [])

  const filtered = useMemo(() => {
    let data = expenseClaims
    if (activeStatus !== 'All') {
      data = data.filter(e => e.status === activeStatus)
    }
    const query = q.trim().toLowerCase()
    if (query) {
      data = data.filter((e) => `${e.employee} ${e.category} ${e.id}`.toLowerCase().includes(query))
    }
    return data
  }, [q, activeStatus])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.empId || 'EMP-102'}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'category', 
      label: 'Expense Type',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>
    },
    { key: 'department', label: 'Department', render: () => 'Operations' },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => <span className="font-bold text-slate-900">£{v.toLocaleString()}</span>,
    },
    { key: 'submitted', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Approved' ? 'green' : v === 'Pending' ? 'orange' : v === 'Rejected' ? 'red' : 'blue'} variant="outline" />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          label="View"
          variant="ghost"
          size="sm"
          icon={HiEye}
          className="hover:bg-slate-100"
          onClick={() => {
            setSelectedClaim(row)
            setReviewModalOpen(true)
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Standardized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Expense Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Finance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Disbursement Registry</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" /> New Claim
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 min-w-0">
        {[
          { label: 'TOTAL CLAIMS', count: expenseClaims.length, icon: HiReceiptPercent, bgColor: 'bg-[#0F172A]', status: 'All' },
          { label: 'PENDING REVIEW', count: stats.pending, icon: HiClock, bgColor: 'bg-[#F59E0B]', status: 'Pending' },
          { label: 'APPROVED', count: stats.approved, icon: HiCheckBadge, bgColor: 'bg-[#10B981]', status: 'Approved' },
          { label: 'DECLINED', count: stats.rejected, icon: HiXCircle, bgColor: 'bg-[#EF4444]', status: 'Rejected' },
          { label: 'DISBURSED', count: stats.paid, icon: HiBanknotes, bgColor: 'bg-[#3B82F6]', status: 'Paid' }
        ].map((card, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStatus(card.status)}
            className={`flex items-center gap-3.5 rounded-none border p-4 shadow-sm min-w-0 transition-all ${
              activeStatus === card.status ? 'border-[#0F766E] bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Workspace Area */}
      <div className="space-y-6 min-w-0">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <div className="flex flex-col gap-6 md:flex-row md:items-end min-w-0">
            <div className="flex-1 min-w-0">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 truncate">Search Registry</label>
              <div className="relative min-w-0">
                <HiMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ENTER EMPLOYEE IDENTIFIER..."
                  className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64 shrink-0">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 truncate">Disbursement Type</label>
              <select className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all cursor-pointer">
                <option>ALL CLASSIFICATIONS</option>
                {EXPENSE_TYPES.map(t => <option key={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <button className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
               REFINE
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider truncate">Claims Registry ({filtered.length})</h2>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">Digital Ledger</div>
          </div>
          <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
        </div>
      </div>

      {/* Review Claim Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Audit Claim Details" size="xl">
        <div className="animate-in fade-in duration-500 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-6 border-b border-slate-100 pb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-none bg-slate-900 text-white shadow-lg">
                <HiCurrencyDollar className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedClaim?.employee}</h3>
                <p className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest mt-1">ID: {selectedClaim?.empId || 'EMP-102'} • OPERATIONS SPECIALIST</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Classification</p>
                <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">{selectedClaim?.category}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Amount</p>
                <p className="text-2xl font-black text-[#0F766E]">£{selectedClaim?.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</p>
                <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">{selectedClaim?.submitted}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Method</p>
                <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">ELECTRONIC TRANSFER</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Rationale</p>
              <div className="rounded-none bg-slate-50 p-6 border border-slate-200 text-sm text-slate-600 leading-relaxed font-medium">
                {selectedClaim?.description || 'Client entertainment during the Q3 quarterly review session in London. Includes travel and dinner expenses for the executive team.'}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex gap-4">
              {isHR && selectedClaim?.status === 'Pending' && (
                <>
                  <button className="flex-1 h-12 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
                     DECLINE CLAIM
                  </button>
                  <button className="flex-1 h-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all">
                     APPROVE DISBURSEMENT
                  </button>
                </>
              )}
              {isHR && selectedClaim?.status === 'Approved' && (
                <button className="flex-1 h-12 rounded-none bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all">
                   EXECUTE PAYMENT
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-none border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Verification Assets</span>
                <HiPaperClip className="h-4 w-4" />
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Receipt_INV_902.pdf', size: '1.2 MB', type: 'Invoice' },
                  { name: 'Train_Ticket.jpg', size: '450 KB', type: 'Ticket' }
                ].map((file, i) => (
                  <div key={i} className="group flex items-center justify-between rounded-none bg-white p-4 border border-slate-200 shadow-sm hover:border-[#0F766E] transition-all cursor-pointer">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-slate-900 text-white">
                        <HiReceiptPercent className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate text-[11px] font-black text-slate-900 uppercase">{file.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{file.type} • {file.size}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[10px] text-center text-slate-400 font-black uppercase tracking-widest">SECURE ASSET REPOSITORY</p>
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Audit Trail</h3>
              <div className="space-y-6">
                {[
                  { label: 'Claim Submitted', date: 'Oct 12', completed: true },
                  { label: 'Manager Approved', date: 'Oct 14', completed: true },
                  { label: 'Finance Review', date: 'Pending', completed: false }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`h-3 w-3 rounded-none ${step.completed ? 'bg-[#0F766E]' : 'bg-slate-200'}`} />
                      {i < 2 && <div className="h-8 w-px bg-slate-100" />}
                    </div>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${step.completed ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* New Claim Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Provision New Disbursement" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="w-full">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Classification</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 px-4 text-[11px] font-black uppercase focus:border-[#0F766E] focus:bg-white outline-none transition-all cursor-pointer"
                required
              >
                <option value="" disabled hidden>SELECT CATEGORY</option>
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="w-full">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 px-4 text-[11px] font-black focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Disbursement (£)</label>
              <input 
                name="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleFormChange}
                className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 px-4 text-[11px] font-black focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Rationale</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full rounded-none border border-slate-200 bg-slate-50/50 px-4 py-4 text-sm font-medium focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                rows={4}
                placeholder="ENTER DETAILED RATIONALE..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Assets</p>
            <div className="rounded-none border-2 border-dashed border-slate-200 bg-slate-50/30 p-8 flex flex-col items-center justify-center group hover:border-[#0F766E] transition-all cursor-pointer">
               <HiPaperClip className="h-8 w-8 text-slate-300 group-hover:text-[#0F766E] transition-colors" />
               <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">DRAG ASSETS OR CLICK TO UPLOAD</p>
               <p className="mt-1 text-[9px] font-bold text-slate-300 uppercase tracking-tight">PDF, JPG, PNG (MAX 10MB)</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={() => setModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
               CANCEL
            </button>
            <button type="submit" className="h-12 px-10 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all">
               SUBMIT DISBURSEMENT
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
