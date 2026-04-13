import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiCurrencyDollar, HiArrowDown, HiEye } from 'react-icons/hi2'

function statusColor(status) {
  if (status === 'Available') return 'green'
  if (status === 'Pending') return 'orange'
  return 'gray'
}

export default function EmployeePayslips() {
  const [selectedYear, setSelectedYear] = useState('2026')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  const payslips = useMemo(
    () => [
      {
        id: 1,
        month: 'April 2026',
        grossSalary: 15000,
        basicSalary: 10000,
        housingAllowance: 3000,
        transportAllowance: 1000,
        otherAllowance: 1000,
        pensionDeduction: 1500,
        taxDeduction: 1500,
        netSalary: 12000,
        status: 'Available',
        paymentDate: '2026-04-30',
      },
      {
        id: 2,
        month: 'March 2026',
        grossSalary: 15000,
        basicSalary: 10000,
        housingAllowance: 3000,
        transportAllowance: 1000,
        otherAllowance: 1000,
        pensionDeduction: 1500,
        taxDeduction: 1500,
        netSalary: 12000,
        status: 'Available',
        paymentDate: '2026-03-31',
      },
      {
        id: 3,
        month: 'February 2026',
        grossSalary: 15000,
        basicSalary: 10000,
        housingAllowance: 3000,
        transportAllowance: 1000,
        otherAllowance: 1000,
        pensionDeduction: 1500,
        taxDeduction: 1500,
        netSalary: 12000,
        status: 'Available',
        paymentDate: '2026-02-28',
      },
      {
        id: 4,
        month: 'January 2026',
        grossSalary: 15000,
        basicSalary: 10000,
        housingAllowance: 3000,
        transportAllowance: 1000,
        otherAllowance: 1000,
        pensionDeduction: 1500,
        taxDeduction: 1500,
        netSalary: 12000,
        status: 'Available',
        paymentDate: '2026-01-31',
      },
    ],
    []
  )

  const ytdSummary = useMemo(() => {
    const ytdGross = payslips.reduce((acc, p) => acc + p.grossSalary, 0)
    const ytdNet = payslips.reduce((acc, p) => acc + p.netSalary, 0)
    const ytdDeductions = payslips.reduce((acc, p) => acc + p.pensionDeduction + p.taxDeduction, 0)
    return { ytdGross, ytdNet, ytdDeductions }
  }, [payslips])

  const handlePreview = (payslip) => {
    setSelectedPayslip(payslip)
    setPreviewModalOpen(true)
  }

  const handleDownload = (payslip) => {
    console.log('Download payslip:', payslip.month)
  }

  const columns = [
    { key: 'month', label: 'Month' },
    { key: 'grossSalary', label: 'Gross (AED)', render: (v) => `AED ${v.toLocaleString()}` },
    { key: 'deductions', label: 'Deductions (AED)', render: (_, row) => `AED ${(row.pensionDeduction + row.taxDeduction).toLocaleString()}` },
    { key: 'netSalary', label: 'Net (AED)', render: (v) => `AED ${v.toLocaleString()}` },
    { key: 'paymentDate', label: 'Payment Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handlePreview(row)} />
          <Button label="Download" variant="ghost" size="sm" icon={HiArrowDown} onClick={() => handleDownload(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="mt-1 text-sm text-gray-500">View and download your monthly payslips.</p>
        </div>
        <Input
          label="Select Year"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Monthly Net" value="AED 12,000" subtitle="Current month" color="green" icon={HiCurrencyDollar} />
        <StatCard title="YTD Gross" value={`AED ${ytdSummary.ytdGross.toLocaleString()}`} subtitle="Year to date" color="blue" icon={HiCurrencyDollar} />
        <StatCard title="YTD Deductions" value={`AED ${ytdSummary.ytdDeductions.toLocaleString()}`} subtitle="Year to date" color="red" icon={HiCurrencyDollar} />
      </div>

      <Table columns={columns} data={payslips} pageSize={10} />

      {selectedPayslip && (
        <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title={`Payslip - ${selectedPayslip.month}`} size="lg">
          <div className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Salary Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Basic Salary</span>
                  <span className="font-medium text-gray-900">AED {selectedPayslip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Housing Allowance</span>
                  <span className="font-medium text-gray-900">AED {selectedPayslip.housingAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Transport Allowance</span>
                  <span className="font-medium text-gray-900">AED {selectedPayslip.transportAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Other Allowances</span>
                  <span className="font-medium text-gray-900">AED {selectedPayslip.otherAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold">
                  <span className="text-gray-900">Gross Salary</span>
                  <span className="text-gray-900">AED {selectedPayslip.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Deductions</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Pension Contribution</span>
                  <span className="font-medium text-red-600">-AED {selectedPayslip.pensionDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Tax Deductions</span>
                  <span className="font-medium text-red-600">-AED {selectedPayslip.taxDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-red-200 pt-3 text-sm font-semibold">
                  <span className="text-gray-900">Total Deductions</span>
                  <span className="text-red-600">-AED {(selectedPayslip.pensionDeduction + selectedPayslip.taxDeduction).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">Net Salary</h3>
                  <p className="text-sm text-gray-600">Amount credited to your account</p>
                </div>
                <div className="text-2xl font-bold text-green-600">AED {selectedPayslip.netSalary.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Payment Date: {selectedPayslip.paymentDate}</span>
              <span>Status: {selectedPayslip.status}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button label="Close" variant="ghost" onClick={() => setPreviewModalOpen(false)} />
              <Button label="Download PDF" variant="primary" icon={HiArrowDown} onClick={() => handleDownload(selectedPayslip)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
