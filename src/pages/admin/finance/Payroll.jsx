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
  
  // Searchable Employee Select States
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

  // Global Settings States
  const [globalSettings, setGlobalSettings] = useState({
     hraPercentage: 40,
     taxThreshold: 500000,
     pfRate: 12,
     disbursementDay: 28,
     currency: 'AED'
  });

  const filteredEmployees = useMemo(() => {
     if (!empSearch) return employees;
     return employees.filter(e => 
        e.name.toLowerCase().includes(empSearch.toLowerCase()) || 
        e.empId.toLowerCase().includes(empSearch.toLowerCase())
     );
  }, [empSearch]);

  const handleSelectEmployee = (emp) => {
     setFormData(prev => ({ ...prev, employeeId: emp.id, employeeName: emp.name }));
     setEmpSearch(emp.name);
     setShowEmpDropdown(false);
  };

  const filtered = useMemo(() => {
     let data = payrollData;
     const query = q.trim().toLowerCase();
     if (query) {
       data = data.filter((p) => p.name.toLowerCase().includes(query));
     }
     return data;
  }, [q]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEmpSearch('');
    setFormData({
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
  };

  const handleViewPayslip = (empId) => {
     const emp = employees.find(e => e.empId == empId || e.id == empId);
     if (emp) {
        setSelectedEmployee(emp.id);
        setActiveTab('Payslips');
     }
  };

  const handlePrint = () => {
     window.print();
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (v, row) => (
         <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E] font-bold text-xs">
               {v.charAt(0)}
            </div>
            <div>
               <div className="font-bold text-slate-900 leading-none mb-1">{v}</div>
               <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.department}</div>
            </div>
         </div>
      )
    },
    { 
       key: 'basic', 
       label: 'Basic Pay', 
       render: (v) => <span className="font-medium text-slate-600">£{v.toLocaleString()}</span> 
    },
    { 
       key: 'allowances', 
       label: 'Allowances', 
       render: (v) => <span className="font-medium text-emerald-600">+£{v.toLocaleString()}</span> 
    },
    { 
       key: 'deductions', 
       label: 'Deductions', 
       render: (v) => <span className="font-medium text-red-500">-£{v.toLocaleString()}</span> 
    },
    { 
       key: 'net', 
       label: 'Net Payout', 
       render: (v) => <span className="font-bold text-slate-900">£{v.toLocaleString()}</span> 
    },
    {
       key: 'status',
       label: 'Status',
       render: () => <Badge label="Ready" color="blue" variant="outline" />
    },
    {
       key: 'actions',
       label: 'Action',
       render: (_, row) => (
          <div className="flex items-center gap-1">
             <Button 
                variant="ghost" 
                size="sm" 
                icon={HiEye} 
                className="text-slate-400 hover:text-[#0F766E]" 
                onClick={() => handleViewPayslip(row.id || row.empId)}
             />
             <Button 
                variant="ghost" 
                size="sm" 
                icon={HiPrinter} 
                className="text-slate-400 hover:text-[#0F766E]" 
                onClick={() => handleViewPayslip(row.id || row.empId)}
             />
          </div>
       )
    }
  ];

  const renderContent = () => {
     if (activeTab === 'Summary') {
        return (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Payouts</label>
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by employee name..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button label="FILTERS" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px] border border-slate-200" />
                  <Button label="EXPORT" icon={HiArrowDownTray} variant="ghost" className="h-[46px] border border-slate-200" />
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                 <div className="bg-[#0F766E] px-6 py-3 text-white flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider">Salary Disbursement Registry – {selectedMonth}</h2>
                    <HiBanknotes className="h-4 w-4 opacity-50" />
                 </div>
                 <Table columns={columns} data={filtered} pageSize={8} />
              </div>
           </div>
        );
     }

     if (activeTab === 'Payslips') {
        const emp = employees.find(e => e.id === selectedEmployee) || employees[0];
        return (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 items-end">
                 <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                    <select 
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] outline-none"
                       value={selectedEmployee}
                       onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                       {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.empId})</option>)}
                    </select>
                 </div>
                 <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payroll Cycle</label>
                    <select 
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] outline-none"
                       value={selectedMonth}
                       onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                       <option>May 2026</option>
                       <option>April 2026</option>
                       <option>March 2026</option>
                    </select>
                 </div>
                 <Button label="PREVIEW PAYSLIP" variant="primary" icon={HiEye} className="h-[46px] px-8" />
              </div>

              {/* High Fidelity Payslip Template */}
              <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                 <div className="bg-slate-50 border-b border-slate-100 p-8 flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-black text-xl">M</div>
                          <h1 className="text-2xl font-black text-slate-900 tracking-tight">MICROLAN IT SERVICES</h1>
                       </div>
                       <p className="text-xs text-slate-400 font-medium max-w-[200px]">Pvt. Ltd. | 123 Corporate Tower, Tech District, Global Park</p>
                    </div>
                    <div className="text-right">
                       <h2 className="text-xl font-black text-[#0F766E] uppercase tracking-widest mb-1">E-PAYSLIP</h2>
                       <p className="text-sm font-bold text-slate-900">{selectedMonth}</p>
                       <p className="text-[10px] text-slate-400 font-medium mt-1">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="p-8 space-y-10">
                    <div className="grid grid-cols-2 gap-12 border-b border-slate-100 pb-10">
                       <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Employee Profile</h3>
                          <div className="grid grid-cols-2 gap-y-3">
                             <div className="text-xs text-slate-400">Name</div>
                             <div className="text-xs font-bold text-slate-900 text-right">{emp.name}</div>
                             <div className="text-xs text-slate-400">Employee ID</div>
                             <div className="text-xs font-bold text-slate-900 text-right">{emp.empId}</div>
                             <div className="text-xs text-slate-400">Designation</div>
                             <div className="text-xs font-bold text-slate-900 text-right">{emp.jobTitle}</div>
                             <div className="text-xs text-slate-400">Department</div>
                             <div className="text-xs font-bold text-slate-900 text-right">{emp.department}</div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Disbursement Details</h3>
                          <div className="grid grid-cols-2 gap-y-3">
                             <div className="text-xs text-slate-400">Bank Name</div>
                             <div className="text-xs font-bold text-slate-900 text-right">Standard Chartered</div>
                             <div className="text-xs text-slate-400">Account No.</div>
                             <div className="text-xs font-bold text-slate-900 text-right">**** 4432</div>
                             <div className="text-xs text-slate-400">IFSC / Routing</div>
                             <div className="text-xs font-bold text-slate-900 text-right">SCBL000123</div>
                             <div className="text-xs text-slate-400">Payment Status</div>
                             <div className="text-xs font-bold text-emerald-600 text-right uppercase">Pending Approval</div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-0 rounded-2xl border border-slate-200 overflow-hidden">
                       <div className="p-6 bg-slate-50/50 border-r border-slate-200">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Earnings</h3>
                          <div className="space-y-4">
                             {[
                                { l: 'Basic Salary', v: '15,000.00' },
                                { l: 'House Rent Allowance', v: '3,000.00' },
                                { l: 'Special Allowance', v: '2,500.00' },
                                { l: 'Bonus / Incentives', v: '1,000.00' }
                             ].map(item => (
                                <div key={item.l} className="flex justify-between items-center">
                                   <span className="text-xs text-slate-500">{item.l}</span>
                                   <span className="text-sm font-mono font-bold text-slate-900">£{item.v}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="p-6 bg-white">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Deductions</h3>
                          <div className="space-y-4">
                             {[
                                { l: 'Income Tax (TDS)', v: '1,200.00' },
                                { l: 'Provident Fund (PF)', v: '1,800.00' },
                                { l: 'Medical Insurance', v: '500.00' },
                                { l: 'Professional Tax', v: '200.00' }
                             ].map(item => (
                                <div key={item.l} className="flex justify-between items-center">
                                   <span className="text-xs text-slate-500">{item.l}</span>
                                   <span className="text-sm font-mono font-bold text-red-500">-£{item.v}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-[#0F766E] p-8 text-white shadow-xl">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                             <HiBanknotes className="h-6 w-6" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Net Disbursement Amount</p>
                             <p className="text-4xl font-black tracking-tight">£18,800.00</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <Button 
                             label="DOWNLOAD PDF" 
                             variant="secondary" 
                             icon={HiArrowDownTray} 
                             className="bg-white text-[#0F766E] border-none font-black text-xs hover:bg-emerald-50" 
                             onClick={handlePrint}
                          />
                          <p className="text-[9px] font-medium opacity-60">System Verified Digital Slips</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        );
     }

     if (activeTab === 'Run') {
        return (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                       <h3 className="text-xl font-bold text-slate-900">Run Payroll – {selectedMonth}</h3>
                       <p className="text-sm text-slate-500 max-w-sm">
                          Initialize the salary calculation for all active employees. This will generate drafts for all departments.
                       </p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Date</p>
                          <p className="text-sm font-bold text-slate-700">May 28, 2026</p>
                       </div>
                       <Button label="EXECUTE PAYROLL RUN" variant="primary" icon={HiPlay} className="px-10 h-[56px] shadow-lg shadow-emerald-900/20" />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                    { label: 'Calculated Payout', value: '£58,800', icon: HiBanknotes, color: 'emerald' },
                    { label: 'Employees Ready', value: `0 / ${employees.length}`, icon: HiUserGroup, color: 'blue' },
                    { label: 'Compliance Audit', value: 'Awaiting', icon: HiShieldCheck, color: 'orange' }
                 ].map(card => (
                    <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                       <div className="flex items-center gap-4 mb-4">
                          <div className={`h-10 w-10 rounded-xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center`}>
                             <card.icon className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                       </div>
                       <p className="text-3xl font-black text-slate-900">{card.value}</p>
                    </div>
                 ))}
              </div>
           </div>
        );
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">Payroll Command Center</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Automate disbursements, manage complex tax deductions, and generate digital payslips with enterprise-grade accuracy.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
               onClick={() => setSettingsModalOpen(true)}
               className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
             >
               <HiAdjustmentsHorizontal className="h-4 w-4" /> Global Settings
             </button>
             <button 
               onClick={() => setModalOpen(true)}
               className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
             >
               <HiPlus className="h-4 w-4" /> Add Salary Record
             </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200">
         {['Summary', 'Payslips', 'Run'].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex items-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab 
                  ? 'border-[#0F766E] text-[#0F766E] bg-emerald-50/30' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
               }`}
            >
               {tab === 'Summary' && <HiChartBar className="h-4 w-4" />}
               {tab === 'Payslips' && <HiCurrencyDollar className="h-4 w-4" />}
               {tab === 'Run' && <HiPlay className="h-4 w-4" />}
               {tab}
            </button>
         ))}
      </div>

      <div>{renderContent()}</div>

      {/* Global Settings Modal */}
      <Modal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="Global Payroll Configuration" size="lg">
         <div className="animate-in fade-in duration-500 space-y-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#0F766E] shadow-sm">
                     <HiScale className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-slate-900">Organizational Tax & Compliance</h3>
                     <p className="text-[10px] text-slate-500 font-medium">Define global taxation thresholds and deduction rates.</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TDS Threshold (Annual)</label>
                     <input type="text" defaultValue="500,000" className="w-full rounded-xl border border-white bg-white/80 py-2 px-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PF Contribution Rate (%)</label>
                     <input type="text" defaultValue="12%" className="w-full rounded-xl border border-white bg-white/80 py-2 px-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none shadow-sm" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                     <HiCalculator className="h-4 w-4 text-[#0F766E]" /> Allowance Slabs
                  </h4>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-xs font-medium text-slate-500">HRA (% of Basic)</span>
                        <span className="text-xs font-bold text-slate-900">40%</span>
                     </div>
                     <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-xs font-medium text-slate-500">Transport Cap</span>
                        <span className="text-xs font-bold text-slate-900">£1,500</span>
                     </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                     <HiCalendarDays className="h-4 w-4 text-[#0F766E]" /> Disbursement
                  </h4>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-xs font-medium text-slate-500">Default Pay Day</span>
                        <span className="text-xs font-bold text-slate-900">28th</span>
                     </div>
                     <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <span className="text-xs font-medium text-slate-500">Auto-Approve Below</span>
                        <span className="text-xs font-bold text-slate-900">£5,000</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-center gap-3">
               <Button label="SAVE CONFIGURATION" variant="primary" className="px-10" />
               <Button label="CLOSE" variant="ghost" onClick={() => setSettingsModalOpen(false)} />
            </div>
         </div>
      </Modal>

      {/* Add Salary Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Configure Salary Structure" size="xl">
        <form className="animate-in fade-in duration-500 space-y-8" onSubmit={(e) => e.preventDefault()}>
           {/* Section: Employee Selection with Search */}
           <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                 <HiUserGroup className="h-4 w-4 text-[#0F766E]" /> Beneficiary Selection
              </h3>
              <div className="relative" ref={dropdownRef}>
                 <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Employee</label>
                 <div className="relative">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       type="text"
                       placeholder="Type name or Employee ID to search..."
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all"
                       value={empSearch}
                       onChange={(e) => {
                          setEmpSearch(e.target.value);
                          setShowEmpDropdown(true);
                       }}
                       onFocus={() => setShowEmpDropdown(true)}
                    />
                    {formData.employeeId && !showEmpDropdown && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">
                          SELECTED: {formData.employeeName}
                          <HiXMark className="h-3 w-3 cursor-pointer" onClick={() => {
                             setFormData(p => ({ ...p, employeeId: '', employeeName: '' }));
                             setEmpSearch('');
                          }} />
                       </div>
                    )}
                 </div>

                 {showEmpDropdown && (
                    <div className="absolute z-[100] mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                       {filteredEmployees.length > 0 ? (
                          filteredEmployees.map(emp => (
                             <button
                                key={emp.id}
                                type="button"
                                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-emerald-50 transition-colors group"
                                onClick={() => handleSelectEmployee(emp)}
                             >
                                <div>
                                   <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                                   <p className="text-[10px] text-slate-400 font-medium">{emp.jobTitle} • {emp.department}</p>
                                </div>
                                <div className="text-[10px] font-black text-slate-300 group-hover:text-[#0F766E]">{emp.empId}</div>
                             </button>
                          ))
                       ) : (
                          <div className="p-4 text-center text-xs text-slate-400 font-medium">No employees found matching "{empSearch}"</div>
                       )}
                    </div>
                 )}
              </div>
           </div>

           {/* Section: Earnings */}
           <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black text-[#0F766E] uppercase tracking-widest border-b border-slate-100 pb-2">
                 <HiPlus className="h-4 w-4" /> Monthly Earnings
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                 <Input label="Basic Salary (AED)" name="basic" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
                 <Input label="HRA / Rent Allowance" name="hra" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
                 <Input label="Transport Allowance" name="transport" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
                 <Input label="Special Bonus" name="bonus" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
              </div>
           </div>

           {/* Section: Deductions */}
           <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                 <HiShieldCheck className="h-4 w-4" /> Standard Deductions
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                 <Input label="Income Tax (TDS)" name="tax" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
                 <Input label="PF Contribution" name="pf" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
                 <Input label="Other Deductions" name="other" placeholder="0.00" type="number" className="text-slate-900 font-medium" />
              </div>
           </div>

           <div className="pt-6 border-t border-slate-100 flex justify-center gap-4">
              <Button label="SAVE SALARY STRUCTURE" variant="primary" className="px-10 shadow-lg shadow-emerald-900/20" />
              <Button label="CANCEL" variant="ghost" onClick={handleCloseModal} />
           </div>
        </form>
      </Modal>
    </div>
  );
}
