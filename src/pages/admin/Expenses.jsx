import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employees, expenseClaims, expenseKpis } from '../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  employeeId: '',
  expenseCategory: '',
  expenseTitle: '',
  amount: '',
  currency: '',
  expenseDate: '',
  paymentMethod: '',
  projectDepartment: '',
  description: '',
}

function statusColor(s) {
  if (s === 'Approved') return 'green'
  if (s === 'Pending') return 'orange'
  if (s === 'Rejected') return 'red'
  return 'gray'
}

export default function Expenses() {
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ]

  const filtered = useMemo(() => {
    if (!status) return expenseClaims
    return expenseClaims.filter((e) => e.status === status)
  }, [status])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (key) => (fileList) => {
    setFiles((prev) => ({ ...prev, [key]: fileList }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setFiles({})
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files })
    handleCloseModal()
  }

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'category', label: 'Category' },
    {
      key: 'amount',
      label: 'Amount (AED)',
      render: (v) => <span className="font-semibold text-gray-900">{Number(v).toLocaleString()}</span>,
    },
    { key: 'submitted', label: 'Submitted' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button label="Approve" variant="secondary" size="sm" />
          <Button label="Reject" variant="ghost" size="sm" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">Approve claims and monitor spend.</p>
        </div>
        <Button label="Submit expense claim" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Pending (AED)"
          value={expenseKpis.pendingAmount.toLocaleString()}
          subtitle="Awaiting approval"
          color="orange"
        />
        <StatCard
          title="Approved this month"
          value={expenseKpis.approvedThisMonth}
          subtitle="Claims"
          color="green"
        />
        <StatCard title="Rejected" value={expenseKpis.rejected} subtitle="This month" color="red" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Status"
          name="status"
          type="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Submit Expense Claim" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Claim details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="exp-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="exp-employee"
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
            <div className="w-full">
              <label htmlFor="exp-category" className="mb-1 block text-sm font-medium text-gray-700">
                Expense Category
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="exp-category"
                name="expenseCategory"
                value={formData.expenseCategory}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select category
                </option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Equipment">Equipment</option>
                <option value="Training">Training</option>
                <option value="Medical">Medical</option>
                <option value="Communication">Communication</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Expense Title"
              name="expenseTitle"
              value={formData.expenseTitle}
              onChange={handleFormChange}
              placeholder="e.g. Client dinner - April 2024"
              required
            />
            <Input
              label="Amount"
              name="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="exp-currency" className="mb-1 block text-sm font-medium text-gray-700">
                Currency
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="exp-currency"
                name="currency"
                value={formData.currency}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select currency
                </option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <Input
              label="Expense Date"
              name="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="exp-payment" className="mb-1 block text-sm font-medium text-gray-700">
                Payment Method
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="exp-payment"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select method
                </option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </div>
            <Input
              label="Project / Department"
              name="projectDepartment"
              value={formData.projectDepartment}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="exp-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="exp-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Receipts & proof
          </p>
          <FileUpload
            label="Receipt / Invoice"
            name="receipts"
            accept=".jpg,.png,.pdf"
            multiple
            onChange={handleFileChange('receipts')}
            helpText="Upload all receipts"
            required
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
