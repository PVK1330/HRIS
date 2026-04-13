import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiCurrencyDollar, HiDocumentText, HiGift, HiShieldCheck } from 'react-icons/hi2'

export default function EmployeeCompensation() {
  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedMonth, setSelectedMonth] = useState('04')

  const payslips = useMemo(
    () => [
      { id: 1, month: 'April 2026', grossSalary: 15000, deductions: 3000, netSalary: 12000, status: 'Available' },
      { id: 2, month: 'March 2026', grossSalary: 15000, deductions: 3000, netSalary: 12000, status: 'Available' },
      { id: 3, month: 'February 2026', grossSalary: 15000, deductions: 3000, netSalary: 12000, status: 'Available' },
      { id: 4, month: 'January 2026', grossSalary: 15000, deductions: 3000, netSalary: 12000, status: 'Available' },
    ],
    []
  )

  const expenseClaims = useMemo(
    () => [
      { id: 1, category: 'Travel', title: 'Client meeting travel', amount: 450, date: '2026-04-10', status: 'Approved' },
      { id: 2, category: 'Meals', title: 'Team lunch', amount: 120, date: '2026-04-05', status: 'Pending' },
      { id: 3, category: 'Training', title: 'React certification course', amount: 500, date: '2026-03-20', status: 'Approved' },
    ],
    []
  )

  const benefits = useMemo(
    () => [
      { id: 1, name: 'Health Insurance', description: 'Comprehensive medical coverage', value: 'AED 5,000/year', status: 'Active' },
      { id: 2, name: 'Annual Leave', description: '30 days per year', value: '30 days', status: 'Active' },
      { id: 3, name: 'Flight Ticket', description: 'Annual flight allowance', value: 'AED 3,000/year', status: 'Active' },
      { id: 4, name: 'Training Allowance', description: 'Professional development', value: 'AED 2,000/year', status: 'Active' },
    ],
    []
  )

  const statusColor = (status) => {
    if (status === 'Available' || status === 'Active' || status === 'Approved') return 'green'
    if (status === 'Pending') return 'orange'
    if (status === 'Rejected') return 'red'
    return 'gray'
  }

  const payslipColumns = [
    { key: 'month', label: 'Month' },
    { key: 'grossSalary', label: 'Gross Salary (AED)', render: (v) => `AED ${v.toLocaleString()}` },
    { key: 'deductions', label: 'Deductions (AED)', render: (v) => `AED ${v.toLocaleString()}` },
    { key: 'netSalary', label: 'Net Salary (AED)', render: (v) => `AED ${v.toLocaleString()}` },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Download" variant="ghost" size="sm" />,
    },
  ]

  const expenseColumns = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'title', label: 'Description' },
    { key: 'amount', label: 'Amount (AED)', render: (v) => `AED ${v.toLocaleString()}` },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
  ]

  const benefitColumns = [
    { key: 'name', label: 'Benefit' },
    { key: 'description', label: 'Description' },
    { key: 'value', label: 'Value' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Compensation</h1>
        <p className="mt-1 text-sm text-gray-500">View your salary details, payslips, and benefits.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Monthly Salary" value="AED 12,000" subtitle="Net pay" color="green" icon={HiCurrencyDollar} />
        <StatCard title="YTD Earnings" value="AED 48,000" subtitle="Year to date" color="blue" icon={HiCurrencyDollar} />
        <StatCard title="Pending Claims" value="1" subtitle="Awaiting approval" color="orange" icon={HiDocumentText} />
        <StatCard title="Active Benefits" value="4" subtitle="Total benefits" color="green" icon={HiGift} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Salary Breakdown</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Basic Salary</span>
              <span className="font-semibold text-gray-900">AED 10,000</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Housing Allowance</span>
              <span className="font-semibold text-gray-900">AED 3,000</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Transportation</span>
              <span className="font-semibold text-gray-900">AED 1,000</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Other Allowances</span>
              <span className="font-semibold text-gray-900">AED 1,000</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Gross Salary</span>
              <span className="font-semibold text-gray-900">AED 15,000</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Pension Contribution</span>
              <span className="font-semibold text-red-600">-AED 1,500</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-700">Tax Deductions</span>
              <span className="font-semibold text-red-600">-AED 1,500</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-gray-900">Net Salary</span>
              <span className="text-lg font-bold text-gray-900">AED 12,000</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">My Benefits</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Health Insurance</div>
                <div className="text-xs text-gray-500">Comprehensive medical coverage for you and dependents</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">AED 5,000/year</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <HiGift className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Annual Leave</div>
                <div className="text-xs text-gray-500">30 days paid annual leave per year</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">30 days/year</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <HiDocumentText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Flight Ticket</div>
                <div className="text-xs text-gray-500">Annual flight allowance for home country visit</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">AED 3,000/year</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">Payslips</h2>
          <div className="flex gap-3">
            <Input
              label="Year"
              name="year"
              type="select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={[
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
              ]}
              className="w-32"
            />
            <Input
              label="Month"
              name="month"
              type="select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={[
                { value: '04', label: 'April' },
                { value: '03', label: 'March' },
                { value: '02', label: 'February' },
                { value: '01', label: 'January' },
              ]}
              className="w-32"
            />
          </div>
        </div>
        <Table columns={payslipColumns} data={payslips} pageSize={5} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">Expense Claims</h2>
          <Button label="Submit New Claim" variant="primary" />
        </div>
        <Table columns={expenseColumns} data={expenseClaims} pageSize={5} />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">All Benefits</h2>
        <Table columns={benefitColumns} data={benefits} pageSize={5} />
      </div>
    </div>
  )
}
