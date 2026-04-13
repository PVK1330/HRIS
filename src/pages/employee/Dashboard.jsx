import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { HiCalendar, HiClock, HiCurrencyDollar, HiDocumentText, HiUser } from 'react-icons/hi2'

export default function EmployeeDashboard() {
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back, John!</h1>
        <p className="mt-1 text-sm text-text-secondary">{currentDate}</p>
      </div>

      {/* Alert */}
      <div className="rounded-lg border border-warning-border bg-warning-bg p-4 text-sm text-warning-DEFAULT">
        <div className="flex items-center gap-2">
          <HiDocumentText className="h-5 w-5" />
          <span><strong>Reminder:</strong> Performance review cycle ends on April 30, 2026. Please complete your self-evaluation.</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Leave Balance"
          value="12"
          subtitle="Annual leave remaining"
          icon={HiCalendar}
        />
        <StatCard
          title="Working Days"
          value="18"
          subtitle="This month"
          icon={HiClock}
        />
        <StatCard
          title="Pending Claims"
          value="2"
          subtitle="Awaiting approval"
          icon={HiCurrencyDollar}
        />
        <StatCard
          title="Goals Progress"
          value="75%"
          subtitle="3 of 4 completed"
          icon={HiUser}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 border-b border-border-tertiary pb-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-success-DEFAULT" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Leave request approved</p>
                <p className="text-xs text-text-secondary">Annual leave for Apr 15-17</p>
                <p className="text-xs text-text-secondary mt-1">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-border-tertiary pb-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary-DEFAULT" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Expense claim submitted</p>
                <p className="text-xs text-text-secondary">Travel expense - $120.50</p>
                <p className="text-xs text-text-secondary mt-1">5 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-purple-DEFAULT" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Performance goal completed</p>
                <p className="text-xs text-text-secondary">Q1 sales target achieved</p>
                <p className="text-xs text-text-secondary mt-1">1 week ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Upcoming Events</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3 border-b border-border-tertiary pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-bg text-primary-DEFAULT">
                <HiCalendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Performance Review</p>
                <p className="text-xs text-text-secondary">April 30, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-border-tertiary pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-bg text-success-DEFAULT">
                <HiUser className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Team Meeting</p>
                <p className="text-xs text-text-secondary">April 18, 2026 - 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-bg text-warning-DEFAULT">
                <HiDocumentText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Training Session</p>
                <p className="text-xs text-text-secondary">April 22, 2026 - 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button label="Apply for Leave" variant="primary" />
          <Button label="Submit Expense" variant="secondary" />
          <Button label="View Payslip" variant="secondary" />
          <Button label="Update Profile" variant="secondary" />
        </div>
      </div>
    </div>
  )
}
