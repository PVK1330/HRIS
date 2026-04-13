import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiCurrencyDollar, HiPencil, HiTrash, HiEye } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  expenseCategory: '',
  expenseTitle: '',
  amount: '',
  currency: 'AED',
  expenseDate: '',
  paymentMethod: '',
  projectDepartment: '',
  description: '',
}

function statusColor(status) {
  if (status === 'Approved') return 'green'
  if (status === 'Pending') return 'orange'
  if (status === 'Rejected') return 'red'
  return 'gray'
}

export default function EmployeeExpenseClaims() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [status, setStatus] = useState('')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)

  const expenseClaims = useMemo(
    () => [
      {
        id: 1,
        category: 'Travel',
        title: 'Client meeting travel',
        amount: 450,
        currency: 'AED',
        date: '2026-04-10',
        paymentMethod: 'Credit Card',
        project: 'HRIS Platform',
        description: 'Flight and accommodation for client meeting in Abu Dhabi',
        status: 'Approved',
        submittedOn: '2026-04-11',
      },
      {
        id: 2,
        category: 'Meals',
        title: 'Team lunch',
        amount: 120,
        currency: 'AED',
        date: '2026-04-05',
        paymentMethod: 'Cash',
        project: 'HRIS Platform',
        description: 'Team lunch for project milestone celebration',
        status: 'Pending',
        submittedOn: '2026-04-06',
      },
      {
        id: 3,
        category: 'Training',
        title: 'React certification course',
        amount: 500,
        currency: 'AED',
        date: '2026-03-20',
        paymentMethod: 'Credit Card',
        project: 'Professional Development',
        description: 'Online React certification course fee',
        status: 'Approved',
        submittedOn: '2026-03-21',
      },
      {
        id: 4,
        category: 'Equipment',
        title: 'External monitor',
        amount: 800,
        currency: 'AED',
        date: '2026-03-15',
        paymentMethod: 'Credit Card',
        project: 'HRIS Platform',
        description: 'Additional monitor for improved productivity',
        status: 'Rejected',
        submittedOn: '2026-03-16',
      },
    ],
    []
  )

  const summary = useMemo(() => {
    const pending = expenseClaims.filter((e) => e.status === 'Pending')
    const approved = expenseClaims.filter((e) => e.status === 'Approved')
    const pendingAmount = pending.reduce((acc, e) => acc + e.amount, 0)
    const approvedAmount = approved.reduce((acc, e) => acc + e.amount, 0)
    return { pending: pending.length, approved: approved.length, pendingAmount, approvedAmount }
  }, [expenseClaims])

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
    setEditMode(false)
    setEditingId(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files, editMode, editingId })
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const claim = expenseClaims.find((c) => c.id === id)
    if (claim) {
      setFormData({
        expenseCategory: claim.category,
        expenseTitle: claim.title,
        amount: claim.amount.toString(),
        currency: claim.currency,
        expenseDate: claim.date,
        paymentMethod: claim.paymentMethod,
        projectDepartment: claim.project,
        description: claim.description,
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this expense claim?')) {
      console.log('Delete expense claim:', id)
    }
  }

  const handleView = (id) => {
    const claim = expenseClaims.find((c) => c.id === id)
    if (claim) {
      setSelectedClaim(claim)
      setViewModalOpen(true)
    }
  }

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'title', label: 'Description' },
    { key: 'project', label: 'Project' },
    {
      key: 'amount',
      label: 'Amount',
      render: (v, row) => `${row.currency} ${v.toLocaleString()}`,
    },
    { key: 'submittedOn', label: 'Submitted' },
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
          <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(row.id)} />
          <Button
            label="Edit"
            variant="ghost"
            size="sm"
            icon={HiPencil}
            onClick={() => handleEdit(row.id)}
            disabled={row.status === 'Approved' || row.status === 'Rejected'}
          />
          <Button
            label="Delete"
            variant="ghost"
            size="sm"
            icon={HiTrash}
            onClick={() => handleDelete(row.id)}
            disabled={row.status === 'Approved'}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Expense Claims</h1>
          <p className="mt-1 text-sm text-gray-500">Submit and track your expense claims.</p>
        </div>
        <Button label="Submit New Claim" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending Amount" value={`AED ${summary.pendingAmount.toLocaleString()}`} subtitle="Awaiting approval" color="orange" icon={HiCurrencyDollar} />
        <StatCard title="Approved Amount" value={`AED ${summary.approvedAmount.toLocaleString()}`} subtitle="This month" color="green" icon={HiCurrencyDollar} />
        <StatCard title="Pending Claims" value={summary.pending} subtitle="Awaiting approval" color="orange" icon={HiCurrencyDollar} />
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

      <Table columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Expense Claim' : 'Submit Expense Claim'} size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
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
            Receipts & Proof
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
            <Button type="submit" label={editMode ? 'Update Claim' : 'Submit Claim'} variant="primary" />
          </div>
        </form>
      </Modal>

      {selectedClaim && (
        <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Expense Claim Details - ${selectedClaim.title}`} size="lg">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Category</h3>
                <p className="text-gray-900">{selectedClaim.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Amount</h3>
                <p className="text-gray-900">{selectedClaim.currency} {selectedClaim.amount.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Date</h3>
                <p className="text-gray-900">{selectedClaim.date}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Payment Method</h3>
                <p className="text-gray-900">{selectedClaim.paymentMethod}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Project</h3>
                <p className="text-gray-900">{selectedClaim.project}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                <Badge label={selectedClaim.status} color={statusColor(selectedClaim.status)} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Description</h3>
              <p className="text-gray-900">{selectedClaim.description}</p>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Submitted on: {selectedClaim.submittedOn}</span>
            </div>
            <div className="flex justify-end">
              <Button label="Close" variant="secondary" onClick={() => setViewModalOpen(false)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
