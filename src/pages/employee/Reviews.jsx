import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiStar, HiDocumentText, HiEye } from 'react-icons/hi2'

function ratingColor(rating) {
  if (rating >= 4.5) return 'green'
  if (rating >= 4.0) return 'blue'
  if (rating >= 3.5) return 'orange'
  return 'red'
}

function statusColor(status) {
  if (status === 'Completed') return 'green'
  if (status === 'Pending') return 'orange'
  if (status === 'Scheduled') return 'blue'
  return 'gray'
}

export default function EmployeeReviews() {
  const [selectedReview, setSelectedReview] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const performanceReviews = useMemo(
    () => [
      {
        id: 1,
        period: 'Q1 2026',
        reviewDate: '2026-04-15',
        reviewer: 'Sarah Johnson',
        reviewerPosition: 'HR Manager',
        overallRating: 4.2,
        workQuality: 4.5,
        productivity: 4.0,
        communication: 4.3,
        teamwork: 4.1,
        leadership: 3.8,
        status: 'Completed',
        strengths: 'Strong technical skills, proactive problem-solving, good team collaboration',
        areasToImprove: 'Leadership in cross-functional projects, documentation',
        goalsNextPeriod: 'Lead at least 2 major projects, improve documentation practices',
        comments: 'Excellent performance overall. John has shown great growth in the past quarter.',
      },
      {
        id: 2,
        period: 'Q4 2025',
        reviewDate: '2026-01-10',
        reviewer: 'Sarah Johnson',
        reviewerPosition: 'HR Manager',
        overallRating: 4.0,
        workQuality: 4.2,
        productivity: 3.9,
        communication: 4.0,
        teamwork: 4.0,
        leadership: 3.5,
        status: 'Completed',
        strengths: 'Consistent delivery, good communication skills',
        areasToImprove: 'Time management, mentoring junior team members',
        goalsNextPeriod: 'Improve task prioritization, start mentoring 1 junior developer',
        comments: 'Good performance with room for growth in leadership areas.',
      },
      {
        id: 3,
        period: 'Q2 2026',
        reviewDate: '2026-07-15',
        reviewer: 'Sarah Johnson',
        reviewerPosition: 'HR Manager',
        overallRating: null,
        workQuality: null,
        productivity: null,
        communication: null,
        teamwork: null,
        leadership: null,
        status: 'Scheduled',
        strengths: '',
        areasToImprove: '',
        goalsNextPeriod: '',
        comments: 'Upcoming review scheduled for July 2026.',
      },
    ],
    []
  )

  const summary = useMemo(() => {
    const completed = performanceReviews.filter((r) => r.status === 'Completed')
    const avgRating =
      completed.length > 0
        ? (completed.reduce((acc, r) => acc + r.overallRating, 0) / completed.length).toFixed(1)
        : '-'
    const scheduled = performanceReviews.filter((r) => r.status === 'Scheduled').length
    return { completed: completed.length, avgRating, scheduled }
  }, [performanceReviews])

  const handleViewDetails = (review) => {
    setSelectedReview(review)
    setDetailModalOpen(true)
  }

  const columns = [
    { key: 'period', label: 'Review Period' },
    { key: 'reviewDate', label: 'Review Date' },
    { key: 'reviewer', label: 'Reviewer' },
    {
      key: 'overallRating',
      label: 'Overall Rating',
      render: (v) => (v ? <Badge label={v.toFixed(1)} color={ratingColor(v)} /> : <span className="text-gray-400">-</span>),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          label="View Details"
          variant="ghost"
          size="sm"
          icon={HiEye}
          onClick={() => handleViewDetails(row)}
          disabled={row.status === 'Scheduled'}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Performance Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">View your performance review history and ratings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Completed Reviews" value={summary.completed} subtitle="Total" color="green" icon={HiDocumentText} />
        <StatCard title="Average Rating" value={summary.avgRating} subtitle="Out of 5.0" color="blue" icon={HiStar} />
        <StatCard title="Upcoming Reviews" value={summary.scheduled} subtitle="Scheduled" color="orange" icon={HiDocumentText} />
      </div>

      <Table columns={columns} data={performanceReviews} pageSize={10} />

      {selectedReview && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Review Details - ${selectedReview.period}`} size="lg">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Reviewer</h3>
                <p className="text-gray-900">{selectedReview.reviewer}</p>
                <p className="text-sm text-gray-500">{selectedReview.reviewerPosition}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Review Date</h3>
                <p className="text-gray-900">{selectedReview.reviewDate}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Rating Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Work Quality</span>
                  <Badge label={selectedReview.workQuality?.toFixed(1) || '-'} color={ratingColor(selectedReview.workQuality || 0)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Productivity</span>
                  <Badge label={selectedReview.productivity?.toFixed(1) || '-'} color={ratingColor(selectedReview.productivity || 0)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Communication</span>
                  <Badge label={selectedReview.communication?.toFixed(1) || '-'} color={ratingColor(selectedReview.communication || 0)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Teamwork</span>
                  <Badge label={selectedReview.teamwork?.toFixed(1) || '-'} color={ratingColor(selectedReview.teamwork || 0)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Leadership</span>
                  <Badge label={selectedReview.leadership?.toFixed(1) || '-'} color={ratingColor(selectedReview.leadership || 0)} />
                </div>
              </div>
            </div>

            {selectedReview.strengths && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Strengths</h3>
                <p className="text-gray-900">{selectedReview.strengths}</p>
              </div>
            )}

            {selectedReview.areasToImprove && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Areas to Improve</h3>
                <p className="text-gray-900">{selectedReview.areasToImprove}</p>
              </div>
            )}

            {selectedReview.goalsNextPeriod && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Goals for Next Period</h3>
                <p className="text-gray-900">{selectedReview.goalsNextPeriod}</p>
              </div>
            )}

            {selectedReview.comments && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Comments</h3>
                <p className="text-gray-900">{selectedReview.comments}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button label="Close" variant="secondary" onClick={() => setDetailModalOpen(false)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
