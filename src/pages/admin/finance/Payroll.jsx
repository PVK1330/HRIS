import React, { useState, useMemo } from 'react';
import { 
  HiHome,
  HiPlus,
  HiArrowUpTray,
  HiChevronDown,
  HiMagnifyingGlass,
  HiCog6Tooth,
  HiArrowsUpDown,
  HiUserGroup,
  HiCheckBadge,
  HiUserCircle,
  HiPencilSquare,
  HiTrash,
  HiCurrencyDollar
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Table } from '../../../components/ui/Table.jsx';

// Mock data for the table
const initialEmployees = [
  { id: 'Emp-001', name: 'Anthony Lewis', designation: 'Finance', email: 'anthony@example.com', phone: '(123) 4567 890', joiningDate: '12 Sep 2024', salary: '$40,000', avatar: 'https://i.pravatar.cc/150?u=Emp-001' },
  { id: 'Emp-002', name: 'Brian Villalobos', designation: 'Developer', email: 'brian@example.com', phone: '(179) 7382 829', joiningDate: '24 Oct 2024', salary: '$35,000', avatar: 'https://i.pravatar.cc/150?u=Emp-002' },
  { id: 'Emp-003', name: 'Harvey Smith', designation: 'Developer', email: 'harvey@example.com', phone: '(184) 2719 738', joiningDate: '18 Feb 2024', salary: '$20,000', avatar: 'https://i.pravatar.cc/150?u=Emp-003' },
  { id: 'Emp-004', name: 'Stephan Peralt', designation: 'Executive Officer', email: 'peralt@example.com', phone: '(193) 7839 748', joiningDate: '17 Oct 2024', salary: '$22,000', avatar: 'https://i.pravatar.cc/150?u=Emp-004' },
  { id: 'Emp-005', name: 'Doglas Martini', designation: 'Manager', email: 'martniwr@example.com', phone: '(183) 9302 890', joiningDate: '20 Jul 2024', salary: '$25,000', avatar: 'https://i.pravatar.cc/150?u=Emp-005' },
];

export default function Payroll() {
  const [employees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dept, setDept] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const columns = [
    {
      key: 'checkbox',
      label: <input type="checkbox" className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />,
      render: () => <input type="checkbox" className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
    },
    {
      key: 'id',
      label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Emp ID <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
      render: (v) => <span className="font-semibold text-slate-700">{v}</span>
    },
    {
      key: 'name',
      label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Name <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
      render: (v, row) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar name={v} src={row.avatar} size="sm" className="rounded-none ring-1 ring-slate-200" />
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate">{v}</div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{row.designation}</div>
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email', render: (v) => <span className="text-slate-600">{v}</span> },
    { key: 'phone', label: 'Phone', render: (v) => <span className="text-slate-600">{v}</span> },
    { key: 'joiningDate', label: 'Joining Date', render: (v) => <span className="text-slate-600">{v}</span> },
    { 
      key: 'salary', 
      label: <div className="text-right">Salary</div>, 
      render: (v) => <div className="text-right font-black text-[#0F766E]">{v}</div> 
    },
    {
      key: 'actions',
      label: <div className="text-right">Action</div>,
      render: () => (
        <div className="flex justify-end gap-1">
          <button className="p-2 text-slate-400 hover:text-[#0F766E] hover:bg-emerald-50 transition-all rounded-none"><HiPencilSquare className="h-4 w-4" /></button>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-none"><HiTrash className="h-4 w-4" /></button>
        </div>
      )
    }
  ];

  const data = filteredEmployees;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      
      {/* Top Title Bar - Sync with Employee Directory */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">Employee Salary</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Payroll</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Employee Salary</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiArrowUpTray className="h-4 w-4" /> Export <HiChevronDown className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" /> Add Salary
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid - Sync with Employee Directory */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL SALARY PAID', count: '$182,231', bgColor: 'bg-[#0F172A]', icon: HiCurrencyDollar },
          { label: 'ACTIVE PAYROLL', count: '142', bgColor: 'bg-[#10B981]', icon: HiCheckBadge },
          { label: 'ON HOLD', count: '12', bgColor: 'bg-[#EF4444]', icon: HiUserCircle },
          { label: 'NEW ADDITIONS', count: '5', bgColor: 'bg-[#3B82F6]', icon: HiPlus }
        ].map((card, idx) => (
          <button
            key={idx}
            className="group flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 text-left transition-all hover:bg-slate-50/50 min-w-0 shadow-sm active:scale-[0.99]"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider truncate text-slate-400">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Listing Card - Sync with Employee Directory */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        {/* Emerald Header */}
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Salary List</h2>
        </div>

        {/* Filters Section */}
        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select value={dept} onChange={(e) => setDept(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Departments</option>
              <option value="finance">Finance</option>
              <option value="it">IT Department</option>
            </select>

            <select className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Designations</option>
            </select>

            <select className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Statuses</option>
            </select>

            <select className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">Payment Status</option>
            </select>

            <select className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">Work Mode</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{filteredEmployees.length} records shown</p>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setDept(''); }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="relative">
          <Table
            columns={columns}
            data={filteredEmployees}
            pageSize={8}
            square
            className="rounded-none border-0"
          />
          
          {/* Settings Floating Widget */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <button className="flex h-10 w-10 items-center justify-center rounded-none bg-[#0F766E] text-white shadow-lg hover:bg-[#0c6b64] transition-all">
              <HiCog6Tooth className="h-6 w-6 animate-spin-slow" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Salary Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Employee Salary"
        size="2xl"
        square
      >
        <form className="p-4 space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee Asset</label>
              <select className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none">
                <option>Select Beneficiary</option>
                {employees.map(e => <option key={e.id}>{e.name} ({e.id})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Net Terminal Salary</label>
              <input type="text" placeholder="0.00" className="h-10 w-full rounded-none border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none shadow-sm" />
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
               <h3 className="text-[11px] font-black text-[#0F766E] uppercase tracking-[0.2em] border-l-4 border-[#0F766E] pl-3">Operational Earnings</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {['Basic', 'DA(40%)', 'HRA(15%)', 'Conveyance', 'Allowance', 'Medical', 'Others'].map(l => (
                 <div key={l} className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{l}</label>
                   <input type="text" placeholder="0" className="h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-[#0F766E] outline-none" />
                 </div>
               ))}
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
               <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] border-l-4 border-red-600 pl-3">Regulatory Deductions</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {['TDS', 'ESI', 'PF', 'Leave', 'Prof.Tax', 'Labour Welfare', 'Others'].map(l => (
                 <div key={l} className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{l}</label>
                   <input type="text" placeholder="0" className="h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-red-500 outline-none" />
                 </div>
               ))}
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-2 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors rounded-none">Discard</button>
            <button type="submit" className="px-10 py-2 text-sm font-semibold text-white bg-[#1C242E] hover:bg-black transition-colors rounded-none shadow-sm">Commit Entry</button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
