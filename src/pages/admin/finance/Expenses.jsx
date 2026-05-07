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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Expense Management</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Streamline reimbursement workflows, track corporate spend, and manage multi-level approvals with digital receipt capture.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
              <HiPlus className="h-4 w-4" /> New Claim
            </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Status Filter Cards */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Filters</p>
          {[
            { label: 'All', count: expenseClaims.length, icon: HiReceiptPercent, color: 'slate' },
            { label: 'Pending', count: stats.pending, icon: HiClock, color: 'orange' },
            { label: 'Approved', count: stats.approved, icon: HiCheckBadge, color: 'emerald' },
            { label: 'Rejected', count: stats.rejected, icon: HiXCircle, color: 'red' },
            { label: 'Paid', count: stats.paid, icon: HiBanknotes, color: 'blue' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveStatus(item.label)}
              className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all hover:scale-[1.02] active:scale-95 ${
                activeStatus === item.label 
                ? 'border-[#0F766E] bg-emerald-50/50 shadow-md ring-1 ring-[#0F766E]' 
                : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-700">{item.label} Claims</div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-tight">Show Count</div>
                </div>
              </div>
              <div className={`text-lg font-black ${activeStatus === item.label ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                {item.count}
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="group relative rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name, ID, or Expense Type..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Type</label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:outline-none appearance-none transition-all">
                  <option>All Types</option>
                  {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <Button label="Filters" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px]" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Claims registry ({filtered.length})</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Ledger</div>
              </div>
            </div>
            <Table columns={columns} data={filtered} pageSize={8} />
          </div>
        </div>
      </div>

      {/* Review Claim Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Review Expense Claim" size="xl">
        <div className="animate-in fade-in duration-500 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E]/10 text-[#0F766E]">
                <HiCurrencyDollar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedClaim?.employee}</h3>
                <p className="text-sm text-slate-500">ID: {selectedClaim?.empId || 'EMP-102'} • Operations Manager</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Type</p>
                <p className="font-bold text-slate-700">{selectedClaim?.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                <p className="text-lg font-black text-[#0F766E]">£{selectedClaim?.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                <p className="font-bold text-slate-700">{selectedClaim?.submitted}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                <p className="font-bold text-slate-700">Bank Transfer</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Reason</p>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-600 leading-relaxed">
                {selectedClaim?.description || 'Client entertainment during the Q3 quarterly review session in London. Includes travel and dinner expenses for the executive team.'}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              {isHR && selectedClaim?.status === 'Pending' && (
                <>
                  <Button label="Reject Claim" variant="ghost" className="flex-1 text-red-600 hover:bg-red-50" icon={HiXCircle} />
                  <Button label="Approve Claim" variant="primary" className="flex-1 shadow-lg shadow-emerald-900/20" icon={HiDocumentCheck} />
                </>
              )}
              {isHR && selectedClaim?.status === 'Approved' && (
                <Button label="Process Payment" variant="primary" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20" icon={HiBanknotes} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Attachments</span>
                <HiPaperClip className="h-4 w-4" />
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Receipt_INV_902.pdf', size: '1.2 MB', type: 'Invoice' },
                  { name: 'Train_Ticket.jpg', size: '450 KB', type: 'Ticket' }
                ].map((file, i) => (
                  <div key={i} className="group flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-sm transition-all hover:border-[#0F766E]/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <HiReceiptPercent className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate text-xs font-bold text-slate-700">{file.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{file.type} • {file.size}</div>
                      </div>
                    </div>
                    <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#0F766E] transition-all">
                      <HiArrowDownTray className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-center text-slate-400 italic">Click to preview or download assets</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Workflow Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Claim Submitted', date: 'Oct 12', completed: true },
                  { label: 'Manager Approved', date: 'Oct 14', completed: true },
                  { label: 'Finance Review', date: 'Pending', completed: false }
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`h-4 w-4 rounded-full border-2 ${step.completed ? 'bg-[#0F766E] border-[#0F766E]' : 'border-slate-200'}`} />
                      {i < 2 && <div className="h-8 w-0.5 bg-slate-100" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${step.completed ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</div>
                      <div className="text-[10px] text-slate-400">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* New Claim Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Expense Claim" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="w-full">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Category</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:outline-none appearance-none transition-all"
                required
              >
                <option value="" disabled hidden>Select Category</option>
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Expense</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
                required
              />
            </div>
            <div className="col-span-2">
              <Input 
                label="Claim Amount (£)" 
                name="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Business Reason</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                rows={3}
                placeholder="Provide context for the expense..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receipt Uploads</p>
            <FileUpload 
              label="Attachments" 
              helpText="Upload invoices or tickets (PDF, JPG, PNG)"
              multiple 
              accept=".pdf,.jpg,.png"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
            <Button type="submit" label="Submit for Approval" variant="primary" className="px-8 shadow-lg shadow-emerald-900/20" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
