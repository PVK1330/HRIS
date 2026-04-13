import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { HiCalendar, HiCheck, HiClock, HiCurrencyDollar, HiDocumentText, HiExclamationTriangle, HiUsers, HiUserGroup } from 'react-icons/hi2'

const dotClass = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-600',
}

const alertTone = {
  red: 'border-red-100 bg-red-50 text-red-800',
  blue: 'border-blue-100 bg-blue-50 text-blue-800',
  green: 'border-green-100 bg-green-50 text-green-800',
}

export default function HRDashboard() {
  const { user } = useAuth()
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  const teamAttendance = [
    { id: 1, employee: 'Rohit Shah', status: 'Present', clockIn: '09:05 AM', tone: 'green' },
    { id: 2, employee: 'Priti Gupta', status: 'Present', clockIn: '08:58 AM', tone: 'green' },
    { id: 3, employee: 'Anita Nair', status: 'Remote', clockIn: '09:30 AM', tone: 'blue' },
    { id: 4, employee: 'Vijay More', status: 'On Leave', clockIn: '—', tone: 'yellow' },
    { id: 5, employee: 'Seema Patil', status: 'Late', clockIn: '10:22 AM', tone: 'red' },
  ]

  const upcomingEvents = [
    { id: 1, event: 'Confirmation', employee: 'Rohit Shah', date: '15 Apr 2026', tone: 'green' },
    { id: 2, event: 'Leave', employee: 'Vijay More', date: '07–09 Apr', tone: 'yellow' },
    { id: 3, event: 'Review', employee: 'Team', date: '30 Apr 2026', tone: 'blue' },
    { id: 4, event: 'Birthday', employee: 'Priti Gupta', date: '18 Apr 2026', tone: 'green' },
    { id: 5, event: 'Last Day', employee: 'Meera Joshi', date: '15 Apr 2026', tone: 'red' },
  ]

  const teamLeaveBalance = [
    { id: 1, employee: 'Rohit Shah', annualRemaining: '14', sickRemaining: '8', casual: '5', compOff: '1' },
    { id: 2, employee: 'Priti Gupta', annualRemaining: '18', sickRemaining: '10', casual: '7', compOff: '0' },
    { id: 3, employee: 'Anita Nair', annualRemaining: '6', sickRemaining: '4', casual: '2', compOff: '2' },
    { id: 4, employee: 'Vijay More', annualRemaining: '9', sickRemaining: '7', casual: '3', compOff: '0' },
    { id: 5, employee: 'Seema Patil', annualRemaining: '20', sickRemaining: '9', casual: '6', compOff: '1' },
  ]

  const statusColor = (status) => {
    const colors = {
      'Present': 'green',
      'Remote': 'blue',
      'On Leave': 'yellow',
      'Late': 'red',
    }
    return colors[status] || 'gray'
  }

  const eventColor = (tone) => {
    const colors = {
      'green': 'success',
      'yellow': 'warning',
      'blue': 'info',
      'red': 'danger',
    }
    return colors[tone] || 'gray'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            HR Manager Overview — {user?.department || 'Sales & Marketing'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          {todayLabel}
        </div>
      </div>

      {/* Alert Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          <HiExclamationTriangle className="h-4 w-4" />
          2 leave requests pending your approval | 1 expense claim awaiting review | Performance cycle ends Apr 30
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Size"
          value="14"
          subtitle="Sales & Marketing"
          color="blue"
          icon={HiUserGroup}
        />
        <StatCard
          title="Present Today"
          value="11"
          subtitle="3 on leave"
          color="green"
          icon={HiCheck}
        />
        <StatCard
          title="Pending Approvals"
          value="3"
          subtitle="Leave + Expense"
          color="yellow"
          icon={HiClock}
        />
        <StatCard
          title="Goals On Track"
          value="9/14"
          subtitle="This quarter"
          color="blue"
          icon={HiUsers}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's Work Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Today&apos;s Work Status</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.blue}`} />
                In Office
              </span>
              <span className="font-semibold text-gray-900">3</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.green}`} />
                Remote
              </span>
              <span className="font-semibold text-gray-900">1</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.yellow}`} />
                On Leave
              </span>
              <span className="font-semibold text-gray-900">3</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.red}`} />
                Late
              </span>
              <span className="font-semibold text-gray-900">1</span>
            </li>
          </ul>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Pending Approvals</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Leave requests</span>
              <Badge label="2" color="orange" />
            </li>
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Expense claims</span>
              <Badge label="1" color="purple" />
            </li>
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Regularization</span>
              <Badge label="0" color="blue" />
            </li>
          </ul>
        </div>

        {/* Alerts & Reminders */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Alerts &amp; Reminders</h2>
          <ul className="mt-4 space-y-3">
            <li className={`rounded-lg border px-3 py-2 text-sm ${alertTone.red}`}>
              <div className="font-semibold">Performance Cycle</div>
              <div className="mt-0.5 text-xs opacity-90">Ends April 30, 2026</div>
            </li>
            <li className={`rounded-lg border px-3 py-2 text-sm ${alertTone.blue}`}>
              <div className="font-semibold">Team Meeting</div>
              <div className="mt-0.5 text-xs opacity-90">Today at 3:00 PM</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Team Attendance */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-900">Team Attendance — Today</h2>
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'status', label: 'Status' },
              { key: 'clockIn', label: 'Clock In' },
            ]}
            data={teamAttendance.map((att) => ({
              employee: att.employee,
              status: <Badge variant={statusColor(att.status)}>{att.status}</Badge>,
              clockIn: att.clockIn,
            }))}
          />
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-900">Upcoming Events</h2>
          <Table
            columns={[
              { key: 'event', label: 'Event' },
              { key: 'employee', label: 'Employee' },
              { key: 'date', label: 'Date' },
            ]}
            data={upcomingEvents.map((evt) => ({
              event: <Badge variant={eventColor(evt.tone)}>{evt.event}</Badge>,
              employee: evt.employee,
              date: evt.date,
            }))}
          />
        </div>
      </div>

      {/* Team Leave Balance */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Team Leave Balance Overview</h2>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'annualRemaining', label: 'Annual Remaining' },
            { key: 'sickRemaining', label: 'Sick Remaining' },
            { key: 'casual', label: 'Casual' },
            { key: 'compOff', label: 'Comp Off' },
          ]}
          data={teamLeaveBalance.map((lb) => ({
            employee: lb.employee,
            annualRemaining: lb.annualRemaining,
            sickRemaining: lb.sickRemaining,
            casual: lb.casual,
            compOff: lb.compOff,
          }))}
        />
      </div>
    </div>
  )
}
