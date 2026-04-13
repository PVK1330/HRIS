import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiDocumentText, HiArrowDownTray, HiUpload } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const mandatoryDocuments = [
  'Passport',
  'National ID',
  'Education Certificates',
  'Contract',
  'Offer Letter',
  'Experience Letters',
]

const initialFormData = {
  documentType: '',
  documentTitle: '',
  documentNumber: '',
  issueDate: '',
  expiryDate: '',
  issuedBy: '',
  notes: '',
}

function statusColor(status) {
  if (status === 'Approved') return 'green'
  if (status === 'Pending') return 'orange'
  if (status === 'Rejected') return 'red'
  if (status === 'Submitted') return 'blue'
  return 'gray'
}

export default function EmployeeDocuments() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const myDocuments = [
    {
      id: 1,
      docType: 'Passport',
      title: 'Passport - John Smith',
      version: 'v2.0',
      submittedDate: '2026-04-10',
      status: 'Approved',
      expiryDate: '2030-03-14',
    },
    {
      id: 2,
      docType: 'Emirates ID',
      title: 'Emirates ID - John Smith',
      version: 'v1.0',
      submittedDate: '2024-01-15',
      status: 'Approved',
      expiryDate: '2029-01-09',
    },
    {
      id: 3,
      docType: 'Contract',
      title: 'Employment Contract',
      version: 'v3.1',
      submittedDate: '2026-03-20',
      status: 'Approved',
      expiryDate: '2027-03-19',
    },
    {
      id: 4,
      docType: 'Education Certificate',
      title: 'Bachelor Degree Certificate',
      version: 'v1.0',
      submittedDate: '2024-01-20',
      status: 'Approved',
      expiryDate: '-',
    },
    {
      id: 5,
      docType: 'Experience Letter',
      title: 'Previous Employment Letter',
      version: 'v1.0',
      submittedDate: '2024-01-22',
      status: 'Approved',
      expiryDate: '-',
    },
  ]

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

  const handleDownload = (doc) => {
    console.log('Download document:', doc.id)
  }

  const handleUploadNew = (docType) => {
    setFormData({ ...initialFormData, documentType: docType })
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your HR documents.</p>
        </div>
        <Button label="Upload Document" variant="primary" icon={HiUpload} onClick={() => setModalOpen(true)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Mandatory Document Checklist</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mandatoryDocuments.map((doc) => {
            const submitted = myDocuments.some((d) => d.docType === doc && d.status === 'Approved')
            return (
              <div key={doc} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full ${submitted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {submitted ? '✓' : '○'}
                </div>
                <span className="text-sm font-medium text-gray-700">{doc}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900 mb-4">My Documents</h2>
        <div className="space-y-3">
          {myDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <HiDocumentText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{doc.title}</div>
                  <div className="text-xs text-gray-500">
                    {doc.docType} • {doc.version} • Submitted: {doc.submittedDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge label={doc.status} color={statusColor(doc.status)} />
                <Button
                  label="Download"
                  variant="ghost"
                  size="sm"
                  icon={HiArrowDownTray}
                  onClick={() => handleDownload(doc)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Document Version History</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Passport - John Smith</div>
              <div className="text-xs text-gray-500">v2.0 • Uploaded Apr 10, 2026</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label="Current" color="green" size="sm" />
              <Button label="View" variant="ghost" size="sm" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Passport - John Smith</div>
              <div className="text-xs text-gray-500">v1.0 • Uploaded Jan 15, 2025</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label="Archived" color="gray" size="sm" />
              <Button label="View" variant="ghost" size="sm" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Employment Contract</div>
              <div className="text-xs text-gray-500">v3.1 • Updated Mar 20, 2026</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label="Current" color="green" size="sm" />
              <Button label="View" variant="ghost" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Upload Document" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Document details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="doc-type" className="mb-1 block text-sm font-medium text-gray-700">
                Document Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="doc-type"
                name="documentType"
                value={formData.documentType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                <option value="Passport">Passport</option>
                <option value="Emirates ID">Emirates ID</option>
                <option value="Visa">Visa</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Contract">Contract</option>
                <option value="Payslip">Payslip</option>
                <option value="Certificate">Certificate</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Document Title"
              name="documentTitle"
              value={formData.documentTitle}
              onChange={handleFormChange}
              placeholder="e.g. Passport - John Doe"
              required
            />
            <Input
              label="Document Number"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Issue Date"
              name="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={handleFormChange}
            />
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleFormChange}
            />
            <Input
              label="Issued By / Authority"
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="doc-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="doc-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Upload
          </p>
          <FileUpload
            label="Document File"
            name="documentFile"
            accept=".jpg,.png,.pdf,.doc,.docx"
            onChange={handleFileChange('documentFile')}
            helpText="Max 10MB"
            required
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Submit" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
