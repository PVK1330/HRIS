import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
   HiCurrencyDollar,
   HiXMark,
   HiDocumentText,
   HiClock,
   HiMinusCircle,
   HiTag,
   HiChevronRight,
   HiDocumentArrowDown,
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import payrollService from '../../../services/payrollService';
import { listEmployees } from '../../../services/employeeService';
import { listDepartments } from '../../../services/departmentService';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../../../context/CurrencyContext.jsx';
import { triggerExport } from '../../../utils/exportHelper.js';

export default function Payroll() {
   const { format: fmt } = useCurrency();
   const navigate = useNavigate();
   const [mainTab, setMainTab] = useState('salary'); // 'salary' | 'items' | 'monthly'
   const [exportOpen, setExportOpen] = useState(false)
   const [exportLoading, setExportLoading] = useState(false)
   const exportRef = useRef(null)
   const [employees, setEmployees] = useState([]);
   const [departments, setDepartments] = useState([]);
   const [salaries, setSalaries] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editSalaryForm, setEditSalaryForm] = useState(null);
   const [dept, setDept] = useState('');

   // Monthly payroll state
   const [monthlySummary, setMonthlySummary] = useState(null);
   const [monthlyLoading, setMonthlyLoading] = useState(false);
   const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
   const [payslipRow, setPayslipRow] = useState(null);

   // Settings specific state
   const [activeSettingsTab, setActiveSettingsTab] = useState('Additions');
   const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
   const [settingsSearch, setSettingsSearch] = useState('');
   const [rowsPerPage, setRowsPerPage] = useState(10);
   const [payrollItems, setPayrollItems] = useState([]);

   // Form States
   const [salaryForm, setSalaryForm] = useState({
      employee_id: '',
      net_salary: 0,
      earnings: {},
      deductions: {}
   });

   useEffect(() => {
      fetchInitialData();
   }, []);

   useEffect(() => {
      if (mainTab === 'items') {
         fetchPayrollItems();
      } else if (mainTab === 'monthly') {
         fetchMonthlySummary(selectedMonth);
      } else {
         fetchSalaries();
      }
   }, [mainTab, activeSettingsTab]);

   const fetchMonthlySummary = async (month) => {
      setMonthlyLoading(true);
      try {
         const data = await payrollService.getMonthlySummary(month);
         setMonthlySummary(data);
      } catch (error) {
         console.error('Error fetching monthly summary:', error);
      } finally {
         setMonthlyLoading(false);
      }
   };

   const fetchInitialData = async () => {
      try {
         setLoading(true);
         const [{ employees: empData }, deptResult] = await Promise.all([
            listEmployees(),
            listDepartments({ limit: 200 }).catch(() => ({ departments: [] })),
         ]);
         setEmployees(empData || []);
         setDepartments(deptResult?.departments || []);
         await fetchSalaries();
      } catch (error) {
         console.error('Error fetching initial data:', error);
      } finally {
         setLoading(false);
      }
   };

   const fetchSalaries = async () => {
      try {
         const data = await payrollService.getSalaries({ search: searchTerm, departmentId: dept });
         setSalaries(data || []);
      } catch (error) {
         console.error('Error fetching salaries:', error);
      }
   };

   const fetchPayrollItems = async () => {
      try {
         const typeMap = { 'Additions': 'addition', 'Overtime': 'overtime', 'Deductions': 'deduction' };
         const data = await payrollService.getPayrollItems(typeMap[activeSettingsTab]);
         setPayrollItems(data || []);
      } catch (error) {
         console.error('Error fetching items:', error);
      }
   };

   const handleAddSalary = async (e) => {
      e.preventDefault();
      try {
         await payrollService.saveSalary(salaryForm);
         toast.success('Salary record saved');
         setIsAddModalOpen(false);
         fetchSalaries();
      } catch (error) {
         toast.error('Failed to save salary');
      }
   };

   const handleEditSalary = async (e) => {
      e.preventDefault();
      try {
         await payrollService.updateSalary(editSalaryForm.id || editSalaryForm.salary_id, editSalaryForm);
         toast.success('Salary record updated');
         setIsEditModalOpen(false);
         setEditSalaryForm(null);
         fetchSalaries();
      } catch (error) {
         toast.error('Failed to update salary');
      }
   };

   const handleDeleteSalary = async (row) => {
      if (!window.confirm(`Delete salary record for ${row.first_name} ${row.last_name}?`)) return;
      try {
         await payrollService.deleteSalary(row.id);
         toast.success('Salary record deleted');
         fetchSalaries();
      } catch (error) {
         toast.error(error?.response?.data?.message || 'Failed to delete salary record');
      }
   };

   const filteredSalaries = useMemo(() => {
      return salaries.filter(s =>
         (s.first_name + ' ' + s.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.emp_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [salaries, searchTerm]);

   const salaryColumns = [
      {
         key: 'checkbox',
         label: <input type="checkbox" className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />,
         render: () => <input type="checkbox" className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
      },
      {
         key: 'emp_code',
         label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Emp ID <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
         render: (v) => <span className="font-semibold text-slate-700">{v}</span>
      },
      {
         key: 'name',
         label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Name <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
         render: (_, row) => (
            <div className="flex items-center gap-3 py-1">
               <Avatar name={`${row.first_name} ${row.last_name}`} src={row.avatar} size="sm" className="rounded-none ring-1 ring-slate-200" />
               <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{row.first_name} {row.last_name}</div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{row.designation_name}</div>
               </div>
            </div>
         )
      },
      { key: 'email', label: 'Email', render: (v) => <span className="text-slate-600 truncate max-w-[150px] inline-block">{v}</span> },
      { key: 'phone', label: 'Phone', render: (v) => <span className="text-slate-600">{v}</span> },
      { key: 'net_salary', label: <div className="text-right">Net Salary</div>, render: (v) => <div className="text-right font-black text-[#0F766E]">{fmt(Number(v))}</div> },
      {
         key: 'payslip',
         label: <div className="text-center">Payslip</div>,
         render: (_, row) => (
            <div className="flex justify-center">
               <button
                  onClick={() => setPayslipRow({ ...row, month: new Date().toISOString().slice(0, 7), working_days: 0 })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-none bg-slate-800 px-3 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-900 shadow-sm"
               >
                  <HiDocumentText className="h-3.5 w-3.5" />
                  <span>Payslip</span>
               </button>
            </div>
         )
      },
      {
         key: 'actions',
         label: <div className="text-right">Action</div>,
         render: (_, row) => (
            <div className="flex justify-end gap-1.5">
               <button
                  onClick={() => { setEditSalaryForm({ ...row }); setIsEditModalOpen(true); }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56] shadow-sm"
               >
                  <HiPencilSquare className="h-4 w-4" />
               </button>
               <button
                  onClick={() => handleDeleteSalary(row)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 shadow-sm"
               >
                  <HiTrash className="h-4 w-4" />
               </button>
            </div>
         )
      }
   ];

   const settingsColumns = [
      {
         key: 'name',
         label: <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Name <HiArrowsUpDown className="h-3 w-3 opacity-45" /></span>,
         render: (v) => <span className="font-bold text-slate-900">{v}</span>
      },
      {
         key: 'amount',
         label: <div className="text-right inline-flex items-center gap-1.5 w-full justify-end uppercase tracking-wider text-[11px] font-bold">Value <HiArrowsUpDown className="h-3 w-3 opacity-45" /></div>,
         render: (v) => <div className="text-right font-black text-[#0F766E]">{activeSettingsTab === 'Overtime' ? v : fmt(Number(v))}</div>
      },
      {
         key: 'actions',
         label: <div className="text-right">Actions</div>,
         render: () => (
            <div className="flex justify-end gap-1">
               <button className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56] shadow-sm"><HiPencilSquare className="h-4 w-4" /></button>
               <button className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 shadow-sm"><HiTrash className="h-4 w-4" /></button>
            </div>
         )
      }
   ];

   useEffect(() => {
      function onClickOutside(e) {
         if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
      }
      document.addEventListener('mousedown', onClickOutside)
      return () => document.removeEventListener('mousedown', onClickOutside)
   }, [])

   async function runExport(type) {
      const ext = type === 'pdf' ? 'pdf' : 'xlsx'
      const today = new Date().toISOString().slice(0, 10)
      setExportLoading(true)
      const tid = toast.loading('Preparing export…')
      try {
         await triggerExport('admin/payroll/salaries', { search: searchTerm, departmentId: dept }, type, `salary_registry_${today}.${ext}`)
         toast.success('Export ready.', { id: tid })
      } catch (err) {
         console.error(err)
         toast.error('Export failed.', { id: tid })
      } finally {
         setExportLoading(false)
         setExportOpen(false)
      }
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

         {/* Top Title Bar */}
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="min-w-0">
               <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">Payroll Management</h1>
               <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
                  <span>Payroll</span>
                  <span className="text-slate-400">&gt;</span>
                  <span className="text-slate-600">{mainTab === 'salary' ? 'Employee Salary' : 'Payroll Items'}</span>
               </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <div className="relative" ref={exportRef}>
                  <button
                     type="button"
                     disabled={exportLoading}
                     onClick={() => setExportOpen((p) => !p)}
                     className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                  >
                     <HiDocumentArrowDown className="h-4 w-4" /> Export <HiChevronDown className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {exportOpen && (
                     <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-none border border-slate-200 bg-white py-1 shadow-lg">
                        <button type="button" disabled={exportLoading} onClick={() => runExport('pdf')}
                           className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                           <HiDocumentArrowDown className="h-4 w-4 text-slate-500" /> Export as PDF
                        </button>
                        <button type="button" disabled={exportLoading} onClick={() => runExport('excel')}
                           className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                           <HiDocumentArrowDown className="h-4 w-4 text-slate-500" /> Export as Excel
                        </button>
                     </div>
                  )}
               </div>
               {mainTab === 'salary' && (
                  <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
                     <HiPlus className="h-4 w-4" /> Add Salary
                  </button>
               )}
               {mainTab === 'items' && (
                  <button onClick={() => setIsSettingsModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
                     <HiPlus className="h-4 w-4" /> Add Item
                  </button>
               )}
            </div>
         </div>

         {/* Main Tab Switcher */}
         <div className="flex gap-1 border-b border-slate-200">
            {[
               { id: 'salary', label: 'Employee Salary' },
               { id: 'monthly', label: 'Monthly Payroll' },
               { id: 'items', label: 'Payroll Items' }
            ].map(tab => (
               <button key={tab.id} onClick={() => setMainTab(tab.id)} className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${mainTab === tab.id ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  {tab.label}
               </button>
            ))}
         </div>

         {mainTab === 'salary' ? (
            <>
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                  {[
                     { label: 'TOTAL SALARY PAID', count: fmt(salaries.reduce((acc, s) => acc + (Number(s.net_salary) || 0), 0)), bgColor: 'bg-[#0F172A]', icon: HiCurrencyDollar },
                     { label: 'ACTIVE PAYROLL', count: salaries.length, bgColor: 'bg-[#10B981]', icon: HiCheckBadge },
                     { label: 'TOTAL EMPLOYEES', count: employees.length, bgColor: 'bg-[#3B82F6]', icon: HiUserGroup },
                     { label: 'PENDING RECORDS', count: Math.max(0, employees.length - salaries.length), bgColor: 'bg-[#EF4444]', icon: HiClock }
                  ].map((card, idx) => (
                     <div key={idx} className="group flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 text-left min-w-0 shadow-sm">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                           <card.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="text-[11px] font-bold uppercase tracking-wider truncate text-slate-400">{card.label}</div>
                           <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                     <h2 className="text-sm font-semibold text-white">Employee Salary Registry</h2>
                  </div>

                  <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
                     <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative">
                           <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                           <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && fetchSalaries()} placeholder="Search employee..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
                        </div>
                        <select value={dept} onChange={(e) => { setDept(e.target.value); fetchSalaries(); }} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
                           <option value="">All Departments</option>
                           {departments.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <Table columns={salaryColumns} data={filteredSalaries} loading={loading} pageSize={8} square className="rounded-none border-0" />
               </div>
            </>
         ) : mainTab === 'monthly' ? (
            <>
               {/* Month picker */}
               <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-700">Payroll Month</label>
                  <input
                     type="month"
                     value={selectedMonth}
                     onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        fetchMonthlySummary(e.target.value);
                     }}
                     className="h-9 rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                  <button
                     onClick={() => fetchMonthlySummary(selectedMonth)}
                     className="h-9 rounded-none bg-[#0F766E] px-4 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors shadow-sm"
                  >
                     Load
                  </button>
                  {monthlySummary && (
                     <span className="text-xs font-medium text-slate-500">
                        {monthlySummary.working_days} working days in month
                     </span>
                  )}
               </div>

               {/* KPI strip */}
               {monthlySummary && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                     {[
                        {
                           label: 'TOTAL NET PAYROLL',
                           value: fmt(monthlySummary.employees.reduce((s, r) => s + Number(r.net_pay_calculated || 0), 0)),
                           bg: 'bg-[#0F172A]', icon: HiCurrencyDollar,
                        },
                        {
                           label: 'EMPLOYEES ON PAYROLL',
                           value: monthlySummary.employees.length,
                           bg: 'bg-[#10B981]', icon: HiUserGroup,
                        },
                        {
                           label: 'TOTAL OT HOURS',
                           value: monthlySummary.employees.reduce((s, r) => s + Number(r.ot_hours || 0), 0).toFixed(1) + 'h',
                           bg: 'bg-[#3B82F6]', icon: HiClock,
                        },
                        {
                           label: 'TOTAL LOP DAYS',
                           value: monthlySummary.employees.reduce((s, r) => s + Number(r.lop_days || 0), 0).toFixed(1),
                           bg: 'bg-[#EF4444]', icon: HiMinusCircle,
                        },
                     ].map((card, idx) => (
                        <div key={idx} className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
                           <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bg} text-white shadow-sm`}>
                              <card.icon className="h-5 w-5" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold uppercase tracking-wider truncate text-slate-400">{card.label}</div>
                              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.value}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                     <h2 className="text-sm font-semibold text-white">Monthly Payroll Breakdown — {selectedMonth}</h2>
                  </div>

                  {monthlyLoading ? (
                     <div className="flex items-center justify-center py-16 text-sm text-slate-500">Loading payroll data…</div>
                  ) : !monthlySummary ? (
                     <div className="flex items-center justify-center py-16 text-sm text-slate-400">Select a month and click Load</div>
                  ) : monthlySummary.employees.length === 0 ? (
                     <div className="flex items-center justify-center py-16 text-sm text-slate-400">No employees have salary records. Add salaries in the Employee Salary tab first.</div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="border-b border-slate-100 bg-slate-50">
                                 <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Employee</th>
                                 <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Present</th>
                                 <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Half Days</th>
                                 <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Paid Leave</th>
                                 <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">LOP Days</th>
                                 <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">OT Hours</th>
                                 <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Salary</th>
                                 <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Pay</th>
                                 <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Payslip</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {monthlySummary.employees.map((row) => (
                                 <tr key={row.employee_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                       <div className="font-bold text-slate-900">{row.first_name} {row.last_name}</div>
                                       <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{row.department_name || row.designation_name || row.emp_code}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                       <span className="inline-block rounded-none bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">{row.present_days}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs font-medium text-slate-600">{row.half_days}</td>
                                    <td className="px-4 py-3 text-center text-xs font-medium text-blue-600">{row.paid_leave_days}</td>
                                    <td className="px-4 py-3 text-center">
                                       {Number(row.lop_days) > 0
                                          ? <span className="inline-block rounded-none bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">{Number(row.lop_days).toFixed(1)}</span>
                                          : <span className="text-xs text-slate-300">—</span>
                                       }
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs font-medium text-slate-600">{Number(row.ot_hours) > 0 ? `${Number(row.ot_hours).toFixed(1)}h` : '—'}</td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{fmt(Number(row.net_salary))}</td>
                                    <td className="px-4 py-3 text-right">
                                       <span className={`text-sm font-black ${Number(row.lop_days) > 0 ? 'text-red-600' : 'text-[#0F766E]'}`}>
                                          {fmt(Number(row.net_pay_calculated))}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                       <button
                                          onClick={() => setPayslipRow({ ...row, month: selectedMonth, working_days: monthlySummary.working_days })}
                                          className="inline-flex h-7 items-center gap-1 rounded-none bg-slate-800 px-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-slate-900 transition-colors"
                                       >
                                          <HiDocumentText className="h-3.5 w-3.5" /> View
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>

               {/* Payslip Modal */}
               {payslipRow && (
                  <Modal isOpen={!!payslipRow} onClose={() => setPayslipRow(null)} size="lg" showClose
                     header={<h2 className="text-lg font-bold text-slate-900">Payslip — {payslipRow.first_name} {payslipRow.last_name}</h2>}
                  >
                     <div className="space-y-5 pt-2">
                        <div className="flex items-center justify-between rounded-none bg-[#0F766E]/5 border border-[#0F766E]/20 px-4 py-3">
                           <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pay Period</div>
                              <div className="text-sm font-bold text-slate-900">{payslipRow.month}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Employee ID</div>
                              <div className="text-sm font-bold text-slate-900">{payslipRow.emp_code || '—'}</div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                           {[
                              ['Department', payslipRow.department_name || '—'],
                              ['Designation', payslipRow.designation_name || '—'],
                              ['Working Days', payslipRow.working_days],
                              ['Days Present', payslipRow.present_days],
                              ['Half Days', payslipRow.half_days],
                              ['Paid Leave Days', payslipRow.paid_leave_days],
                              ['LOP Days', Number(payslipRow.lop_days).toFixed(1)],
                              ['OT Hours', Number(payslipRow.ot_hours) > 0 ? `${Number(payslipRow.ot_hours).toFixed(1)}h` : '—'],
                           ].map(([label, val]) => (
                              <div key={label} className="flex items-center justify-between rounded-none border border-slate-100 bg-slate-50 px-3 py-2">
                                 <span className="text-xs font-medium text-slate-500">{label}</span>
                                 <span className="text-xs font-bold text-slate-800">{val}</span>
                              </div>
                           ))}
                        </div>

                        <div className="rounded-none border border-slate-200 overflow-hidden">
                           <div className="bg-slate-800 px-4 py-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-white">Salary Calculation</span>
                           </div>
                           <div className="divide-y divide-slate-100">
                              <div className="flex items-center justify-between px-4 py-2.5">
                                 <span className="text-sm text-slate-600">Gross Salary (Monthly)</span>
                                 <span className="text-sm font-semibold text-slate-800">{fmt(Number(payslipRow.net_salary))}</span>
                              </div>
                              <div className="flex items-center justify-between px-4 py-2.5">
                                 <span className="text-sm text-slate-600">Per-Day Rate</span>
                                 <span className="text-sm font-semibold text-slate-800">{fmt(Number(payslipRow.per_day_salary))}</span>
                              </div>
                              {Number(payslipRow.lop_days) > 0 && (
                                 <div className="flex items-center justify-between px-4 py-2.5 bg-red-50">
                                    <span className="text-sm text-red-600">LOP Deduction ({Number(payslipRow.lop_days).toFixed(1)} days)</span>
                                    <span className="text-sm font-semibold text-red-600">− {fmt(Number(payslipRow.per_day_salary) * Number(payslipRow.lop_days))}</span>
                                 </div>
                              )}
                              <div className="flex items-center justify-between bg-[#0F766E] px-4 py-3">
                                 <span className="text-sm font-bold text-white">Net Pay</span>
                                 <span className="text-lg font-black text-white">{fmt(Number(payslipRow.net_pay_calculated))}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-end">
                           <button onClick={() => setPayslipRow(null)} className="h-9 rounded-none border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Close</button>
                        </div>
                     </div>
                  </Modal>
               )}
            </>
         ) : (
            <>
               <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                     <h2 className="text-sm font-semibold text-white">{activeSettingsTab} Configuration</h2>
                  </div>
                  <div className="space-y-4 border-b border-slate-200 bg-white px-4 py-3">
                     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-1 bg-slate-100/50 p-1 rounded-none ring-1 ring-slate-200">
                           {['Additions', 'Overtime', 'Deductions'].map((tab) => (
                              <button key={tab} onClick={() => setActiveSettingsTab(tab)} className={`px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all ${activeSettingsTab === tab ? 'bg-white text-[#0F766E] shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
                                 {tab}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                  <Table columns={settingsColumns} data={payrollItems} loading={loading} square pageSize={rowsPerPage} className="rounded-none border-0" />
               </div>
            </>
         )}

         {/* Modals */}
         <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            size="2xl"
            showClose
            header={
               <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-bold text-slate-900">Add Employee Salary</h2>
                  <p className="text-xs font-medium text-slate-500">Configure employee compensation parameters and regulatory deductions below.</p>
               </div>
            }
         >
            <form className="space-y-6 pt-4" onSubmit={handleAddSalary}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className="mb-1.5 block text-sm font-medium text-slate-800">Employee Name <span className="text-red-500">*</span></label>
                     <select
                        required
                        value={salaryForm.employee_id}
                        onChange={(e) => setSalaryForm({...salaryForm, employee_id: e.target.value})}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 outline-none transition-all shadow-sm"
                     >
                        <option value="">Select Employee</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id})</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="mb-1.5 block text-sm font-medium text-slate-800">Net Salary <span className="text-red-500">*</span></label>
                     <input
                        type="number"
                        required
                        value={salaryForm.net_salary}
                        onChange={(e) => setSalaryForm({...salaryForm, net_salary: e.target.value})}
                        placeholder="Enter amount"
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 outline-none transition-all shadow-sm"
                     />
                  </div>
               </div>
               <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                  <button type="submit" className="h-10 rounded-md bg-[#0F766E] px-8 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors shadow-sm">Save Salary Record</button>
               </div>
            </form>
         </Modal>

         {/* Edit Salary Modal */}
         <Modal
            isOpen={isEditModalOpen}
            onClose={() => { setIsEditModalOpen(false); setEditSalaryForm(null); }}
            size="2xl"
            showClose
            header={
               <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-bold text-slate-900">Edit Employee Salary</h2>
                  <p className="text-xs font-medium text-slate-500">Update the compensation details for this employee.</p>
               </div>
            }
         >
            {editSalaryForm && (
               <form className="space-y-6 pt-4" onSubmit={handleEditSalary}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-800">Employee</label>
                        <input
                           type="text"
                           readOnly
                           value={`${editSalaryForm.first_name || ''} ${editSalaryForm.last_name || ''}`}
                           className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none shadow-sm cursor-not-allowed"
                        />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-800">Net Salary <span className="text-red-500">*</span></label>
                        <input
                           type="number"
                           required
                           value={editSalaryForm.net_salary}
                           onChange={(e) => setEditSalaryForm({ ...editSalaryForm, net_salary: e.target.value })}
                           placeholder="Enter amount"
                           className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 outline-none transition-all shadow-sm"
                        />
                     </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-slate-100">
                     <button type="button" onClick={() => { setIsEditModalOpen(false); setEditSalaryForm(null); }} className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                     <button type="submit" className="h-10 rounded-md bg-[#0F766E] px-8 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors shadow-sm">Update Salary Record</button>
                  </div>
               </form>
            )}
         </Modal>

      </div>
   );
}
