import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiCalendar, HiClock, HiCurrencyDollar, HiDocumentText, HiExclamationTriangle, HiUsers } from 'react-icons/hi2'

export default function HRDashboard() {
  const [alertVisible, setAlertVisible] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">HR Manager Overview</p>
      </div>

      {/* Alert Banner */}
      {alertVisible && (
        <div className="flex items-center justify-between rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-DEFAULT">
          <div className="flex items-center gap-2">
            <HiExclamationTriangle className="h-5 w-5" />
            <span>2 leave requests pending your approval | 1 expense claim awaiting review | Performance cycle ends Apr 30</span>
          </div>
          <button onClick={() => setAlertVisible(false)} className="text-warning-DEFAULT hover:text-warning-DEFAULT">
            ×
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-tertiary bg-background-secondary p-4">
          <div className="text-xs text-text-secondary">Team Size</div>
          <div className="mt-2 text-2xl font-bold text-text-primary">14</div>
          <div className="mt-1 text-xs text-text-secondary">Sales & Marketing</div>
        </div>
        <div className="rounded-xl border border-border-tertiary bg-background-secondary p-4">
          <div className="text-xs text-text-secondary">Present Today</div>
          <div className="mt-2 text-2xl font-bold text-success-DEFAULT">11</div>
          <div className="mt-1 text-xs text-text-secondary">3 on leave</div>
        </div>
        <div className="rounded-xl border border-border-tertiary bg-background-secondary p-4">
          <div className="text-xs text-text-secondary">Pending Approvals</div>
          <div className="mt-2 text-2xl font-bold text-warning-DEFAULT">3</div>
          <div className="mt-1 text-xs text-text-secondary">Leave + Expense</div>
        </div>
        <div className="rounded-xl border border-border-tertiary bg-background-secondary p-4">
          <div className="text-xs text-text-secondary">Goals On Track</div>
          <div className="mt-2 text-2xl font-bold text-primary-DEFAULT">9/14</div>
          <div className="mt-1 text-xs text-text-secondary">This quarter</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Team Attendance */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Team Attendance — Today</h2>
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'status', label: 'Status' },
              { key: 'clockIn', label: 'Clock In' },
            ]}
            data={[
              { employee: 'Rohit Shah', status: <Badge variant="success">Present</Badge>, clockIn: '09:05 AM' },
              { employee: 'Priti Gupta', status: <Badge variant="success">Present</Badge>, clockIn: '08:58 AM' },
              { employee: 'Anita Nair', status: <Badge variant="info">Remote</Badge>, clockIn: '09:30 AM' },
              { employee: 'Vijay More', status: <Badge variant="warning">On Leave</Badge>, clockIn: '—' },
              { employee: 'Seema Patil', status: <Badge variant="danger">Late</Badge>, clockIn: '10:22 AM' },
            ]}
          />
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Upcoming Events</h2>
          <Table
            columns={[
              { key: 'event', label: 'Event' },
              { key: 'employee', label: 'Employee' },
              { key: 'date', label: 'Date' },
            ]}
            data={[
              { event: <Badge variant="success">Confirmation</Badge>, employee: 'Rohit Shah', date: '15 Apr 2026' },
              { event: <Badge variant="warning">Leave</Badge>, employee: 'Vijay More', date: '07–09 Apr' },
              { event: <Badge variant="purple">Review</Badge>, employee: 'Team', date: '30 Apr 2026' },
              { event: <Badge variant="teal">Birthday</Badge>, employee: 'Priti Gupta', date: '18 Apr 2026' },
              { event: <Badge variant="danger">Last Day</Badge>, employee: 'Meera Joshi', date: '15 Apr 2026' },
            ]}
          />
        </div>
      </div>

      {/* Team Leave Balance */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Team Leave Balance Overview</h2>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'annualRemaining', label: 'Annual Remaining' },
            { key: 'sickRemaining', label: 'Sick Remaining' },
            { key: 'casual', label: 'Casual' },
            { key: 'compOff', label: 'Comp Off' },
          ]}
          data={[
            { employee: 'Rohit Shah', annualRemaining: '14', sickRemaining: '8', casual: '5', compOff: '1' },
            { employee: 'Priti Gupta', annualRemaining: '18', sickRemaining: '10', casual: '7', compOff: '0' },
            { employee: 'Anita Nair', annualRemaining: '6', sickRemaining: '4', casual: '2', compOff: '2' },
            { employee: 'Vijay More', annualRemaining: '9', sickRemaining: '7', casual: '3', compOff: '0' },
            { employee: 'Seema Patil', annualRemaining: '20', sickRemaining: '9', casual: '6', compOff: '1' },
          ]}
        />
      </div>
    </div>
  )
}
