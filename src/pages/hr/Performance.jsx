import { useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiPlus, HiEye, HiDocument } from 'react-icons/hi2'

export default function Performance() {
  const [activeTab, setActiveTab] = useState('goals')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  
  const [goals, setGoals] = useState([
    { id: 1, employee: 'Rohit Shah', goal: 'Close 15 new accounts', target: '15', dueDate: '30 Jun 2026', progress: 70, status: 'In Progress' },
    { id: 2, employee: 'Priti Gupta', goal: 'Revenue target ₹50L', target: '₹50L', dueDate: '30 Jun 2026', progress: 90, status: 'On Track' },
    { id: 3, employee: 'Anita Nair', goal: 'Launch 3 campaigns', target: '3', dueDate: '30 Jun 2026', progress: 33, status: 'Behind' },
    { id: 4, employee: 'Vijay More', goal: 'Complete sales training', target: '100%', dueDate: '30 Apr 2026', progress: 50, status: 'In Progress' },
  ])
  
  const [reviews, setReviews] = useState([
    { id: 1, employee: 'Priti Gupta', period: 'FY25-26 H1', rating: 'Exceeds', goalsMet: '9/10', reviewedBy: 'Neha Jain', date: '01 Oct 2025' },
    { id: 2, employee: 'Rohit Shah', period: 'FY25-26 H1', rating: 'Meets', goalsMet: '7/10', reviewedBy: 'Neha Jain', date: '01 Oct 2025' },
    { id: 3, employee: 'Anita Nair', period: 'FY25-26 H1', rating: 'Needs Improvement', goalsMet: '5/10', reviewedBy: 'Neha Jain', date: '01 Oct 2025' },
  ])

  const handleViewReview = (review) => {
    setSelectedReview(review)
    setReviewModalOpen(true)
  }
  
  const handleCloseReviewModal = () => {
    setReviewModalOpen(false)
    setSelectedReview(null)
  }
  
  const handleSubmitReview = () => {
    if (!selectedEmployee) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select an employee.',
        timer: 2000,
        showConfirmButton: false
      })
      return
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Review Submitted!',
      text: 'Performance review has been submitted successfully.',
      timer: 2000,
      showConfirmButton: false
    })
    
    setSelectedEmployee('')
    setSelectedPeriod('')
  }
  
  const handleSaveDraft = () => {
    Swal.fire({
      icon: 'info',
      title: 'Draft Saved',
      text: 'Review draft has been saved.',
      timer: 2000,
      showConfirmButton: false
    })
  }

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
            <Button label="Assign Goal" variant="primary" size="sm" icon={HiPlus} onClick={() => setGoalModalOpen(true)} />
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
                  <div className="h-2 w-20 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${g.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{g.progress}%</span>
                </div>
              ),
              status: (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${g.status === 'On Track' ? 'bg-teal-100 text-teal-700' : g.status === 'Behind' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-700'}`}>
                  {g.status}
                </span>
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
              rating: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.rating === 'Exceeds' ? 'bg-green-100 text-green-700' : r.rating === 'Meets' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-600'}`}>{r.rating}</span>,
              goalsMet: r.goalsMet,
              reviewedBy: r.reviewedBy,
              date: r.date,
              action: <Button label="View" variant="secondary" size="sm" icon={HiEye} onClick={() => handleViewReview(r)} />,
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
              <Button label="Submit Review" variant="primary" onClick={handleSubmitReview} />
              <Button label="Save Draft" variant="secondary" onClick={handleSaveDraft} />
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} title="Assign New Goal" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">Employee</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600">
              <option>Select employee...</option>
              <option>Rohit Shah</option>
              <option>Priti Gupta</option>
              <option>Anita Nair</option>
              <option>Vijay More</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">Goal Description</label>
            <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600" placeholder="Enter goal description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Target</label>
              <Input placeholder="Target value" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">Due Date</label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button label="Cancel" variant="ghost" onClick={() => setGoalModalOpen(false)} />
            <Button label="Assign" variant="primary" onClick={() => {
              setGoalModalOpen(false)
              Swal.fire({
                icon: 'success',
                title: 'Goal Assigned!',
                text: 'Goal has been assigned successfully.',
                timer: 2000,
                showConfirmButton: false
              })
            }} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={reviewModalOpen} onClose={handleCloseReviewModal} title="Performance Review Details" size="md">
        {selectedReview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Employee</label>
                <p className="text-sm font-semibold text-gray-900">{selectedReview.employee}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Period</label>
                <p className="text-sm text-gray-900">{selectedReview.period}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Rating</label>
                <p className="text-sm text-gray-900">{selectedReview.rating}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Goals Met</label>
                <p className="text-sm text-gray-900">{selectedReview.goalsMet}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Reviewed By</label>
                <p className="text-sm text-gray-900">{selectedReview.reviewedBy}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900">{selectedReview.date}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button label="Download PDF" variant="secondary" icon={HiDocument} onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Download PDF',
                  text: 'PDF download functionality will be implemented soon.',
                  timer: 2000,
                  showConfirmButton: false
                })
              }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
