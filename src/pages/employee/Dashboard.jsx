import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { HiCalendar, HiCheck, HiClock, HiCurrencyDollar, HiDocumentText, HiExclamationTriangle, HiUser } from 'react-icons/hi2'

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

export default function EmployeeDashboard() {
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

  const recentActivity = [
    { id: 1, type: 'Leave approved', detail: 'Annual leave for Apr 15-17', time: '2 days ago', color: 'green' },
    { id: 2, type: 'Expense submitted', detail: 'Travel expense - $120.50', time: '5 days ago', color: 'blue' },
    { id: 3, type: 'Goal completed', detail: 'Q1 sales target achieved', time: '1 week ago', color: 'green' },
  ]

  const upcomingEvents = [
    { id: 1, event: 'Performance Review', date: 'April 30, 2026', icon: HiCalendar, color: 'blue' },
    { id: 2, event: 'Team Meeting', date: 'April 18, 2026 - 10:00 AM', icon: HiUser, color: 'green' },
    { id: 3, event: 'Training Session', date: 'April 22, 2026 - 2:00 PM', icon: HiDocumentText, color: 'yellow' },
  ]

  const activityColor = (color) => {
    const colors = {
      'green': 'bg-green-500',
      'blue': 'bg-blue-500',
      'yellow': 'bg-yellow-500',
    }
    return colors[color] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          {todayLabel}
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
        <HiExclamationTriangle className="h-4 w-4" />
        <span>Performance review cycle ends on April 30, 2026. Please complete your self-evaluation.</span>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Leave Balance"
          value="12"
          subtitle="Annual leave remaining"
          color="blue"
          icon={HiCalendar}
        />
        <StatCard
          title="Working Days"
          value="18"
          subtitle="This month"
          color="green"
          icon={HiClock}
        />
        <StatCard
          title="Pending Claims"
          value="2"
          subtitle="Awaiting approval"
          color="yellow"
          icon={HiCurrencyDollar}
        />
        <StatCard
          title="Goals Progress"
          value="75%"
          subtitle="3 of 4 completed"
          color="blue"
          icon={HiUser}
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
              <span className="font-semibold text-gray-900">1</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.green}`} />
                Remote
              </span>
              <span className="font-semibold text-gray-900">0</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.yellow}`} />
                On Leave
              </span>
              <span className="font-semibold text-gray-900">0</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotClass.red}`} />
                Absent
              </span>
              <span className="font-semibold text-gray-900">0</span>
            </li>
          </ul>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Pending Items</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Expense claims</span>
              <Badge label="2" color="orange" />
            </li>
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Timesheets</span>
              <Badge label="0" color="blue" />
            </li>
            <li className="flex items-center justify-between text-sm text-gray-700">
              <span>Documents to sign</span>
              <Badge label="1" color="purple" />
            </li>
          </ul>
        </div>

        {/* Alerts & Reminders */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Alerts &amp; Reminders</h2>
          <ul className="mt-4 space-y-3">
            <li className={`rounded-lg border px-3 py-2 text-sm ${alertTone.blue}`}>
              <div className="font-semibold">Performance Review</div>
              <div className="mt-0.5 text-xs opacity-90">Due April 30, 2026</div>
            </li>
            <li className={`rounded-lg border px-3 py-2 text-sm ${alertTone.green}`}>
              <div className="font-semibold">Goal Update</div>
              <div className="mt-0.5 text-xs opacity-90">Q2 goals need setting</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-900">Recent Activity</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-2">
                  <div className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${activityColor(activity.color)}`} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{activity.type}</div>
                    <div className="text-xs text-gray-500">{activity.detail}</div>
                    <div className="mt-1 text-xs text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-900">Upcoming Events</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <event.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{event.event}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button label="Apply for Leave" variant="primary" />
          <Button label="Submit Expense" variant="secondary" />
          <Button label="View Payslip" variant="secondary" />
          <Button label="Update Profile" variant="secondary" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Upcoming Holidays</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Eid al-Fitr</div>
                <div className="text-xs text-gray-500">Public Holiday</div>
              </div>
              <span className="text-sm text-gray-600">Apr 10, 2026</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Labor Day</div>
                <div className="text-xs text-gray-500">Public Holiday</div>
              </div>
              <span className="text-sm text-gray-600">May 1, 2026</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Team Announcements</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-gray-200 px-4 py-2">
              <div className="font-medium text-gray-900">Office Closure</div>
              <div className="text-xs text-gray-500">Office will be closed on Apr 10-11 for Eid</div>
              <div className="mt-1 text-xs text-gray-400">Posted 2 days ago</div>
            </div>
            <div className="rounded-lg border border-gray-200 px-4 py-2">
              <div className="font-medium text-gray-900">Team Building Event</div>
              <div className="text-xs text-gray-500">Quarterly team outing on Apr 25</div>
              <div className="mt-1 text-xs text-gray-400">Posted 5 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
