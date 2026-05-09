import React, { useState, useRef } from 'react';
import { HiCurrencyDollar, HiChartBar, HiArrowDownTray, HiPlay, HiCheckCircle, HiMagnifyingGlass, HiFunnel, HiPlus, HiXMark, HiPrinter } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { payrollData, employees } from '../../../data/mockData.js';
import html2pdf from 'html2pdf.js';

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]?.id || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payrollTableData, setPayrollTableData] = useState(payrollData);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const payslipRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    basicSalary: '',
    hra: '',
    transportAllowance: '',
    bonus: '',
    pfContribution: '',
    insurance: '',
    otherDeductions: '',
  });

  const [editFormData, setEditFormData] = useState({
    employeeId: '',
    basicSalary: '',
    allowances: '',
    bonus: '',
    deductions: '',
    tax: '',
    paymentMethod: '',
    salaryMonth: '',
    status: 'Pending',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setFormData({
      employeeId: '',
      basicSalary: '',
      hra: '',
      transportAllowance: '',
      bonus: '',
      pfContribution: '',
      insurance: '',
      otherDeductions: '',
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetModal();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleClosePayslipModal = () => {
    setPayslipModalOpen(false);
    setPreviewEmployee(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ formData });
    handleCloseModal();
  };

  const handleEdit = (rowData) => {
    setEditingEmployee(rowData);
    setEditFormData({
      employeeId: rowData.id,
      basicSalary: rowData.basic,
      allowances: rowData.allowances,
      bonus: rowData.bonus || 1000,
      deductions: rowData.deductions,
      tax: 0,
      paymentMethod: 'Bank Transfer',
      salaryMonth: selectedMonth,
      status: 'Pending',
    });
    setEditModalOpen(true);
  };

  const handleSlip = (rowData) => {
    const emp = employees.find(e => e.id === rowData.id) || employees[0];
    setPreviewEmployee({
      ...rowData,
      empData: emp,
    });
    setPayslipModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedData = payrollTableData.map(item =>
      item.id === editingEmployee.id
        ? {
            ...item,
            basic: parseFloat(editFormData.basicSalary),
            allowances: parseFloat(editFormData.allowances),
            deductions: parseFloat(editFormData.deductions),
            bonus: parseFloat(editFormData.bonus),
            net: (parseFloat(editFormData.basicSalary) + parseFloat(editFormData.allowances) + parseFloat(editFormData.bonus)) - (parseFloat(editFormData.deductions) + parseFloat(editFormData.tax)),
          }
        : item
    );
    setPayrollTableData(updatedData);
    handleCloseEditModal();
  };

  // Get unique departments from payroll data
  const departments = [...new Set(payrollTableData.map(item => item.department))].filter(Boolean);

  // Filter payroll data based on search and department
  const getFilteredData = () => {
    return payrollTableData.filter(item => {
      
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           String(item.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  };

 

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        const filteredData = getFilteredData();
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border-tertiary bg-background-primary p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Total Payout (May)</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">AED 58,800</p>
                <p className="text-[10px] text-success-DEFAULT mt-1">+2.4% from last month</p>
              </div>
              <div className="rounded-xl border border-border-tertiary bg-background-primary p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Total Headcount</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">{employees.length}</p>
                <p className="text-[10px] text-text-tertiary mt-1">Active employees</p>
              </div>
              <div className="rounded-xl border border-border-tertiary bg-background-primary p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Processing Status</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label="In Progress" color="orange" />
                  <p className="text-[10px] text-text-tertiary">Due in 5 days</p>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="rounded-xl border border-border-tertiary bg-background-primary p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-text-primary">Search Employee</label>
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">Filter by Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {(searchTerm || selectedDepartment) && (
                  <div className="flex items-end">
                    <Button 
                      label="Clear Filters" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedDepartment('');
                      }}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              {(searchTerm || selectedDepartment) && (
                <p className="mt-2 text-sm text-text-tertiary">
                  Showing {filteredData.length} of {payrollTableData.length} employees
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border-tertiary bg-background-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Salary Overview</h3>
                <div className="flex gap-2">
                  <Button label="Add Salary" variant="primary" size="sm" icon={HiPlus} onClick={() => setModalOpen(true)} />
                  <Button label="Export CSV" variant="ghost" size="sm" icon={HiArrowDownTray} />
                </div>
              </div>
              <Table 
                columns={[
                  { key: 'name', label: 'Employee' },
                  { key: 'department', label: 'Department' },
                  { key: 'basic', label: 'Basic Salary', render: (v) => `AED ${v.toLocaleString()}` },
                  { key: 'allowances', label: 'Allowances', render: (v) => `AED ${v.toLocaleString()}` },
                  { key: 'deductions', label: 'Deductions', render: (v) => `AED ${v.toLocaleString()}` },
                  { key: 'net', label: 'Net Salary', render: (v) => <span className="font-bold text-primary">AED {v.toLocaleString()}</span> },
                  { key: 'actions', label: 'Actions', render: (_, row) => (
                    <div className="flex gap-1">
                      <Button label="Edit" variant="Approve" size="sm" onClick={() => handleEdit(row)} />
                      <Button label="Slip" variant="secondary" size="sm" onClick={() => handleSlip(row)} />
                    </div>
                  )}
                ]} 
                data={filteredData} 
                pageSize={5} 
              />
            </div>
          </div>
        );
        const emp = employees.find(e => e.id === selectedEmployee) || employees[0];
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
                <Input 
                  label="Select Employee" 
                  type="select" 
                  options={employees.map(e => ({ value: e.id, label: `${e.name} (${e.empId})` }))}
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                />
                <Input 
                  label="Select Month" 
                  type="select" 
                  options={[{ value: 'May 2026', label: 'May 2026' }, { value: 'April 2026', label: 'April 2026' }]}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="max-w-4xl mx-auto rounded-xl border border-border-tertiary bg-background-primary shadow-2xl overflow-hidden p-8">
              <div className="flex justify-between border-b-2 border-border-tertiary pb-8 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-primary tracking-tighter">HRIS HOLDINGS</h1>
                  <p className="text-sm text-text-tertiary">Dubai, UAE • License #123456</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest">Payslip</h2>
                  <p className="text-sm text-text-secondary">{selectedMonth}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-xs font-bold uppercase text-text-tertiary mb-3">Employee Details</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between"><span className="text-text-secondary">Name:</span> <span className="font-bold text-text-primary">{emp.name}</span></p>
                    <p className="flex justify-between"><span className="text-text-secondary">Employee ID:</span> <span className="font-bold text-text-primary">{emp.empId}</span></p>
                    <p className="flex justify-between"><span className="text-text-secondary">Designation:</span> <span className="font-bold text-text-primary">{emp.jobTitle}</span></p>
                    <p className="flex justify-between"><span className="text-text-secondary">Department:</span> <span className="font-bold text-text-primary">{emp.department}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-text-tertiary mb-3">Payment Info</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between"><span className="text-text-secondary">Bank:</span> <span className="font-bold text-text-primary">Emirates NBD</span></p>
                    <p className="flex justify-between"><span className="text-text-secondary">Account:</span> <span className="font-bold text-text-primary">**** 4432</span></p>
                    <p className="flex justify-between"><span className="text-text-secondary">Payment Date:</span> <span className="font-bold text-text-primary">May 28, 2026</span></p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-border-tertiary rounded-xl overflow-hidden mb-8">
                <div className="p-6 border-r border-border-tertiary bg-success-DEFAULT/5">
                  <h3 className="text-sm font-bold text-success-DEFAULT uppercase mb-4">Earnings</h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between"><span>Basic Salary</span> <span className="font-mono">AED 15,000.00</span></p>
                    <p className="flex justify-between"><span>HRA</span> <span className="font-mono">AED 3,000.00</span></p>
                    <p className="flex justify-between"><span>Transport Allowance</span> <span className="font-mono">AED 1,000.00</span></p>
                    <p className="flex justify-between"><span>Bonus</span> <span className="font-mono">AED 1,000.00</span></p>
                  </div>
                </div>
                <div className="p-6 bg-danger-DEFAULT/5">
                  <h3 className="text-sm font-bold text-danger-DEFAULT uppercase mb-4">Deductions</h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between"><span>Income Tax</span> <span className="font-mono">AED 0.00</span></p>
                    <p className="flex justify-between"><span>PF Contribution</span> <span className="font-mono">AED 500.00</span></p>
                    <p className="flex justify-between"><span>Insurance</span> <span className="font-mono">AED 200.00</span></p>
                    <p className="flex justify-between"><span>Others</span> <span className="font-mono">AED 300.00</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-primary p-6 rounded-xl text-white flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-xs font-bold uppercase opacity-80">Net Payable</p>
                  <p className="text-3xl font-black">AED 19,000.00</p>
                </div>
                <Button label="Download PDF" variant="secondary" icon={HiArrowDownTray} className="bg-white text-primary border-none hover:bg-white/90" />
              </div>
            </div>
          </div>
        );
      case 'run':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Input 
                  type="select" 
                  options={[{ value: 'May 2026', label: 'May 2026' }]} 
                  className="w-48"
                />
                <Badge label="Ready to process" color="blue" />
              </div>
              <Button label="Run Payroll Process" variant="primary" icon={HiPlay} size="lg" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
               <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm text-center">
                  <p className="text-xs font-bold uppercase text-text-tertiary">Total Payout</p>
                  <p className="text-3xl font-black text-text-primary mt-2">AED 58,800</p>
               </div>
               <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm text-center">
                  <p className="text-xs font-bold uppercase text-text-tertiary">Processed Count</p>
                  <p className="text-3xl font-black text-text-primary mt-2">0 / {employees.length}</p>
               </div>
               <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm text-center">
                  <p className="text-xs font-bold uppercase text-text-tertiary">Processed On</p>
                  <p className="text-xl font-bold text-text-tertiary mt-4">Not started</p>
               </div>
            </div>

            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
               <Table 
                columns={[
                  { key: 'name', label: 'Employee' },
                  { key: 'empId', label: 'ID' },
                  { key: 'net', label: 'Net Pay', render: (v) => `AED ${v.toLocaleString()}` },
                  { key: 'status', label: 'Status', render: () => <Badge label="Draft" color="gray" /> },
                ]} 
                data={payrollTableData} 
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payroll Management</h1>
          <p className="text-sm text-text-secondary">Process salaries, generate payslips and track payouts</p>
        </div>
      </div>

      <div className="flex border-b border-border-tertiary overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Salary Overview', icon: HiChartBar },
          { id: 'run', label: 'Payroll Run', icon: HiPlay },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>

      {/* Add Salary Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Add Salary Details" size="xl">
        <form onSubmit={handleSubmit} className="h-auto overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Employee selection
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="payroll-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="payroll-employee"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select employee
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.empId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Earnings
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Basic Salary (AED)"
              name="basicSalary"
              type="number"
              placeholder="0.00"
              value={formData.basicSalary}
              onChange={handleFormChange}
              required
            />
            <Input
              label="HRA (AED)"
              name="hra"
              type="number"
              placeholder="0.00"
              value={formData.hra}
              onChange={handleFormChange}
            />
            <Input
              label="Transport Allowance (AED)"
              name="transportAllowance"
              type="number"
              placeholder="0.00"
              value={formData.transportAllowance}
              onChange={handleFormChange}
            />
            <Input
              label="Bonus (AED)"
              name="bonus"
              type="number"
              placeholder="0.00"
              value={formData.bonus}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Deductions
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="PF Contribution (AED)"
              name="pfContribution"
              type="number"
              placeholder="0.00"
              value={formData.pfContribution}
              onChange={handleFormChange}
            />
            <Input
              label="Insurance (AED)"
              name="insurance"
              type="number"
              placeholder="0.00"
              value={formData.insurance}
              onChange={handleFormChange}
            />
            <Input
              label="Other Deductions (AED)"
              name="otherDeductions"
              type="number"
              placeholder="0.00"
              value={formData.otherDeductions}
              onChange={handleFormChange}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save Salary" variant="primary" />
          </div>
        </form>
      </Modal>

      {/* Edit Salary Modal */}
      <Modal isOpen={editModalOpen} onClose={handleCloseEditModal} title="Edit Salary Details" size="xl">
        <form onSubmit={handleSaveEdit} className="h-auto overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Salary Information
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Basic Salary (AED)"
              name="basicSalary"
              type="number"
              placeholder="0.00"
              value={editFormData.basicSalary}
              onChange={handleEditFormChange}
              required
            />
            <Input
              label="Allowances (AED)"
              name="allowances"
              type="number"
              placeholder="0.00"
              value={editFormData.allowances}
              onChange={handleEditFormChange}
            />
            <Input
              label="Bonus (AED)"
              name="bonus"
              type="number"
              placeholder="0.00"
              value={editFormData.bonus}
              onChange={handleEditFormChange}
            />
            <Input
              label="Deductions (AED)"
              name="deductions"
              type="number"
              placeholder="0.00"
              value={editFormData.deductions}
              onChange={handleEditFormChange}
            />
            <Input
              label="Tax (AED)"
              name="tax"
              type="number"
              placeholder="0.00"
              value={editFormData.tax}
              onChange={handleEditFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Payment Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="payment-method" className="mb-1 block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                id="payment-method"
                name="paymentMethod"
                value={editFormData.paymentMethod}
                onChange={handleEditFormChange}
                className={selectClass}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="salary-month" className="mb-1 block text-sm font-medium text-gray-700">
                Salary Month
              </label>
              <select
                id="salary-month"
                name="salaryMonth"
                value={editFormData.salaryMonth}
                onChange={handleEditFormChange}
                className={selectClass}
              >
                <option value="May 2026">May 2026</option>
                <option value="April 2026">April 2026</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={editFormData.status}
                onChange={handleEditFormChange}
                className={selectClass}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseEditModal} />
            <Button type="submit" label="Save Changes" variant="primary" />
          </div>
        </form>
      </Modal>

      {/* Payslip Preview Modal */}
      <Modal isOpen={payslipModalOpen} onClose={handleClosePayslipModal} title="Payslip Preview" size="2xl">
        <div className="h-auto overflow-y-auto">
          {previewEmployee && (
            <>
              <div 
                ref={payslipRef}
                className="rounded-2xl border-2 border-blue-400 overflow-hidden p-8 mb-6"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                }}
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-blue-500 pb-8 mb-8">
                  <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tighter">
                      HRIS HOLDINGS
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">Dubai, UAE • License #123456</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white shadow-lg">
                      <h2 className="text-2xl font-black uppercase tracking-widest">Payslip</h2>
                      <p className="text-sm mt-1">{selectedMonth}</p>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/80 backdrop-blur p-5 rounded-xl border border-blue-100 shadow-md">
                    <h3 className="text-sm font-bold uppercase text-blue-600 mb-4 pb-2 border-b-2 border-blue-300">👤 Employee Details</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><span className="text-gray-600">Name:</span> <span className="font-bold text-gray-900">{previewEmployee.empData.name}</span></p>
                      <p className="flex justify-between"><span className="text-gray-600">Employee ID:</span> <span className="font-bold text-gray-900">{previewEmployee.empData.empId}</span></p>
                      <p className="flex justify-between"><span className="text-gray-600">Designation:</span> <span className="font-bold text-gray-900">{previewEmployee.empData.jobTitle}</span></p>
                      <p className="flex justify-between"><span className="text-gray-600">Department:</span> <span className="font-bold text-gray-900">{previewEmployee.empData.department}</span></p>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-5 rounded-xl border border-purple-100 shadow-md">
                    <h3 className="text-sm font-bold uppercase text-purple-600 mb-4 pb-2 border-b-2 border-purple-300">🏦 Payment Info</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><span className="text-gray-600">Bank:</span> <span className="font-bold text-gray-900">Emirates NBD</span></p>
                      <p className="flex justify-between"><span className="text-gray-600">Account:</span> <span className="font-bold text-gray-900">**** 4432</span></p>
                      <p className="flex justify-between"><span className="text-gray-600">Payment Date:</span> <span className="font-bold text-gray-900">May 28, 2026</span></p>
                    </div>
                  </div>
                </div>

                {/* Earnings and Deductions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-md">
                    <h3 className="text-sm font-black uppercase text-green-700 mb-4 pb-3 border-b-2 border-green-400">💰 Earnings</h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-gray-700">Basic Salary</span> <span className="font-mono font-bold text-green-700">AED {previewEmployee.basic.toLocaleString()}</span></p>
                      <p className="flex justify-between"><span className="text-gray-700">Allowances</span> <span className="font-mono font-bold text-green-700">AED {previewEmployee.allowances.toLocaleString()}</span></p>
                      <p className="flex justify-between"><span className="text-gray-700">Bonus</span> <span className="font-mono font-bold text-green-700">AED {(previewEmployee.bonus || 0).toLocaleString()}</span></p>
                      <div className="pt-2 border-t-2 border-green-400 flex justify-between font-bold text-base">
                        <span className="text-gray-800">Total Earnings</span>
                        <span className="text-green-700">AED {(previewEmployee.basic + previewEmployee.allowances + (previewEmployee.bonus || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border-2 border-red-300 shadow-md">
                    <h3 className="text-sm font-black uppercase text-red-700 mb-4 pb-3 border-b-2 border-red-400">📉 Deductions</h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-gray-700">Income Tax</span> <span className="font-mono font-bold text-red-700">AED 0.00</span></p>
                      <p className="flex justify-between"><span className="text-gray-700">PF Contribution</span> <span className="font-mono font-bold text-red-700">AED 500.00</span></p>
                      <p className="flex justify-between"><span className="text-gray-700">Insurance</span> <span className="font-mono font-bold text-red-700">AED 200.00</span></p>
                      <div className="pt-2 border-t-2 border-red-400 flex justify-between font-bold text-base">
                        <span className="text-gray-800">Total Deductions</span>
                        <span className="text-red-700">AED {previewEmployee.deductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className=" p-7 rounded-2xl text-black shadow-2xl">
                  <p className="text-sm font-bold uppercase opacity-90 tracking-widest">💵 Net Payable Amount</p>
                  <p className="text-4xl font-black mt-3">AED {previewEmployee.net.toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-6">
                <Button 
                  label="Print" 
                  variant="secondary" 
                  icon={HiPrinter} 
                  className="flex-1 sm:flex-none"
                />
                <Button 
                  label="Download PDF" 
                  variant="primary" 
                  icon={HiArrowDownTray} 
                  
                  className="flex-1 sm:flex-none"
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
