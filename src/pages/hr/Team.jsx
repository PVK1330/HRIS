import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Avatar } from '../../components/ui/Avatar.jsx'

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const employees = [
    { id: 'EMP018', name: 'Rohit Shah', designation: 'Sales Executive', joinDate: '15 Oct 2024', status: 'Active', goalsProgress: 75 },
    { id: 'EMP022', name: 'Priti Gupta', designation: 'Sr. Sales Exec', joinDate: '03 Jan 2023', status: 'Active', goalsProgress: 90 },
    { id: 'EMP031', name: 'Anita Nair', designation: 'Marketing Exec', joinDate: '20 Jun 2023', status: 'Active', goalsProgress: 50 },
    { id: 'EMP044', name: 'Vijay More', designation: 'Sales Trainee', joinDate: '01 Feb 2026', status: 'Probation', goalsProgress: 30 },
  ]

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || emp.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Team</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage team members and their performance</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search team member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[220px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
          style={{ width: '130px' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="notice">Notice</option>
        </select>
        <Button label="+ Add Member" variant="primary" size="sm" />
      </div>

      {/* Employee Table */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'id', label: 'ID' },
            { key: 'designation', label: 'Designation' },
            { key: 'joinDate', label: 'Join Date' },
            { key: 'status', label: 'Status' },
            { key: 'goals', label: 'Goals' },
            { key: 'action', label: 'Action' },
          ]}
          data={filteredEmployees.map(emp => ({
            employee: (
              <div className="flex items-center gap-2">
                <Avatar name={emp.name} />
                <span>{emp.name}</span>
              </div>
            ),
            id: emp.id,
            designation: emp.designation,
            joinDate: emp.joinDate,
            status: <Badge variant={emp.status === 'Active' ? 'success' : 'warning'}>{emp.status}</Badge>,
            goals: (
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 rounded-full bg-background-secondary">
                  <div className="h-2 rounded-full bg-primary-DEFAULT" style={{ width: `${emp.goalsProgress}%` }} />
                </div>
                <span className="text-xs text-text-secondary">{emp.goalsProgress}%</span>
              </div>
            ),
            action: <Button label="View Profile" variant="secondary" size="sm" onClick={() => setSelectedEmployee(emp)} />,
          }))}
        />
      </div>

      {/* Employee Profile Detail */}
      {selectedEmployee && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Employee Profile — {selectedEmployee.name}</h2>
            <Button label="×" variant="ghost" size="sm" onClick={() => setSelectedEmployee(null)} />
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Personal</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Date of Birth</span>
                  <span className="text-text-primary">12 May 1998</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Phone</span>
                  <span className="text-text-primary">+91 98123 45678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Email</span>
                  <span className="text-primary-DEFAULT">rohit@hrmatrix.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Location</span>
                  <span className="text-text-primary">Mumbai</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Employment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Joining Date</span>
                  <span className="text-text-primary">15 Oct 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Confirmation</span>
                  <span className="text-text-primary">15 Apr 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Employment Type</span>
                  <span className="text-text-primary">Full-Time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Notice Period</span>
                  <span className="text-text-primary">30 days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button label="Write Review" variant="success" size="sm" />
            <Button label="Generate Letter" variant="primary" size="sm" />
            <Button label="Initiate Exit" variant="danger" size="sm" />
          </div>
        </div>
      )}
    </div>
  )
}
