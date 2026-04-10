import { useMemo, useState } from 'react'
import { HiDocumentText, HiEnvelope, HiEye } from 'react-icons/hi2'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { employees } from '../../data/mockData.js'

function statusColor(status) {
  if (status === 'Active') return 'green'
  if (status === 'Probation') return 'blue'
  if (status === 'Notice Period') return 'orange'
  if (status === 'On Leave') return 'yellow'
  return 'gray'
}

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [job, setJob] = useState('')
  const [loc, setLoc] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])
  const jobOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.jobTitle))].sort()
    return [{ value: '', label: 'All job titles' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])
  const locOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.location))].sort()
    return [{ value: '', label: 'All locations' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])
  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Probation', label: 'Probation' },
    { value: 'Notice Period', label: 'Notice Period' },
    { value: 'On Leave', label: 'On Leave' },
  ]

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter((e) => {
      if (dept && e.department !== dept) return false
      if (job && e.jobTitle !== job) return false
      if (loc && e.location !== loc) return false
      if (status && e.status !== status) return false
      if (!q) return true
      const blob = `${e.name} ${e.email} ${e.empId} ${e.department}`.toLowerCase()
      return blob.includes(q)
    })
  }, [search, dept, job, loc, status])

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'empId', label: 'Emp ID' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'location', label: 'Location' },
    { key: 'manager', label: 'Manager' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex items-center gap-1">
          <Button ariaLabel="View" variant="ghost" size="sm" icon={HiEye} />
          <Button ariaLabel="Email" variant="ghost" size="sm" icon={HiEnvelope} />
          <Button ariaLabel="Letter" variant="ghost" size="sm" icon={HiDocumentText} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Search, filter, and manage employee records.</p>
        </div>
        <Button label="+ Add Employee" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Search"
            name="search"
            placeholder="Name, email, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            label="Department"
            name="dept"
            type="select"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            options={deptOptions}
          />
          <Input
            label="Job title"
            name="job"
            type="select"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            options={jobOptions}
          />
          <Input
            label="Location"
            name="loc"
            type="select"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            options={locOptions}
          />
          <Input
            label="Status"
            name="status"
            type="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add employee" size="md">
        <div className="space-y-4">
          <Input
            label="Full name"
            name="new-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Alex Morgan"
          />
          <Input
            label="Work email"
            name="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="alex@elitepic.com"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancel" variant="outline" onClick={() => setModalOpen(false)} />
            <Button
              label="Save"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setNewName('')
                setNewEmail('')
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
