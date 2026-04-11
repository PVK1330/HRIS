import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { dashboardStats, employees } from '../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  employeeId: '',
  date: '',
  checkInTime: '',
  checkOutTime: '',
  workMode: '',
  status: '',
  overtimeHours: '',
  notes: '',
}

export default function Attendance() {
  const [dept, setDept] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const rows = useMemo(() => {
    return employees.slice(0, 8).map((e, idx) => ({
      id: e.id,
      employee: e.name,
      department: e.department,
      status: idx % 2 === 0 ? 'Present' : idx % 3 === 0 ? 'Remote' : 'Late',
      checkIn: idx % 2 === 0 ? '08:55' : '09:18',
    }))
  }, [])

  const filtered = useMemo(() => {
    if (!dept) return rows
    return rows.filter((r) => r.department === dept)
  }, [rows, dept])

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
    { key: 'department', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Present' ? 'green' : v === 'Remote' ? 'blue' : 'orange'}
        />
      ),
    },
    { key: 'checkIn', label: 'Check-in' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">Daily attendance snapshot (mock data).</p>
        </div>
        <Button label="Add Record" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="In Office" value={dashboardStats.todayInOffice} subtitle="Today" color="blue" />
        <StatCard title="Remote" value={dashboardStats.todayRemote} subtitle="Today" color="green" />
        <StatCard title="On Leave" value={dashboardStats.todayOnLeave} subtitle="Today" color="yellow" />
        <StatCard title="Absent" value={dashboardStats.todayAbsent} subtitle="Today" color="red" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Department"
          name="dept"
          type="select"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          options={deptOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Mark Attendance" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Attendance record
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="att-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="att-employee"
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
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Check In Time"
              name="checkInTime"
              type="time"
              value={formData.checkInTime}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Check Out Time"
              name="checkOutTime"
              type="time"
              value={formData.checkOutTime}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="att-work-mode" className="mb-1 block text-sm font-medium text-gray-700">
                Work Mode
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="att-work-mode"
                name="workMode"
                value={formData.workMode}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select work mode
                </option>
                <option value="In Office">In Office</option>
                <option value="Remote">Remote</option>
                <option value="Field">Field</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="att-status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="att-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select status
                </option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <Input
              label="Overtime Hours"
              name="overtimeHours"
              type="number"
              placeholder="0"
              value={formData.overtimeHours}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="att-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="att-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Supporting document
          </p>
          <FileUpload
            label="Attachment"
            name="attachment"
            accept=".jpg,.png,.pdf"
            onChange={handleFileChange('attachment')}
            helpText="e.g. WFH approval email"
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
