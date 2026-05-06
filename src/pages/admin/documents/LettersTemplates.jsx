import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { employees, letterTemplates, lettersKpis } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

function suggestReference() {
  const y = new Date().getFullYear()
  const n = Math.floor(1000 + Math.random() * 9000)
  return `REF-${y}-${n}`
}

const initialFormData = {
  employeeId: '',
  letterType: '',
  letterDate: '',
  validUntil: '',
  addressedTo: '',
  referenceNumber: '',
  specialNotes: '',
  authorizedSignatory: '',
  includeCompanyStamp: false,
  includeSignature: false,
}

const initialTemplateData = {
  templateName: '',
  templateType: '',
  subject: '',
  body: '',
}

const initialBulkSendData = {
  selectedDepartment: '',
  selectedTemplate: '',
  subject: '',
  body: '',
}

function statusColor(s) {
  if (s === 'Active') return 'green'
  if (s === 'Draft') return 'orange'
  return 'gray'
}

export default function LettersTemplates() {
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templateFormData, setTemplateFormData] = useState(initialTemplateData)
  const [bulkSendModalOpen, setBulkSendModalOpen] = useState(false)
  const [bulkSendData, setBulkSendData] = useState(initialBulkSendData)
  const [selectedEmployees, setSelectedEmployees] = useState(new Set())
  const [templatesList, setTemplatesList] = useState(letterTemplates)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [editTemplateModalOpen, setEditTemplateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [editFormData, setEditFormData] = useState(initialTemplateData)
  const [generateLetterModalOpen, setGenerateLetterModalOpen] = useState(false)
  const [selectedTemplateForGenerate, setSelectedTemplateForGenerate] = useState(null)
  const [generateFormData, setGenerateFormData] = useState({ employeeId: '' })

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return templatesList
    return templatesList.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(query))
  }, [q, templatesList])

  const openModal = () => {
    setFormData({
      ...initialFormData,
      referenceNumber: suggestReference(),
    })
    setModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name) => (checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData })
    handleCloseModal()
  }

  // Template Creation Handlers
  const handleOpenTemplateModal = () => {
    setTemplateFormData(initialTemplateData)
    setTemplateModalOpen(true)
  }

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false)
    setTemplateFormData(initialTemplateData)
  }

  const handleTemplateFormChange = (e) => {
    const { name, value } = e.target
    setTemplateFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveTemplate = (e) => {
    e.preventDefault()
    if (!templateFormData.templateName || !templateFormData.templateType || !templateFormData.subject || !templateFormData.body) {
      alert('Please fill in all fields')
      return
    }
    
    const newTemplate = {
      id: templatesList.length + 1,
      name: templateFormData.templateName,
      category: templateFormData.templateType,
      status: 'Active',
      updatedAt: new Date().toLocaleDateString('en-GB'),
      subject: templateFormData.subject,
      body: templateFormData.body,
    }
    
    setTemplatesList((prev) => [...prev, newTemplate])
    alert('Template created successfully!')
    handleCloseTemplateModal()
  }

  // Bulk Send Handlers
  const handleOpenBulkSendModal = () => {
    setSelectedEmployees(new Set())
    setBulkSendData(initialBulkSendData)
    setBulkSendModalOpen(true)
  }

  const handleCloseBulkSendModal = () => {
    setBulkSendModalOpen(false)
    setBulkSendData(initialBulkSendData)
  }

  const handleBulkSendChange = (e) => {
    const { name, value } = e.target
    setBulkSendData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendBulk = (e) => {
    e.preventDefault()
    if (!bulkSendData.selectedTemplate) {
      alert('Please select a template')
      return
    }
    
    const selectedCount = selectedEmployees.size
    alert(`Letter sent to ${selectedCount} employee(s)!`)
    setSelectedEmployees(new Set())
    handleCloseBulkSendModal()
  }

  const toggleEmployeeSelection = (employeeId) => {
    const newSelection = new Set(selectedEmployees)
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId)
    } else {
      newSelection.add(employeeId)
    }
    setSelectedEmployees(newSelection)
  }

  // Preview Template Handlers
  const handleOpenPreviewModal = (template) => {
    setPreviewTemplate(template)
    setPreviewModalOpen(true)
  }

  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false)
    setPreviewTemplate(null)
  }

  // Edit Template Handlers
  const handleOpenEditTemplateModal = (template) => {
    setEditingTemplate(template)
    setEditFormData({
      templateName: template.name,
      templateType: template.category,
      subject: template.subject || '',
      body: template.body || '',
    })
    setEditTemplateModalOpen(true)
  }

  const handleCloseEditTemplateModal = () => {
    setEditTemplateModalOpen(false)
    setEditingTemplate(null)
    setEditFormData(initialTemplateData)
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateTemplate = (e) => {
    e.preventDefault()
    if (!editFormData.templateName || !editFormData.templateType || !editFormData.subject || !editFormData.body) {
      alert('Please fill in all fields')
      return
    }

    setTemplatesList((prev) =>
      prev.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: editFormData.templateName,
              category: editFormData.templateType,
              subject: editFormData.subject,
              body: editFormData.body,
              updatedAt: new Date().toLocaleDateString('en-GB'),
            }
          : t
      )
    )
    alert('Template updated successfully!')
    handleCloseEditTemplateModal()
  }

  // Generate Letter Handlers
  const handleOpenGenerateLetterModal = (template) => {
    setSelectedTemplateForGenerate(template)
    setGenerateFormData({ employeeId: '' })
    setGenerateLetterModalOpen(true)
  }

  const handleCloseGenerateLetterModal = () => {
    setGenerateLetterModalOpen(false)
    setSelectedTemplateForGenerate(null)
    setGenerateFormData({ employeeId: '' })
  }

  const handleGenerateFormChange = (e) => {
    const { name, value } = e.target
    setGenerateFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendLetter = (e) => {
    e.preventDefault()
    if (!generateFormData.employeeId || !selectedTemplateForGenerate) {
      alert('Please select an employee')
      return
    }

    const selectedEmployee = employees.find((e) => e.id === parseInt(generateFormData.employeeId))
    alert(`Letter sent to ${selectedEmployee.name}!`)
    handleCloseGenerateLetterModal()
  }

  const handleDownloadPDF = (template, employeeId) => {
    if (!employeeId && !selectedTemplateForGenerate) {
      alert('Please select an employee first')
      return
    }

    const selectedEmployee = employeeId
      ? employees.find((e) => e.id === parseInt(employeeId))
      : employees.find((e) => e.id === parseInt(generateFormData.employeeId))

    if (!selectedEmployee) {
      alert('Employee not found')
      return
    }

    const letterContent = `
LETTER

Date: ${new Date().toLocaleDateString('en-GB')}
Reference: REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}

To,
${selectedEmployee.name}
${selectedEmployee.jobTitle}
${selectedEmployee.department}

${selectedEmployee.empId}

Subject: ${template.subject || 'Official Letter'}

Dear ${selectedEmployee.name},

${template.body || 'No content'}

---
Employee ID: ${selectedEmployee.empId}
Department: ${selectedEmployee.department}
Job Title: ${selectedEmployee.jobTitle}

Generated on: ${new Date().toLocaleDateString('en-GB')}
    `

    const element = document.createElement('div')
    element.innerHTML = `<pre>${letterContent}</pre>`
    element.style.padding = '20px'
    element.style.fontFamily = 'Arial, sans-serif'
    element.style.lineHeight = '1.6'

    const opt = {
      margin: 10,
      filename: `${template.name}_${selectedEmployee.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    }

    // Using a simple approach with canvas and basic PDF generation
    const canvas = document.createElement('canvas')
    canvas.innerHTML = letterContent
    
    // Create a simple text-based PDF download
    const link = document.createElement('a')
    const textContent = letterContent
    const blob = new Blob([textContent], { type: 'text/plain' })
    link.href = URL.createObjectURL(blob)
    link.download = `${template.name.replace(/\s+/g, '_')}_${selectedEmployee.name.replace(/\s+/g, '_')}.txt`
    link.click()
    URL.revokeObjectURL(link.href)

    alert('Letter downloaded as text file! For PDF, please install html2pdf library.')
  }

  const isCustom = formData.letterType === 'Custom'

  // Get unique departments from employees
  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((emp) => emp.department))].sort()
    return depts
  }, [])

  // Get employees filtered by selected department
  const employeesByDepartment = useMemo(() => {
    if (!bulkSendData.selectedDepartment) return []
    return employees.filter((emp) => emp.department === bulkSendData.selectedDepartment)
  }, [bulkSendData.selectedDepartment])

  const columns = [

    { key: 'name', label: 'Template' },
    { key: 'category', label: 'Category' },
    { key: 'updatedAt', label: 'Updated' },
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
          <button
            onClick={() => handleOpenPreviewModal(row)}
            className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
          >
            Preview
          </button>
          <button
            onClick={() => handleOpenEditTemplateModal(row)}
            className="px-3 py-1 rounded text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleOpenGenerateLetterModal(row)}
            className="px-3 py-1 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200 transition"
          >
            Generate
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Letters &amp; Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Standard HR letters and merge-ready templates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="New template" className='bg-orange-600 hover:bg-orange-700' onClick={handleOpenTemplateModal} />
          <Button label="Bulk send" variant="secondary" onClick={handleOpenBulkSendModal} />
          <Button label="Generate letter" variant="primary" onClick={openModal} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Templates" value={lettersKpis.templates} subtitle="Library" color="blue" />
        <StatCard title="Generated this month" value={lettersKpis.generatedThisMonth} subtitle="Letters" color="green" />
        <StatCard title="Pending signatures" value={lettersKpis.pendingSignatures} subtitle="Awaiting" color="orange" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Search"
          name="q"
          placeholder="Template name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Letter History</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Offer Letter - John Smith</div>
                <div className="text-xs text-gray-500">Generated on Apr 10, 2026</div>
              </div>
              <Badge label="Sent" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Salary Certificate - Sarah Johnson</div>
                <div className="text-xs text-gray-500">Generated on Apr 8, 2026</div>
              </div>
              <Badge label="Sent" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">NOC Letter - Michael Brown</div>
                <div className="text-xs text-gray-500">Generated on Apr 5, 2026</div>
              </div>
              <Badge label="Draft" color="orange" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Dynamic Placeholders</h2>
          <p className="mt-1 text-sm text-gray-500">Available placeholders for auto-fill</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Employee Name}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Employee ID}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Department}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Job Title}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Join Date}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Salary}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Company Name}'}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <code className="text-blue-600">{'{Reference No}'}</code>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Generate Letter" size="xl">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Letter details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="lt-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="lt-employee"
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
              <label htmlFor="lt-type" className="mb-1 block text-sm font-medium text-gray-700">
                Letter Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="lt-type"
                name="letterType"
                value={formData.letterType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select letter type
                </option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Appointment Letter">Appointment Letter</option>
                <option value="Salary Certificate">Salary Certificate</option>
                <option value="Experience Letter">Experience Letter</option>
                <option value="NOC Letter">NOC Letter</option>
                <option value="Warning Letter">Warning Letter</option>
                <option value="Probation Confirmation">Probation Confirmation</option>
                <option value="Termination Letter">Termination Letter</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <Input
              label="Letter Date"
              name="letterDate"
              type="date"
              value={formData.letterDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Valid Until"
              name="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={handleFormChange}
            />
            <Input
              label="Addressed To"
              name="addressedTo"
              value={formData.addressedTo}
              onChange={handleFormChange}
              placeholder="To Whom It May Concern"
            />
            <Input
              label="Reference Number"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleFormChange}
              placeholder="REF-YYYY-####"
            />
            <div className="w-full">
              <label htmlFor="lt-signatory" className="mb-1 block text-sm font-medium text-gray-700">
                Authorized Signatory
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="lt-signatory"
                name="authorizedSignatory"
                value={formData.authorizedSignatory}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select signatory
                </option>
                <option value="HR Manager">HR Manager</option>
                <option value="CEO">CEO</option>
                <option value="Department Head">Department Head</option>
              </select>
            </div>
          </div>

          {isCustom && (
            <div className="mt-3 w-full">
              <label htmlFor="lt-custom" className="mb-1 block text-sm font-medium text-gray-700">
                Special Notes / Custom Content
              </label>
              <textarea
                id="lt-custom"
                name="specialNotes"
                value={formData.specialNotes}
                onChange={handleFormChange}
                className={textareaClass}
                rows={4}
              />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4">
            <Toggle
              label="Include Company Stamp"
              checked={formData.includeCompanyStamp}
              onChange={handleToggle('includeCompanyStamp')}
            />
            <Toggle
              label="Include Signature"
              checked={formData.includeSignature}
              onChange={handleToggle('includeSignature')}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>

      {/* Template Creation Modal */}
      <Modal
        isOpen={templateModalOpen}
        onClose={handleCloseTemplateModal}
        title="Create New Template"
        size="xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="templateName"
              value={templateFormData.templateName}
              onChange={handleTemplateFormChange}
              placeholder="Enter template name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type
              <span className="text-red-500"> *</span>
            </label>
            <select
              name="templateType"
              value={templateFormData.templateType}
              onChange={handleTemplateFormChange}
              className={selectClass}
              required
            >
              <option value="" disabled hidden>
                Select template type
              </option>
              <option value="Job Offer">Job Offer</option>
              <option value="Promotion">Promotion</option>
              <option value="Termination">Termination</option>
              <option value="Certification">Certification</option>
              <option value="Experience">Experience</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="subject"
              value={templateFormData.subject}
              onChange={handleTemplateFormChange}
              placeholder="Enter email subject"
             
              required

            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
              <span className="text-red-500"> *</span>
            </label>
            <textarea
              name="body"
              value={templateFormData.body}
              onChange={handleTemplateFormChange}
              placeholder="Enter template body"
              className={textareaClass}
              rows="8"
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseTemplateModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#004CA5] text-white hover:bg-blue-700 transition"
            >
              Save Template
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Send Modal */}
      <Modal
        isOpen={bulkSendModalOpen}
        onClose={handleCloseBulkSendModal}
        title="Bulk Send"
        size="xl"
      >
        <form onSubmit={handleSendBulk} className="space-y-4">
          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Department
              <span className="text-red-500"> *</span>
            </label>
            <select
              name="selectedDepartment"
              value={bulkSendData.selectedDepartment}
              onChange={handleBulkSendChange}
              className={selectClass}
              required
            >
              <option value="" disabled hidden>
                Choose a department
              </option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Employees List - Show only if department is selected */}
          {bulkSendData.selectedDepartment && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  Employees in {bulkSendData.selectedDepartment}
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                  {selectedEmployees.size} selected
                </span>
              </div>

              {employeesByDepartment.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {employeesByDepartment.map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp.id)}
                        onChange={() => toggleEmployeeSelection(emp.id)}
                        className="h-4 w-4 cursor-pointer accent-[#004CA5]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.jobTitle}</div>
                      </div>
                      <div className="text-xs text-gray-500">{emp.empId}</div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No employees in this department
                </p>
              )}
            </div>
          )}

          {/* Display selected employees count */}
          {selectedEmployees.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                Sending to <span className="font-semibold text-blue-600">{selectedEmployees.size}</span> selected employee{selectedEmployees.size !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Template
              <span className="text-red-500"> *</span>
            </label>
            <select
              name="selectedTemplate"
              value={bulkSendData.selectedTemplate}
              onChange={handleBulkSendChange}
              className={selectClass}
              required
            >
              <option value="" disabled hidden>
                Choose a template
              </option>
              {templatesList.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Override */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject (Optional - will override template subject if provided)
            </label>
            <input
              type="text"
              name="subject"
              value={bulkSendData.subject}
              onChange={handleBulkSendChange}
              placeholder="Leave empty to use template subject"
              className={selectClass}
            />
          </div>

          {/* Body Override */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body (Optional - will override template body if provided)
            </label>
            <textarea
              name="body"
              value={bulkSendData.body}
              onChange={handleBulkSendChange}
              placeholder="Leave empty to use template body"
              className={textareaClass}
              rows="6"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseBulkSendModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedEmployees.size === 0 || !bulkSendData.selectedTemplate}
              className="px-4 py-2 rounded-lg bg-[#004CA5] text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Send to {selectedEmployees.size} Employee{selectedEmployees.size !== 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Template Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={handleClosePreviewModal}
        title="Preview Template"
        size="xl"
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Template Name</label>
                <p className="text-gray-900 font-semibold">{previewTemplate.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-gray-900 font-semibold">{previewTemplate.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge label={previewTemplate.status} color={statusColor(previewTemplate.status)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{previewTemplate.updatedAt}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Subject</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{previewTemplate.subject || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Body</label>
              <div className="bg-gray-50 p-4 rounded-lg mt-1 max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
                {previewTemplate.body || 'No content'}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleClosePreviewModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={editTemplateModalOpen}
        onClose={handleCloseEditTemplateModal}
        title="Edit Template"
        size="xl"
      >
        {editingTemplate && (
          <form onSubmit={handleUpdateTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="templateName"
                value={editFormData.templateName}
                onChange={handleEditFormChange}
                placeholder="Enter template name"
                className={selectClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                name="templateType"
                value={editFormData.templateType}
                onChange={handleEditFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select template type
                </option>
                <option value="Job Offer">Job Offer</option>
                <option value="Promotion">Promotion</option>
                <option value="Termination">Termination</option>
                <option value="Certification">Certification</option>
                <option value="Experience">Experience</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="subject"
                value={editFormData.subject}
                onChange={handleEditFormChange}
                placeholder="Enter email subject"
                className={selectClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
                <span className="text-red-500"> *</span>
              </label>
              <textarea
                name="body"
                value={editFormData.body}
                onChange={handleEditFormChange}
                placeholder="Enter template body"
                className={textareaClass}
                rows="8"
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={handleCloseEditTemplateModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#004CA5] text-white hover:bg-blue-700 transition"
              >
                Update Template
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Generate Letter Modal */}
      <Modal
        isOpen={generateLetterModalOpen}
        onClose={handleCloseGenerateLetterModal}
        title="Generate & Send Letter"
        size="xl"
      >
        {selectedTemplateForGenerate && (
          <form onSubmit={handleSendLetter} className="space-y-4">
            {/* Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Template: {selectedTemplateForGenerate.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Category: {selectedTemplateForGenerate.category}</p>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                name="employeeId"
                value={generateFormData.employeeId}
                onChange={handleGenerateFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Choose an employee
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.empId}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Letter Preview */}
            {generateFormData.employeeId && (() => {
              const selectedEmp = employees.find((e) => String(e.id) === String(generateFormData.employeeId))
              return (
                <div>
                  <label className="text-sm font-medium text-gray-600">Letter Preview</label>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mt-2 max-h-[400px] overflow-y-auto">
                    {/* Employee Details Section */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-sm mb-2 font-semibold text-gray-900">To,</p>
                      <div className="space-y-1 ml-4 text-sm text-gray-700">
                        <p><span className="font-medium text-gray-600">Employee Name:</span> {selectedEmp?.name} ({selectedEmp?.empId})</p>
                        <p><span className="font-medium text-gray-600">Department:</span> {selectedEmp?.department}</p>
                        <p><span className="font-medium text-gray-600">Job Title:</span> {selectedEmp?.jobTitle}</p>
                      </div>
                    </div>

                    {/* Letter Content Section */}
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 mb-1"><span className="font-medium">Date:</span> {new Date().toLocaleDateString('en-GB')}</p>
                        <p className="text-xs text-gray-500"><span className="font-medium">Reference:</span> REF-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Subject: {selectedTemplateForGenerate.subject || 'Official Letter'}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Body:</p>
                        <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed ml-4">
                          {selectedTemplateForGenerate.body || 'No content'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                        <p>Generated on: {new Date().toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={handleCloseGenerateLetterModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              {generateFormData.employeeId && (
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(selectedTemplateForGenerate, generateFormData.employeeId)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  ⬇ Download
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#004CA5] text-white hover:bg-blue-700 transition"
              >
                Send Letter
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
