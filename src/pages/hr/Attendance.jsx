import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table } from '../../components/ui/Table.jsx'

export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState('April 2026')
  const [selectedMember, setSelectedMember] = useState('All Members')

  const regularizationRequests = [
    { employee: 'Seema Patil', date: '07 Apr 2026', originalStatus: 'Late', reason: 'Traffic jam — reached by 10:20 AM', submitted: '07 Apr' },
    { employee: 'Vijay More', date: '04 Apr 2026', originalStatus: 'Absent', reason: 'Medical emergency — docs attached', submitted: '05 Apr' },
  ]

  const attendanceLog = [
    { employee: 'Rohit Shah', present: 6, absent: 0, late: 1, onLeave: 0, wfh: 1, overtime: '4h' },
    { employee: 'Priti Gupta', present: 7, absent: 0, late: 0, onLeave: 0, wfh: 2, overtime: '2h' },
    { employee: 'Anita Nair', present: 5, absent: 0, late: 0, onLeave: 2, wfh: 3, overtime: '0' },
    { employee: 'Vijay More', present: 4, absent: 1, late: 2, onLeave: 0, wfh: 0, overtime: '0' },
    { employee: 'Seema Patil', present: 6, absent: 0, late: 2, onLeave: 0, wfh: 0, overtime: '1h' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Attendance Approvals</h1>
        <p className="mt-1 text-sm text-text-secondary">Review attendance and regularization requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
          style={{ width: '150px' }}
        >
          <option>April 2026</option>
          <option>March 2026</option>
          <option>February 2026</option>
        </select>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
          style={{ width: '140px' }}
        >
          <option>All Members</option>
          <option>Rohit Shah</option>
          <option>Seema Patil</option>
          <option>Priti Gupta</option>
        </select>
        <Button label="Export" variant="secondary" size="sm" />
      </div>

      {/* Regularization Requests */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Regularization Requests</h2>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'date', label: 'Date' },
            { key: 'originalStatus', label: 'Original Status' },
            { key: 'reason', label: 'Reason' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'action', label: 'Action' },
          ]}
          data={regularizationRequests.map(req => ({
            employee: req.employee,
            date: req.date,
            originalStatus: <Badge variant="danger">{req.originalStatus}</Badge>,
            reason: req.reason,
            submitted: req.submitted,
            action: (
              <div className="flex gap-2">
                <Button label="Approve" variant="success" size="sm" />
                <Button label="Reject" variant="danger" size="sm" />
              </div>
            ),
          }))}
        />
      </div>

      {/* Team Attendance Log */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Team Attendance Log — {selectedMonth}</h2>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'present', label: 'Present Days' },
            { key: 'absent', label: 'Absent' },
            { key: 'late', label: 'Late' },
            { key: 'onLeave', label: 'On Leave' },
            { key: 'wfh', label: 'WFH' },
            { key: 'overtime', label: 'Overtime Hrs' },
          ]}
          data={attendanceLog.map(log => ({
            employee: log.employee,
            present: log.present,
            absent: log.absent,
            late: log.late,
            onLeave: log.onLeave,
            wfh: log.wfh,
            overtime: log.overtime,
          }))}
        />
      </div>
    </div>
  )
}
