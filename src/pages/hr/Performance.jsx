import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'

export default function Performance() {
  const [activeTab, setActiveTab] = useState('goals')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')

  const goals = [
    { employee: 'Rohit Shah', goal: 'Close 15 new accounts', target: '15', dueDate: '30 Jun 2026', progress: 70, status: 'In Progress' },
    { employee: 'Priti Gupta', goal: 'Revenue target ₹50L', target: '₹50L', dueDate: '30 Jun 2026', progress: 90, status: 'On Track' },
    { employee: 'Anita Nair', goal: 'Launch 3 campaigns', target: '3', dueDate: '30 Jun 2026', progress: 33, status: 'Behind' },
    { employee: 'Vijay More', goal: 'Complete sales training', target: '100%', dueDate: '30 Apr 2026', progress: 50, status: 'In Progress' },
  ]

  const reviews = [
    { employee: 'Priti Gupta', period: 'FY25-26 H1', rating: 'Exceeds', goalsMet: '9/10', reviewedBy: 'Neha Jain', date: '01 Oct 2025' },
    { employee: 'Rohit Shah', period: 'FY25-26 H1', rating: 'Meets', goalsMet: '7/10', reviewedBy: 'Neha Jain', date: '01 Oct 2025' },
    { employee: 'Anita Nair', period: 'FY25-26 H1', rating: 'Needs Improvement', goalsMet: '5/10', reviewedBy: 'Neha Jain', date: '01 Oct 2025' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Performance Management</h1>
        <p className="mt-1 text-sm text-text-secondary">Track goals and performance reviews</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-tertiary">
        {[
          { id: 'goals', label: 'Goals' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'newrev', label: 'Write Review' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-primary-DEFAULT text-primary-DEFAULT font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Team Goals — Q1 FY2026</h2>
            <Button label="+ Assign Goal" variant="primary" size="sm" />
          </div>
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'goal', label: 'Goal' },
              { key: 'target', label: 'Target' },
              { key: 'dueDate', label: 'Due Date' },
              { key: 'progress', label: 'Progress' },
              { key: 'status', label: 'Status' },
            ]}
            data={goals.map(g => ({
              employee: g.employee,
              goal: g.goal,
              target: g.target,
              dueDate: g.dueDate,
              progress: (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-background-secondary">
                    <div className="h-2 rounded-full bg-primary-DEFAULT" style={{ width: `${g.progress}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary">{g.progress}%</span>
                </div>
              ),
              status: (
                <Badge
                  variant={
                    g.status === 'On Track' ? 'teal' : g.status === 'Behind' ? 'warning' : 'info'
                  }
                >
                  {g.status}
                </Badge>
              ),
            }))}
          />
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'period', label: 'Period' },
              { key: 'rating', label: 'Rating' },
              { key: 'goalsMet', label: 'Goals Met' },
              { key: 'reviewedBy', label: 'Reviewed By' },
              { key: 'date', label: 'Date' },
              { key: 'action', label: '' },
            ]}
            data={reviews.map(r => ({
              employee: r.employee,
              period: r.period,
              rating: <Badge variant={r.rating === 'Exceeds' ? 'success' : r.rating === 'Meets' ? 'info' : 'warning'}>{r.rating}</Badge>,
              goalsMet: r.goalsMet,
              reviewedBy: r.reviewedBy,
              date: r.date,
              action: <Button label="View" variant="secondary" size="sm" />,
            }))}
          />
        </div>
      )}

      {/* Write Review Tab */}
      {activeTab === 'newrev' && (
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Write Performance Review</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Select Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option>Rohit Shah</option>
                  <option>Priti Gupta</option>
                  <option>Anita Nair</option>
                  <option>Vijay More</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Review Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option>FY 2025-26 H2</option>
                  <option>FY 2025-26 H1</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Overall Rating</label>
                <select
                  className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option>Exceeds Expectations</option>
                  <option>Meets Expectations</option>
                  <option>Needs Improvement</option>
                  <option>Outstanding</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Goals Met (out of 10)</label>
                <Input type="number" defaultValue="7" min="0" max="10" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Strengths</label>
              <textarea
                rows={2}
                placeholder="List employee strengths..."
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Areas for Improvement</label>
              <textarea
                rows={2}
                placeholder="Improvement areas..."
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Development Plan / Next Steps</label>
              <textarea
                rows={2}
                placeholder="Training, mentoring, goals for next period..."
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button label="Submit Review" variant="primary" />
              <Button label="Save Draft" variant="secondary" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
