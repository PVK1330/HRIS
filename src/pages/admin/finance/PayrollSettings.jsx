import React, { useState } from 'react';
import { 
  HiHome, 
  HiChevronRight, 
  HiArrowUpTray, 
  HiChevronDown,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiTrash,
  HiChevronUpDown,
  HiPlus,
  HiCog6Tooth,
  HiArrowsUpDown,
  HiDocumentText,
  HiClock,
  HiMinusCircle,
  HiTag
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Table } from '../../../components/ui/Table.jsx';

const additionsData = [
  { id: 1, name: 'Leave Balance Amount', category: 'Monthly Remuneration', amount: '$5' },
  { id: 2, name: 'Arrears of Salary', category: 'Additional Remuneration', amount: '$8' },
  { id: 3, name: 'Gratuity', category: 'Monthly Remuneration', amount: '$20' },
];

const overtimeData = [
  { id: 1, name: 'Normal day OT 1.5x', rate: 'Hourly 1.5' },
  { id: 2, name: 'Public holiday OT 3.0x', rate: 'Hourly 3' },
  { id: 3, name: 'Rest day OT 2.0x', rate: 'Hourly 2' },
];

const deductionsData = [
  { id: 1, name: 'Absent amount', amount: '$12' },
  { id: 2, name: 'Advance', amount: '$7' },
  { id: 3, name: 'Unpaid leave', amount: '$3' },
];

export default function PayrollSettings() {
  const [activeTab, setActiveTab] = useState('Additions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tabs = ['Additions', 'Overtime', 'Deductions'];

  const columns = [
    {
      key: 'checkbox',
      label: <input type="checkbox" className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />,
      render: () => <input type="checkbox" className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
    },
    {
      key: 'name',
      label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Name <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
      render: (v) => <span className="font-bold text-slate-900">{v}</span>
    },
    ...(activeTab === 'Additions' ? [{
      key: 'category',
      label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Category <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
      render: (v) => <span className="text-slate-500 font-medium">{v}</span>
    }] : []),
    {
      key: activeTab === 'Overtime' ? 'rate' : 'amount',
      label: <div className="text-right inline-flex items-center gap-1.5 w-full justify-end uppercase tracking-wider text-[11px] font-bold">
        {activeTab === 'Overtime' ? 'Rate' : 'Amount'} <HiArrowsUpDown className="h-3 w-3 opacity-45" />
      </div>,
      render: (v) => <div className="text-right font-black text-[#0F766E]">{v}</div>
    },
    {
      key: 'actions',
      label: <div className="text-right">Actions</div>,
      render: () => (
        <div className="flex justify-end gap-1">
          <button className="p-2 text-slate-400 hover:text-[#0F766E] hover:bg-emerald-50 rounded-none transition-all"><HiPencilSquare className="h-4 w-4" /></button>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-all"><HiTrash className="h-4 w-4" /></button>
        </div>
      )
    }
  ];

  const data = activeTab === 'Additions' ? additionsData : activeTab === 'Overtime' ? overtimeData : deductionsData;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      
      {/* Top Title Bar - Sync with Employee Directory */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">Payroll Items</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Payroll</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Payroll Items</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiArrowUpTray className="h-4 w-4" /> Export <HiChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid - Sync with Employee Directory */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL ADDITIONS', count: '12 Items', bgColor: 'bg-[#0F172A]', icon: HiDocumentText },
          { label: 'AVG OT RATE', count: '1.5x', bgColor: 'bg-[#10B981]', icon: HiClock },
          { label: 'ACTIVE DEDUCTIONS', count: '8 Items', bgColor: 'bg-[#EF4444]', icon: HiMinusCircle },
          { label: 'SYSTEM TAGS', count: '3', bgColor: 'bg-[#3B82F6]', icon: HiTag }
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
          <h2 className="text-sm font-semibold text-white">{activeTab} Configuration</h2>
        </div>

        {/* Filter Section (Tabs + Search) */}
        <div className="space-y-4 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 bg-slate-100/50 p-1 rounded-none ring-1 ring-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-[#0F766E] shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0F766E] hover:bg-[#0c6b64] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-none font-bold uppercase tracking-wider text-[10px] text-white shadow-sm transition-all"
            >
              <HiPlus className="h-4 w-4 stroke-2" />
              Add {activeTab.slice(0, -1)}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Show</span>
              <select 
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="h-9 rounded-none border border-slate-200 bg-white px-2 focus:border-[#0F766E] outline-none font-bold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>Entries</span>
            </div>
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full sm:w-64 rounded-none border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="relative">
          <Table columns={columns} data={data} square className="rounded-none border-0" />
          
          <div className="border-t border-slate-100 p-4 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <div>Showing 1 - {data.length} of {data.length} entries</div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-none border border-slate-200 hover:bg-slate-50 transition-colors"><HiChevronRight className="h-4 w-4 rotate-180" /></button>
              <button className="h-8 w-8 rounded-none bg-[#0F766E] text-white flex items-center justify-center shadow-lg shadow-[#0F766E]/20">1</button>
              <button className="p-1.5 rounded-none border border-slate-200 hover:bg-slate-50 transition-colors"><HiChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Settings Gear */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <button className="flex h-10 w-10 items-center justify-center rounded-none bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/20 transition-all">
              <HiCog6Tooth className="h-6 w-6 animate-spin-slow" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals - Standardized */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add ${activeTab.slice(0, -1)}`}
        size="md"
        square
      >
        <form className="p-4 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name / Title</label>
            <input type="text" placeholder="Enter identifier" className="h-10 w-full rounded-none border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none" />
          </div>

          {activeTab === 'Additions' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
              <select className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none">
                <option>Monthly Remuneration</option>
                <option>Additional Remuneration</option>
              </select>
            </div>
          )}

          {activeTab === 'Overtime' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rate Type</label>
              <select className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none">
                <option>Select Type</option>
                <option>Hourly</option>
                <option>Fixed</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 items-end">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{activeTab === 'Overtime' ? 'Rate Value' : 'Monetary Amount'}</label>
              <input type="text" placeholder="0.00" className="h-10 w-full rounded-none border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none" />
            </div>
            {activeTab !== 'Overtime' && (
              <div className="flex flex-col items-center gap-2 pb-1 border border-slate-100 bg-slate-50/50 p-2 rounded-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Calc</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {['No Assignee', 'All Employees', 'Select Employee'].map((opt, i) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="assignee" defaultChecked={i === 0} className="h-4 w-4 border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{opt}</span>
              </label>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-2 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors rounded-none">Discard</button>
            <button type="submit" className="px-10 py-2 text-sm font-semibold text-white bg-[#1C242E] hover:bg-black transition-colors rounded-none shadow-sm">Commit Item</button>
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
