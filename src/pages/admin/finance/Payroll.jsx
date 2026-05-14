import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  HiCurrencyDollar, 
  HiChartBar, 
  HiArrowDownTray, 
  HiPlay, 
  HiCheckCircle, 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal, 
  HiPlus,
  HiBanknotes,
  HiUserGroup,
  HiShieldCheck,
  HiClock,
  HiEye,
  HiPrinter,
  HiChevronRight,
  HiXMark,
  HiScale,
  HiCalendarDays,
  HiCalculator
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { payrollData, employees } from '../../../data/mockData.js';

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('Summary');
  const [q, setQ] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]?.id || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [empSearch, setEmpSearch] = useState('');
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    basicSalary: '',
    hra: '',
    transportAllowance: '',
    bonus: '',
    pfContribution: '',
    insurance: '',
    otherDeductions: '',
  });

  const filtered = useMemo(() => {
     let data = payrollData;
     const query = q.trim().toLowerCase();
     if (query) {
       data = data.filter((p) => p.name.toLowerCase().includes(query));
     }
     return data;
  }, [q]);

  const handleSelectEmployee = (emp) => {
     setFormData(prev => ({ ...prev, employeeId: emp.id, employeeName: emp.name }));
     setEmpSearch(emp.name);
     setShowEmpDropdown(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEmpSearch('');
  };

  const handleViewPayslip = (empId) => {
     const emp = employees.find(e => e.empId == empId || e.id == empId);
     if (emp) {
        setSelectedEmployee(emp.id);
        setActiveTab('Payslips');
     }
  };

  const columns = [
    {
      key: 'name',
      label: 'Financial Beneficiary',
      render: (v, row) => (
         <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 font-black text-[10px] border border-slate-200">
               {v.charAt(0)}
            </div>
            <div>
               <div className="font-black text-slate-900 uppercase text-[11px] tracking-tight mb-0.5">{v}</div>
               <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{row.department}</div>
            </div>
         </div>
      )
    },
    { 
       key: 'basic', 
       label: 'Base Allocation', 
       render: (v) => <span className="font-black text-slate-600 text-[10px] uppercase">£{v.toLocaleString()}</span> 
    },
    { 
       key: 'allowances', 
       label: 'Operational Increments', 
       render: (v) => <span className="font-black text-emerald-600 text-[10px] uppercase">+£{v.toLocaleString()}</span> 
    },
    { 
       key: 'deductions', 
       label: 'Regulatory Offsets', 
       render: (v) => <span className="font-black text-red-500 text-[10px] uppercase">-£{v.toLocaleString()}</span> 
    },
    { 
       key: 'net', 
       label: 'Terminal Disbursement', 
       render: (v) => <span className="font-black text-slate-900 text-[11px] uppercase">£{v.toLocaleString()}</span> 
    },
    {
       key: 'status',
       label: 'Audit Status',
       render: () => <Badge label="VERIFIED" color="blue" className="rounded-none text-[9px] font-black tracking-widest" />
    },
    {
       key: 'actions',
       label: 'Controls',
       render: (_, row) => (
          <div className="flex items-center gap-3">
             <button 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F766E]" 
                onClick={() => handleViewPayslip(row.id || row.empId)}
             >
                Inspect
             </button>
             <button 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F766E]" 
                onClick={() => handleViewPayslip(row.id || row.empId)}
             >
                Execute Slip
             </button>
          </div>
       )
    }
  ];

  const renderContent = () => {
     if (activeTab === 'Summary') {
        return (
           <div className="space-y-6 animate-in fade-in duration-500">
              {/* KPI Metrics Cards Grid — Matching Employee Directory */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                 {[
                    { label: 'TOTAL DISBURSEMENT', count: '£2.4M', icon: HiBanknotes, bgColor: 'bg-[#0F172A]' },
                    { label: 'ASSETS PAID', count: '142', icon: HiUserGroup, bgColor: 'bg-[#10B981]' },
                    { label: 'PENDING AUDIT', count: '12', icon: HiShieldCheck, bgColor: 'bg-[#F59E0B]' },
                    { label: 'TAX COMPLIANCE', count: '100%', icon: HiScale, bgColor: 'bg-[#3B82F6]' }
                 ].map((card, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 text-left shadow-sm">
                       <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                          <card.icon className="h-5 w-5" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate leading-none">
                             {card.label}
                          </div>
                          <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                 <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Financial Registry – {selectedMonth}</h2>
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                          <input
                             type="text"
                             value={q}
                             onChange={(e) => setQ(e.target.value)}
                             placeholder="Search Registry..."
                             className="h-8 w-64 rounded-none border border-white/20 bg-white/10 px-3 pl-9 text-xs text-white placeholder-white/40 outline-none transition focus:border-white focus:bg-white/20 font-medium"
                          />
                       </div>
                       <button className="text-white/80 hover:text-white transition-colors">
                          <HiAdjustmentsHorizontal className="h-5 w-5" />
                       </button>
                    </div>
                 </div>
                 <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
              </div>
           </div>
        );
     }

     if (activeTab === 'Payslips') {
        const emp = employees.find(e => e.id === selectedEmployee) || employees[0];
        return (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 items-end">
                 <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Beneficiary Asset</label>
                    <select 
                       className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
                       value={selectedEmployee}
                       onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                       {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.empId})</option>)}
                    </select>
                 </div>
                 <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Cycle</label>
                    <select 
                       className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
                       value={selectedMonth}
                       onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                       <option>MAY 2026</option>
                       <option>APRIL 2026</option>
                       <option>MARCH 2026</option>
                    </select>
                 </div>
                 <button className="h-10 px-8 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-sm">
                    PREVIEW SLIP
                 </button>
              </div>

              {/* Payslip Template — Minimalist Audit Style */}
              <div className="max-w-4xl mx-auto rounded-none border border-slate-200 bg-white shadow-2xl overflow-hidden mb-12">
                 <div className="bg-slate-50 border-b border-slate-200 p-10 flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-4 mb-4">
                          <div className="h-12 w-12 rounded-none bg-slate-900 flex items-center justify-center text-white font-black text-2xl">M</div>
                          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">MICROLAN CORP</h1>
                       </div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[240px]">FINANCIAL HQ | TECH SECTOR, GLOBAL HUB</p>
                    </div>
                    <div className="text-right">
                       <h2 className="text-2xl font-black text-[#0F766E] uppercase tracking-tighter mb-1">E-PAYROLL SLIP</h2>
                       <p className="text-sm font-black text-slate-900 uppercase">{selectedMonth}</p>
                    </div>
                 </div>

                 <div className="p-10 space-y-12">
                    <div className="grid grid-cols-2 gap-16 border-b border-slate-100 pb-12">
                       <div className="space-y-6">
                          <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest border-l-4 border-[#0F766E] pl-3">Beneficiary Details</h3>
                          <div className="grid grid-cols-2 gap-y-3">
                             <div className="text-[10px] font-black text-slate-300 uppercase">IDENTIFIER</div>
                             <div className="text-[10px] font-black text-slate-900 text-right uppercase">{emp.name}</div>
                             <div className="text-[10px] font-black text-slate-300 uppercase">ENTITY ID</div>
                             <div className="text-[10px] font-black text-slate-900 text-right uppercase">{emp.empId}</div>
                             <div className="text-[10px] font-black text-slate-300 uppercase">POSITION</div>
                             <div className="text-[10px] font-black text-slate-900 text-right uppercase">{emp.jobTitle}</div>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest border-l-4 border-[#0F766E] pl-3">Payment Vector</h3>
                          <div className="grid grid-cols-2 gap-y-3">
                             <div className="text-[10px] font-black text-slate-300 uppercase">BANKING INST.</div>
                             <div className="text-[10px] font-black text-slate-900 text-right uppercase">STANDARD CHARTERED</div>
                             <div className="text-[10px] font-black text-slate-300 uppercase">TERMINAL ACCOUNT</div>
                             <div className="text-[10px] font-black text-slate-900 text-right uppercase">**** 4432</div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-0 border border-slate-200 shadow-sm">
                       <div className="p-8 bg-slate-50/30 border-r border-slate-200">
                          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-200 pb-3">Operational Credits</h3>
                          <div className="space-y-5">
                             {[
                                { l: 'BASE ALLOCATION', v: '15,000.00' },
                                { l: 'OPERATIONAL ALLOWANCE', v: '3,000.00' },
                                { l: 'PERFORMANCE BONUS', v: '2,500.00' }
                             ].map(item => (
                                <div key={item.l} className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</span>
                                   <span className="text-[11px] font-black text-slate-900">£{item.v}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="p-8 bg-white">
                          <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-8 border-b border-slate-200 pb-3">Regulatory Offsets</h3>
                          <div className="space-y-5">
                             {[
                                { l: 'GOVERNMENT TDS', v: '1,200.00' },
                                { l: 'PROVIDENT RESERVE', v: '1,800.00' },
                                { l: 'HEALTH LEVY', v: '500.00' }
                             ].map(item => (
                                <div key={item.l} className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</span>
                                   <span className="text-[11px] font-black text-red-500">-£{item.v}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 p-10 text-white">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-none bg-emerald-600 flex items-center justify-center">
                             <HiBanknotes className="h-8 w-8 text-white" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">TERMINAL NET Payout</p>
                             <p className="text-4xl font-black tracking-tighter">£18,800.00</p>
                          </div>
                       </div>
                       <button className="h-12 px-10 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all">
                          DOWNLOAD PDF
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        );
     }

     if (activeTab === 'Run') {
        return (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="rounded-none border border-slate-200 bg-white p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10">
                 <div className="space-y-3 text-center md:text-left">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Financial Execution Run – {selectedMonth}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">
                       INITIALIZE AUDIT CALCULATIONS FOR ALL ACTIVE ASSETS. SYSTEM VALIDATION REQUIRED BEFORE DISBURSEMENT.
                    </p>
                 </div>
                 <button className="h-14 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10">
                    EXECUTE PROTOCOL
                 </button>
              </div>
           </div>
        );
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Exactly matching Employee Directory */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Payroll Intelligence</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Finance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Payroll Command Center</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiAdjustmentsHorizontal className="h-4 w-4" />
            Governance
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Tabs Navigation — Matching Employee Directory Style */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar">
         {['Summary', 'Payslips', 'Run'].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex shrink-0 items-center gap-3 px-8 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab 
                  ? 'text-[#0F766E]' 
                  : 'text-slate-400 hover:text-slate-600'
               }`}
            >
               {tab}
               {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F766E] animate-in fade-in duration-300" />
               )}
            </button>
         ))}
      </div>

      <div className="pb-12">{renderContent()}</div>

      {/* Modals — Rounded None */}
      <Modal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="FINANCIAL GOVERNANCE" size="lg" className="rounded-none">
         <div className="animate-in fade-in duration-500 space-y-10 p-2">
            <div className="bg-slate-50 p-8 rounded-none border border-slate-100">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TDS Threshold</label>
                     <input type="text" defaultValue="500,000" className="h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-sm focus:border-[#0F766E] outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PF Rate</label>
                     <input type="text" defaultValue="12%" className="h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-sm focus:border-[#0F766E] outline-none font-bold" />
                  </div>
               </div>
            </div>
            <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
               <button onClick={() => setSettingsModalOpen(false)} className="h-10 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">CANCEL</button>
               <button className="h-10 px-10 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black">SAVE RULES</button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="CONFIGURE ENTRY" size="xl" className="rounded-none">
        <form className="animate-in fade-in duration-500 space-y-10 p-2" onSubmit={(e) => e.preventDefault()}>
           <div className="space-y-6">
              <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest border-l-4 border-[#0F766E] pl-3">Asset Classification</h3>
              <div className="relative" ref={dropdownRef}>
                 <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Beneficiary</label>
                 <div className="relative">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       type="text"
                       placeholder="ENTER NAME..."
                       className="h-11 w-full rounded-none border border-slate-200 bg-slate-50/50 px-3 pl-11 text-sm focus:border-[#0F766E] outline-none font-bold"
                       value={empSearch}
                       onChange={(e) => { setEmpSearch(e.target.value); setShowEmpDropdown(true); }}
                       onFocus={() => setShowEmpDropdown(true)}
                    />
                 </div>
              </div>
           </div>
           <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
              <button type="button" onClick={handleCloseModal} className="h-10 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">DISCARD</button>
              <button type="submit" className="h-10 px-10 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">COMMIT</button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
