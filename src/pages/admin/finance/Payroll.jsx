import React, { useState, useMemo, useEffect } from 'react';
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
   HiChevronRight
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import payrollService from '../../../services/payrollService';
import { listEmployees } from '../../../services/employeeService';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../../../context/CurrencyContext.jsx';

export default function Payroll() {
   const { format: fmt } = useCurrency();
   const [mainTab, setMainTab] = useState('salary'); // 'salary' | 'items'
   const [employees, setEmployees] = useState([]);
   const [salaries, setSalaries] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [dept, setDept] = useState('');

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
      } else {
         fetchSalaries();
      }
   }, [mainTab, activeSettingsTab]);

   const fetchInitialData = async () => {
      try {
         setLoading(true);
         const { employees: empData } = await listEmployees();
         setEmployees(empData || []);
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
         render: () => (
            <div className="flex justify-center">
               <button className="inline-flex h-8 items-center gap-1.5 rounded-none bg-slate-800 px-3 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-900 shadow-sm">
                  <HiDocumentText className="h-3.5 w-3.5" />
                  <span>Payslip</span>
               </button>
            </div>
         )
      },
      {
         key: 'actions',
         label: <div className="text-right">Action</div>,
         render: () => (
            <div className="flex justify-end gap-1.5">
               <button className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56] shadow-sm"><HiPencilSquare className="h-4 w-4" /></button>
               <button className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 shadow-sm"><HiTrash className="h-4 w-4" /></button>
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
               <button className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
                  <HiArrowUpTray className="h-4 w-4" /> Export <HiChevronDown className="h-4 w-4" />
               </button>
               {mainTab === 'salary' ? (
                  <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
                     <HiPlus className="h-4 w-4" /> Add Salary
                  </button>
               ) : (
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
                     { label: 'TOTAL SALARY PAID', count: fmt(salaries.reduce((acc, s) => acc + Number(s.net_salary), 0)), bgColor: 'bg-[#0F172A]', icon: HiCurrencyDollar },
                     { label: 'ACTIVE PAYROLL', count: salaries.length, bgColor: 'bg-[#10B981]', icon: HiCheckBadge },
                     { label: 'TOTAL EMPLOYEES', count: employees.length, bgColor: 'bg-[#3B82F6]', icon: HiUserGroup },
                     { label: 'PENDING RECORDS', count: employees.length - salaries.length, bgColor: 'bg-[#EF4444]', icon: HiClock }
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
                           <option value="1">Finance</option>
                        </select>
                     </div>
                  </div>

                  <Table columns={salaryColumns} data={filteredSalaries} loading={loading} pageSize={8} square className="rounded-none border-0" />
               </div>
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

      </div>
   );
}
