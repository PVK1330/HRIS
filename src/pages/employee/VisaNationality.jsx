import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { HiCreditCard, HiExclamationTriangle, HiDocumentText } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  passportNumber: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  countryOfIssue: '',
  visaType: '',
  visaNumber: '',
  visaIssueDate: '',
  visaExpiryDate: '',
  issuedBy: '',
  sponsoringEntity: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
}

export default function EmployeeVisaNationality() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const visaData = {
    nationality: 'United Kingdom',
    passportNumber: 'P1234567',
    passportIssueDate: '2020-03-15',
    passportExpiryDate: '2030-03-14',
    countryOfIssue: 'United Kingdom',
    visaType: 'Employment',
    visaNumber: 'V987654321',
    visaIssueDate: '2024-01-10',
    visaExpiryDate: '2026-01-09',
    issuedBy: 'GDRFA Dubai',
    sponsoringEntity: 'Company LLC',
    emiratesIdNumber: '784-2024-1234567-1',
    emiratesIdExpiry: '2029-01-09',
  }

  const daysUntilExpiry = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const passportDaysLeft = daysUntilExpiry(visaData.passportExpiryDate)
  const visaDaysLeft = daysUntilExpiry(visaData.visaExpiryDate)
  const emiratesIdDaysLeft = daysUntilExpiry(visaData.emiratesIdExpiry)

  const getStatus = (days) => {
    if (days < 30) return { label: 'Critical', color: 'red' }
    if (days < 90) return { label: 'Expiring Soon', color: 'orange' }
    return { label: 'Valid', color: 'green' }
  }

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

  const openEditModal = () => {
    setFormData({
      ...initialFormData,
      passportNumber: visaData.passportNumber,
      passportIssueDate: visaData.passportIssueDate,
      passportExpiryDate: visaData.passportExpiryDate,
      countryOfIssue: visaData.countryOfIssue,
      visaType: visaData.visaType,
      visaNumber: visaData.visaNumber,
      visaIssueDate: visaData.visaIssueDate,
      visaExpiryDate: visaData.visaExpiryDate,
      issuedBy: visaData.issuedBy,
      sponsoringEntity: visaData.sponsoringEntity,
      emiratesIdNumber: visaData.emiratesIdNumber,
      emiratesIdExpiry: visaData.emiratesIdExpiry,
    })
    setEditMode(true)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Visa & Nationality</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your visa and passport details.</p>
        </div>
        <Button label="Update Details" variant="primary" onClick={openEditModal} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Passport"
          value={getStatus(passportDaysLeft).label}
          subtitle={`${passportDaysLeft} days remaining`}
          color={getStatus(passportDaysLeft).color}
          icon={HiCreditCard}
        />
        <StatCard
          title="Visa"
          value={getStatus(visaDaysLeft).label}
          subtitle={`${visaDaysLeft} days remaining`}
          color={getStatus(visaDaysLeft).color}
          icon={HiCreditCard}
        />
        <StatCard
          title="Emirates ID"
          value={getStatus(emiratesIdDaysLeft).label}
          subtitle={`${emiratesIdDaysLeft} days remaining`}
          color={getStatus(emiratesIdDaysLeft).color}
          icon={HiDocumentText}
        />
      </div>

      {passportDaysLeft < 90 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          <HiExclamationTriangle className="h-4 w-4" />
          <span>Your passport expires in {passportDaysLeft} days. Please renew soon.</span>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Personal Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Nationality</h3>
            <p className="text-gray-900">{visaData.nationality}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Passport Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Passport Number</h3>
            <p className="text-gray-900">{visaData.passportNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Country of Issue</h3>
            <p className="text-gray-900">{visaData.countryOfIssue}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Issue Date</h3>
            <p className="text-gray-900">{visaData.passportIssueDate}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Expiry Date</h3>
            <p className="text-gray-900">{visaData.passportExpiryDate}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Visa Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Visa Type</h3>
            <p className="text-gray-900">{visaData.visaType}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Visa Number</h3>
            <p className="text-gray-900">{visaData.visaNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Issue Date</h3>
            <p className="text-gray-900">{visaData.visaIssueDate}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Expiry Date</h3>
            <p className="text-gray-900">{visaData.visaExpiryDate}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Issued By</h3>
            <p className="text-gray-900">{visaData.issuedBy}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Sponsoring Entity</h3>
            <p className="text-gray-900">{visaData.sponsoringEntity}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Emirates ID</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Emirates ID Number</h3>
            <p className="text-gray-900">{visaData.emiratesIdNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Expiry Date</h3>
            <p className="text-gray-900">{visaData.emiratesIdExpiry}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Update Visa & Passport Details" size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Passport Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Passport Number"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Passport Issue Date"
              name="passportIssueDate"
              type="date"
              value={formData.passportIssueDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Passport Expiry Date"
              name="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Country of Issue"
              name="countryOfIssue"
              value={formData.countryOfIssue}
              onChange={handleFormChange}
              required
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Visa Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="w-full">
              <label htmlFor="visa-type" className="mb-1 block text-sm font-medium text-gray-700">
                Visa Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="visa-type"
                name="visaType"
                value={formData.visaType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select visa type
                </option>
                <option value="Employment">Employment</option>
                <option value="Residence">Residence</option>
                <option value="Visit">Visit</option>
                <option value="Investor">Investor</option>
                <option value="Student">Student</option>
                <option value="Dependent">Dependent</option>
              </select>
            </div>
            <Input
              label="Visa Number"
              name="visaNumber"
              value={formData.visaNumber}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Visa Issue Date"
              name="visaIssueDate"
              type="date"
              value={formData.visaIssueDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Visa Expiry Date"
              name="visaExpiryDate"
              type="date"
              value={formData.visaExpiryDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Issued By"
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleFormChange}
              placeholder="e.g. GDRFA Dubai"
            />
            <Input
              label="Sponsoring Entity"
              name="sponsoringEntity"
              value={formData.sponsoringEntity}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Emirates ID
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Emirates ID Number"
              name="emiratesIdNumber"
              value={formData.emiratesIdNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Emirates ID Expiry"
              name="emiratesIdExpiry"
              type="date"
              value={formData.emiratesIdExpiry}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Documents
          </p>
          <div className="space-y-4">
            <FileUpload
              label="Passport Scan"
              name="passportScan"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('passportScan')}
              required
            />
            <FileUpload
              label="Visa Copy"
              name="visaCopy"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('visaCopy')}
              required
            />
            <FileUpload
              label="Emirates ID Front"
              name="emiratesIdFront"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('emiratesIdFront')}
            />
            <FileUpload
              label="Emirates ID Back"
              name="emiratesIdBack"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('emiratesIdBack')}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
