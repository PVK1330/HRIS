import { useMemo, useState } from 'react'
import { 
  HiPlus, 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiEye,
  HiPencilSquare,
  HiTrash,
  HiEnvelope,
  HiUserGroup,
  HiDocumentText,
  HiClock,
  HiCheckBadge,
  HiArrowPathRoundedSquare,
  HiCodeBracket,
  HiUsers
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees, letterTemplates, lettersKpis } from '../../../data/mockData.js'

export default function LettersTemplates() {
  const [q, setQ] = useState('')
  const [activeTab, setActiveTab] = useState('Templates') // Templates, History
  const [modalOpen, setModalOpen] = useState(false) // New Template
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  const placeholders = [
    { tag: '{{employee_name}}', desc: 'Full name of the employee' },
    { tag: '{{employee_id}}', desc: 'Unique employee identification' },
    { tag: '{{job_title}}', desc: 'Designation of the employee' },
    { tag: '{{department}}', desc: 'Department name' },
    { tag: '{{joining_date}}', desc: 'Date of joining' },
    { tag: '{{salary}}', desc: 'Gross monthly salary' },
    { tag: '{{today_date}}', desc: 'Current date' },
    { tag: '{{company_name}}', desc: 'Standard company legal name' }
  ]

  const filteredTemplates = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return letterTemplates
    return letterTemplates.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(query))
  }, [q])

  const templateColumns = [
    {
      key: 'name',
      label: 'Template Name',
      render: (v) => <span className="font-bold text-slate-800">{v}</span>,
    },
    { key: 'category', label: 'Category' },
    { key: 'updatedAt', label: 'Last Updated' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Active' ? 'green' : 'orange'} variant="outline" />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button 
            label="Use" 
            variant="primary" 
            size="sm" 
            icon={HiEnvelope} 
            className="bg-[#0F766E] border-none"
            onClick={() => {
               setSelectedTemplate(row)
               setSendModalOpen(true)
            }}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={HiPencilSquare} 
            className="text-slate-400 hover:text-emerald-600"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={HiTrash} 
            className="text-slate-400 hover:text-red-600"
          />
        </div>
      ),
    },
  ]

  const historyColumns = [
    { key: 'employee', label: 'Recipient' },
    { key: 'template', label: 'Letter Type' },
    { key: 'sentBy', label: 'Sent By' },
    { key: 'sentAt', label: 'Date Sent' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color="green" />,
    },
    {
      key: 'view',
      label: 'Preview',
      render: () => <Button variant="ghost" size="sm" icon={HiEye} />,
    },
  ]

  const mockHistory = [
    { employee: 'John Smith', template: 'Offer Letter', sentBy: 'Admin', sentAt: '12/04/2026', status: 'Delivered' },
    { employee: 'Sarah Johnson', template: 'Salary Certificate', sentBy: 'HR Admin', sentAt: '10/04/2026', status: 'Delivered' },
    { employee: 'Michael Brown', template: 'Experience Letter', sentBy: 'Admin', sentAt: '05/04/2026', status: 'Delivered' }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">LETTERS & TEMPLATES</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Standardize HR communications with dynamic templates. Create, automate, and track every letter sent to your workforce.
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
             >
               <HiUsers className="h-4 w-4" /> Bulk Dispatch
             </button>
             <button 
               onClick={() => setModalOpen(true)}
               className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
             >
               <HiPlus className="h-4 w-4" /> New Template
             </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="space-y-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Library Navigation</p>
           {[
             { id: 'Templates', label: 'Template Library', count: lettersKpis.templates, icon: HiDocumentText, color: 'emerald' },
             { id: 'History', label: 'Dispatch History', count: lettersKpis.generatedThisMonth, icon: HiClock, color: 'blue' },
             { id: 'Pending', label: 'Pending Signature', count: lettersKpis.pendingSignatures, icon: HiCheckBadge, color: 'orange' }
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all hover:scale-[1.02] active:scale-95 ${
                 activeTab === item.id 
                 ? 'border-[#0F766E] bg-emerald-50/50 shadow-md ring-1 ring-[#0F766E]' 
                 : 'border-slate-200 bg-white hover:border-slate-300'
               }`}
             >
               <div className="flex items-center gap-3">
                 <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                   <item.icon className="h-5 w-5" />
                 </div>
                 <div className="text-left">
                   <div className="text-sm font-bold text-slate-700">{item.label}</div>
                   <div className="text-[10px] text-slate-400 font-medium tracking-tight">Active Vault</div>
                 </div>
               </div>
               <div className={`text-lg font-black ${activeTab === item.id ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                 {item.count}
               </div>
             </button>
           ))}

           <div className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <HiCodeBracket className="h-4 w-4" /> Dynamic Tags
              </h3>
              <div className="space-y-3">
                 {placeholders.slice(0, 5).map(p => (
                    <div key={p.tag} className="flex flex-col gap-0.5">
                       <code className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit">{p.tag}</code>
                       <span className="text-[10px] text-slate-400 font-medium italic">{p.desc}</span>
                    </div>
                 ))}
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic text-center">Use these tags in template body for auto-fill</p>
           </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 space-y-6">
           <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
             <div className="flex flex-col gap-4 md:flex-row md:items-end">
               <div className="flex-1">
                 <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Vault</label>
                 <div className="relative">
                   <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                   <input
                     type="text"
                     placeholder="Search templates or categories..."
                     className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                     value={q}
                     onChange={(e) => setQ(e.target.value)}
                   />
                 </div>
               </div>
               <Button label="FILTERS" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px] border border-slate-200" />
             </div>
           </div>

           <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="bg-[#0F766E] px-6 py-3 text-white flex items-center justify-between">
                 <h2 className="text-sm font-bold uppercase tracking-wider">
                    {activeTab === 'History' ? 'Dispatch Registry' : 'Template Library'}
                 </h2>
                 <HiDocumentText className="h-4 w-4 opacity-50" />
              </div>
              {activeTab === 'History' ? (
                 <Table columns={historyColumns} data={mockHistory} pageSize={10} />
              ) : (
                 <Table columns={templateColumns} data={filteredTemplates} pageSize={10} />
              )}
           </div>
        </div>
      </div>

      {/* New Template Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Document Template" size="xl">
         <form className="animate-in fade-in duration-500 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
               <div className="col-span-2">
                  <Input label="Template Name" placeholder="e.g. Standard Offer Letter 2026" required />
               </div>
               <div>
                  <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none">
                     <option>Recruitment</option>
                     <option>Compliance</option>
                     <option>Performance</option>
                     <option>Exit</option>
                  </select>
               </div>
               <div>
                  <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Status</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none">
                     <option>Active</option>
                     <option>Draft</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Letter Body (HTML/Markdown Supported)</label>
               <div className="relative">
                  <textarea 
                     className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none min-h-[300px] font-serif leading-relaxed"
                     placeholder="Start drafting your template here. Use {{tags}} for dynamic fields..."
                  />
                  <div className="absolute right-4 bottom-4 flex gap-2">
                     <Button label="Insert Tag" variant="ghost" size="sm" icon={HiCodeBracket} className="bg-slate-50 border border-slate-100" />
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
               <Button type="button" label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
               <Button label="Save Template" variant="primary" className="bg-[#0F766E] px-8 shadow-lg shadow-emerald-900/20" icon={HiPlus} />
            </div>
         </form>
      </Modal>

      {/* Dispatch Letter Modal */}
      <Modal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} title="Dispatch Document" size="lg">
         <div className="animate-in fade-in duration-500 space-y-6">
            <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4 flex items-center gap-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0F766E] shadow-sm">
                  <HiDocumentText className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Selected Template</p>
                  <p className="font-bold text-slate-800">{selectedTemplate?.name}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Recipient</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none">
                     <option value="" disabled hidden>Search employee to send letter...</option>
                     {employees.map(e => <option key={e.id}>{e.name} ({e.empId})</option>)}
                  </select>
               </div>

               <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Letter Preview</h3>
                     <Button label="Edit Content" variant="ghost" size="sm" icon={HiPencilSquare} />
                  </div>
                  <div className="text-sm text-slate-600 font-serif leading-relaxed line-clamp-6">
                     Dear <span className="text-emerald-700 font-bold bg-emerald-50 px-1">Ananya Sharma</span>,<br/><br/>
                     We are pleased to offer you the position of <span className="text-emerald-700 font-bold bg-emerald-50 px-1">HR Executive</span> at our company. 
                     Your joining date will be <span className="text-emerald-700 font-bold bg-emerald-50 px-1">01/01/2026</span>...
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
               <Button label="Download PDF" variant="ghost" icon={HiEye} />
               <Button label="Dispatch via Email" variant="primary" className="bg-[#0F766E] px-8 shadow-lg shadow-emerald-900/20" icon={HiEnvelope} />
            </div>
         </div>
      </Modal>
    </div>
  )
}
