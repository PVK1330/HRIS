import React, { useState } from 'react';
import { HiCurrencyDollar, HiChartBar, HiArrowDownTray, HiPlay, HiCheckCircle, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { payrollData, employees } from '../../../data/mockData.js';

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]?.id || '');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
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

            <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border-tertiary bg-background-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Salary Overview</h3>
                <div className="flex gap-2">
                  <Button label="Filters" variant="ghost" size="sm" icon={HiFunnel} />
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
                  { key: 'actions', label: 'Actions', render: () => (
                    <div className="flex gap-1">
                      <Button label="Edit" variant="ghost" size="sm" />
                      <Button label="Slip" variant="ghost" size="sm" />
                    </div>
                  )}
                ]} 
                data={payrollData} 
                pageSize={5} 
              />
            </div>
          </div>
        );
      case 'generator':
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
                data={payrollData} 
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
          { id: 'generator', label: 'Payslip Generator', icon: HiCurrencyDollar },
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
    </div>
  );
}
