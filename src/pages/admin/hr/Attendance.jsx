import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { dashboardStats, employees } from '../../../data/mockData.js'

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
  const [viewingRow, setViewingRow] = useState(null)
  const [regularizingRow, setRegularizingRow] = useState(null)
  const [regularizationData, setRegularizationData] = useState({
    checkIn: '',
    checkOut: '',
    status: '',
    late: false,
    early: false,
    reason: '',
    adminRemark: '',
  })
  const [attendanceData, setAttendanceData] = useState([])

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const rows = useMemo(() => {
    return employees.slice(0, 8).map((e, idx) => ({
      id: e.id,
      employee: e.name,
      empId: e.empId,
      department: e.department,
      status: idx % 2 === 0 ? 'Present' : idx % 3 === 0 ? 'Remote' : 'Late',
      checkIn: idx % 2 === 0 ? '08:55' : '09:18',
      checkOut: idx % 2 === 0 ? '18:00' : '17:45',
      totalHours: idx % 2 === 0 ? '9.08' : '8.45',
      isLate: idx % 3 === 0,
      earlyDeparture: idx % 4 === 0,
      regularizationStatus: idx % 5 === 0 ? 'Pending' : idx % 5 === 1 ? 'Approved' : 'N/A',
      shiftTiming: '09:00 - 18:00',
      lateCalculation: idx % 3 === 0 ? '18 mins' : 'N/A',
      attendanceHistory: [
        { date: '2024-01-15', status: 'Present', checkIn: '08:55', checkOut: '18:00' },
        { date: '2024-01-14', status: 'Present', checkIn: '08:50', checkOut: '17:45' },
        { date: '2024-01-13', status: 'Remote', checkIn: '09:10', checkOut: '18:15' },
      ],
      previousRegularizations: idx % 5 === 0 ? 'Pending' : idx % 5 === 1 ? 'Approved (2)' : 'None',
      notes: 'Employee was delayed due to traffic',
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

  const handleRegularizationChange = (e) => {
    const { name, value, type, checked } = e.target
    setRegularizationData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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

  const handleViewAttendance = (row) => {
    setViewingRow(row)
  }

  const handleCloseViewModal = () => {
    setViewingRow(null)
  }

  const handleRegularizeClick = (row) => {
    setRegularizingRow(row)
    setRegularizationData({
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status,
      late: row.isLate,
      early: row.earlyDeparture,
      reason: '',
      adminRemark: '',
    })
  }

  const handleCloseRegularizeModal = () => {
    setRegularizingRow(null)
    setRegularizationData({
      checkIn: '',
      checkOut: '',
      status: '',
      late: false,
      early: false,
      reason: '',
      adminRemark: '',
    })
  }

  const handleApproveRegularization = (e) => {
    e.preventDefault()
    if (regularizingRow) {
      // Update the regularization status in the filtered rows
      const updatedRows = rows.map((r) =>
        r.id === regularizingRow.id
          ? { ...r, regularizationStatus: 'Approved' }
          : r
      )
      // Update rows (in a real app, this would be a backend call)
      console.log('Regularization approved:', {
        employeeId: regularizingRow.id,
        ...regularizationData,
      })
    }
    handleCloseRegularizeModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files })
    handleCloseModal()
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-500">{row.empId}</div>
        </div>
      ),
    },
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
    { key: 'checkOut', label: 'Check-out' },
    { key: 'totalHours', label: 'Total Hours' },
    {
      key: 'isLate',
      label: 'Late',
      render: (v) => (v ? <Badge label="Yes" color="red" /> : <span className="text-gray-500">No</span>),
    },
    {
      key: 'earlyDeparture',
      label: 'Early Departure',
      render: (v) => (v ? <Badge label="Yes" color="orange" /> : <span className="text-gray-500">No</span>),
    },
    {
      key: 'regularizationStatus',
      label: 'Regularization',
      render: (v) => {
        if (v === 'N/A') return <span className="text-gray-500">-</span>
        const color = v === 'Pending' ? 'orange' : 'green'
        return <Badge label={v} color={color} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button label="View" variant="primary" size="sm" onClick={() => handleViewAttendance(row)} />
          {row.isLate && <Button label="Regularize" variant="secondary" size="sm" onClick={() => handleRegularizeClick(row)} />}
        </div>
      ),
    },
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Attendance Calendar</h2>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm">
            <div className="font-semibold text-gray-500">Sun</div>
            <div className="font-semibold text-gray-500">Mon</div>
            <div className="font-semibold text-gray-500">Tue</div>
            <div className="font-semibold text-gray-500">Wed</div>
            <div className="font-semibold text-gray-500">Thu</div>
            <div className="font-semibold text-gray-500">Fri</div>
            <div className="font-semibold text-gray-500">Sat</div>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`flex h-10 items-center justify-center rounded-lg ${
                  i % 7 === 0 || i % 7 === 6
                    ? 'bg-gray-100 text-gray-400'
                    : i % 5 === 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-50" />
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-50" />
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-100" />
              <span className="text-gray-600">Weekend</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Overtime Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Overtime This Month</span>
              <span className="font-semibold text-gray-900">42.5 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Employees with Overtime</span>
              <span className="font-semibold text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Pending Approvals</span>
              <Badge label="5" color="orange" />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Mark Attendance" size="xl" showClose={true}>
        <form onSubmit={handleSubmit} className="h-full overflow-y-auto pr-1">
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

      {viewingRow && (
        <Modal isOpen={true} onClose={handleCloseViewModal} title="Attendance Details" size="xl" showClose={true}>
          <div className="h-full overflow-y-auto pr-1">
            <div className="space-y-4">
              {/* Employee Details */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Employee Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Employee Name</p>
                    <p className="font-medium text-gray-900">{viewingRow.employee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Employee ID</p>
                    <p className="font-medium text-gray-900">{viewingRow.empId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">{viewingRow.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">2024-01-15</p>
                  </div>
                </div>
              </div>

              {/* Check-in / Check-out */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Check-in / Check-out</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Check-in Time</p>
                    <p className="font-medium text-gray-900">{viewingRow.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Check-out Time</p>
                    <p className="font-medium text-gray-900">{viewingRow.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Hours</p>
                    <p className="font-medium text-gray-900">{viewingRow.totalHours}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <Badge label={viewingRow.status} color={viewingRow.status === 'Present' ? 'green' : viewingRow.status === 'Remote' ? 'blue' : 'orange'} />
                  </div>
                </div>
              </div>

              {/* Shift Timing */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Shift Timing</h3>
                <p className="font-medium text-gray-900">{viewingRow.shiftTiming}</p>
              </div>

              {/* Late Calculation & Early Departure */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Attendance Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Late Calculation</p>
                    <p className="font-medium text-gray-900">{viewingRow.lateCalculation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Early Departure</p>
                    <p className="font-medium text-gray-900">{viewingRow.earlyDeparture ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Logs/History */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Attendance History</h3>
                <div className="space-y-2">
                  {viewingRow.attendanceHistory && viewingRow.attendanceHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded bg-white p-2 text-sm">
                      <span className="text-gray-600">{hist.date}</span>
                      <div className="flex items-center gap-3">
                        <Badge label={hist.status} color={hist.status === 'Present' ? 'green' : 'blue'} />
                        <span className="text-gray-600">{hist.checkIn} - {hist.checkOut}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Regularizations */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Previous Regularizations</h3>
                <p className="font-medium text-gray-900">{viewingRow.previousRegularizations}</p>
              </div>

              {/* Notes/Comments */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Notes/Comments</h3>
                <p className="text-sm text-gray-700">{viewingRow.notes}</p>
              </div>

              {/* Edit and Approve Actions */}
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" label="Close" variant="ghost" onClick={handleCloseViewModal} />
                {viewingRow.isLate && <Button label="Approve/Reject" variant="primary" onClick={handleCloseViewModal} />}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {regularizingRow && (
        <Modal isOpen={true} onClose={handleCloseRegularizeModal} title="Regularize Attendance" size="lg" showClose={true}>
          <form onSubmit={handleApproveRegularization} className="h-full overflow-y-auto pr-1">
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">Employee: {regularizingRow.employee}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Check-in"
                  name="checkIn"
                  type="time"
                  value={regularizationData.checkIn}
                  onChange={handleRegularizationChange}
                />
                <Input
                  label="Check-out"
                  name="checkOut"
                  type="time"
                  value={regularizationData.checkOut}
                  onChange={handleRegularizationChange}
                />
              </div>

              <div className="w-full">
                <label htmlFor="reg-status" className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="reg-status"
                  name="status"
                  value={regularizationData.status}
                  onChange={handleRegularizationChange}
                  className={selectClass}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reg-late"
                    name="late"
                    checked={regularizationData.late}
                    onChange={handleRegularizationChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#004CA5]"
                  />
                  <label htmlFor="reg-late" className="text-sm font-medium text-gray-700">
                    Late
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reg-early"
                    name="early"
                    checked={regularizationData.early}
                    onChange={handleRegularizationChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#004CA5]"
                  />
                  <label htmlFor="reg-early" className="text-sm font-medium text-gray-700">
                    Early Departure
                  </label>
                </div>
              </div>

              <div className="w-full">
                <label htmlFor="reg-reason" className="mb-1 block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <textarea
                  id="reg-reason"
                  name="reason"
                  value={regularizationData.reason}
                  onChange={handleRegularizationChange}
                  className={textareaClass}
                  rows={2}
                  placeholder="Enter reason for regularization"
                />
              </div>

              <div className="w-full">
                <label htmlFor="reg-remark" className="mb-1 block text-sm font-medium text-gray-700">
                  Admin Remark
                </label>
                <textarea
                  id="reg-remark"
                  name="adminRemark"
                  value={regularizationData.adminRemark}
                  onChange={handleRegularizationChange}
                  className={textareaClass}
                  rows={2}
                  placeholder="Add admin remarks"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseRegularizeModal} />
                <Button type="submit" label="Approved" variant="primary" />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
