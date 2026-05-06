import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { HiDocumentText, HiPencil, HiTrash, HiArrowDown } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  templateName: '',
  templateType: '',
  category: '',
  description: '',
  content: '',
}

function typeColor(type) {
  if (type === 'Letter') return 'blue'
  if (type === 'Form') return 'green'
  if (type === 'Certificate') return 'purple'
  if (type === 'Report') return 'orange'
  return 'gray'
}

export default function TemplateGenerator() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const templates = useMemo(
    () => [
      {
        id: 1,
        name: 'Offer Letter',
        type: 'Letter',
        category: 'Recruitment',
        description: 'Standard offer letter template for new hires',
        lastModified: '2026-03-15',
        usageCount: 45,
      },
      {
        id: 2,
        name: 'Experience Certificate',
        type: 'Certificate',
        category: 'Exit',
        description: 'Experience certificate for departing employees',
        lastModified: '2026-02-20',
        usageCount: 32,
      },
      {
        id: 3,
        name: 'Leave Application Form',
        type: 'Form',
        category: 'Leave',
        description: 'Leave request form for employees',
        lastModified: '2026-04-01',
        usageCount: 120,
      },
      {
        id: 4,
        name: 'Performance Review Form',
        type: 'Form',
        category: 'Performance',
        description: 'Performance evaluation form',
        lastModified: '2026-03-10',
        usageCount: 28,
      },
      {
        id: 5,
        name: 'Warning Letter',
        type: 'Letter',
        category: 'Disciplinary',
        description: 'Warning letter template for misconduct',
        lastModified: '2026-01-25',
        usageCount: 8,
      },
      {
        id: 6,
        name: 'Promotion Letter',
        type: 'Letter',
        category: 'HR',
        description: 'Promotion letter template',
        lastModified: '2026-02-15',
        usageCount: 15,
      },
    ],
    []
  )

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'All categories' },
      { value: 'Recruitment', label: 'Recruitment' },
      { value: 'Exit', label: 'Exit' },
      { value: 'Leave', label: 'Leave' },
      { value: 'Performance', label: 'Performance' },
      { value: 'Disciplinary', label: 'Disciplinary' },
      { value: 'HR', label: 'HR' },
    ],
    []
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return templates.filter((t) => {
      if (query && !`${t.name} ${t.description}`.toLowerCase().includes(query)) return false
      if (category && t.category !== category) return false
      return true
    })
  }, [search, category])

  const summary = useMemo(() => {
    const totalUsage = templates.reduce((acc, t) => acc + t.usageCount, 0)
    const letterCount = templates.filter((t) => t.type === 'Letter').length
    const formCount = templates.filter((t) => t.type === 'Form').length
    return { totalUsage, letterCount, formCount }
  }, [templates])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setEditMode(false)
    setEditingId(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, editMode, editingId })
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const template = templates.find((t) => t.id === id)
    if (template) {
      setFormData({
        templateName: template.name,
        templateType: template.type,
        category: template.category,
        description: template.description,
        content: '',
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      console.log('Delete template:', id)
    }
  }

  const handleDownload = (id) => {
    console.log('Download template:', id)
  }

  const handleUseTemplate = (id) => {
    console.log('Use template:', id)
  }

  const columns = [
    { key: 'name', label: 'Template Name' },
    {
      key: 'type',
      label: 'Type',
      render: (v) => <Badge label={v} color={typeColor(v)} />,
    },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'lastModified', label: 'Last Modified' },
    {
      key: 'usageCount',
      label: 'Usage',
      render: (v) => `${v} times`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button label="Use" className='bg-orange-400 text-orange-600 hover:bg-orange-200' size="sm" icon={HiDocumentText} onClick={() => handleUseTemplate(row.id)} />
          <Button label="Download" className='bg-blue-500 text-blue-800 hover:bg-blue-500' size="sm" icon={HiArrowDown} onClick={() => handleDownload(row.id)} />
          <Button label="Edit" className='bg-green-500 text-green-800 hover:bg-green-500' size="sm" icon={HiPencil} onClick={() => handleEdit(row.id)} />
          <Button label="Delete" className='bg-red-500 text-red-800 hover:bg-red-500' size="sm" icon={HiTrash} onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Template Generator</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage document templates for HR processes.</p>
        </div>
        <Button label="Create Template" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <HiDocumentText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
              <div className="text-sm text-gray-500">Total Templates</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <HiArrowDown className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalUsage}</div>
              <div className="text-sm text-gray-500">Total Usage</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <HiDocumentText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{summary.letterCount + summary.formCount}</div>
              <div className="text-sm text-gray-500">Active Templates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Search" name="search" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input label="Category" name="category" type="select" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Template' : 'Create Template'} size="xl">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Template Name"
              name="templateName"
              value={formData.templateName}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="tmpl-type" className="mb-1 block text-sm font-medium text-gray-700">
                Template Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="tmpl-type"
                name="templateType"
                value={formData.templateType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                <option value="Letter">Letter</option>
                <option value="Form">Form</option>
                <option value="Certificate">Certificate</option>
                <option value="Report">Report</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="tmpl-category" className="mb-1 block text-sm font-medium text-gray-700">
                Category
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="tmpl-category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select category
                </option>
                <option value="Recruitment">Recruitment</option>
                <option value="Exit">Exit</option>
                <option value="Leave">Leave</option>
                <option value="Performance">Performance</option>
                <option value="Disciplinary">Disciplinary</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="tmpl-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="tmpl-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={2}
              placeholder="Brief description of the template"
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="tmpl-content" className="mb-1 block text-sm font-medium text-gray-700">
              Template Content
            </label>
            <textarea
              id="tmpl-content"
              name="content"
              value={formData.content}
              onChange={handleFormChange}
              className={textareaClass}
              rows={8}
              placeholder="Enter template content with placeholders like {{name}}, {{date}}, etc."
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label={editMode ? 'Update Template' : 'Create Template'} variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
