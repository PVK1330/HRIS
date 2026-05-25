import { useState, useEffect } from 'react'
import {
  HiMagnifyingGlass,
  HiEye,
  HiArrowRight,
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import performanceAssessmentAPI from '../../../services/performanceAssessmentAPI.js'
import ManagerAssessmentModal from '../../../components/performance/ManagerAssessmentModal.jsx'

function ManagerPerformance() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Fetch manager assessments on mount and when search/pagination changes
  useEffect(() => {
    fetchManagerAssessments()
  }, [search, pagination.page])

  const fetchManagerAssessments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the new endpoint: /api/v1/employee-performance/manager
      const response = await performanceAssessmentAPI.getManagerAssignedAssessments({
        search,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      })

      if (response?.data) {
        setAssessments(response.data.assessments || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        }))
      } else {
        setAssessments(response.assessments || [])
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 0
        }))
      }
    } catch (err) {
      console.error('Error fetching manager assessments:', err)
      setError(err.response?.data?.message || 'Failed to fetch assessments')
    } finally {
      setLoading(false)
    }
  }

  const handleViewAssessment = (assessment) => {
    setSelectedAssessment(assessment)
    setShowDetailsModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedAssessment(null)
  }

  const handleGoalsUpdated = () => {
    // Refresh the assessment list after goals are updated
    fetchManagerAssessments()
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: HiExclamationCircle },
      'Completed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: HiCheckCircle },
      'In Progress': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: HiArrowRight },
      'In Review': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: HiArrowRight }
    }
    const config = statusConfig[status] || statusConfig['Pending']
    const IconComponent = config.icon

    return (
      <div className={`inline-flex items-center gap-2 rounded-lg border ${config.border} ${config.bg} px-3 py-1.5`}>
        <IconComponent className={`h-4 w-4 ${config.text}`} />
        <span className={`text-sm font-medium ${config.text}`}>{status}</span>
      </div>
    )
  }

  const getManagerGoalStatus = (status) => {
    if (!status) return '—'
    const statusConfig = {
      'Pending': 'bg-slate-100 text-slate-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-red-100 text-red-700'
    }
    const classes = statusConfig[status] || 'bg-slate-100 text-slate-700'
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
        {status}
      </span>
    )
  }

  const getCompetencyRating = (competencyRatings) => {
    if (!competencyRatings || competencyRatings.length === 0) return 'N/A'
    const avg = competencyRatings.reduce((sum, cr) => sum + (cr.rating || 0), 0) / competencyRatings.length
    return avg.toFixed(1)
  }

  const tableColumns = [
    {
      key: 'employee.fullName',
      header: 'Employee Name',
      render: (_, row) => row.employee?.fullName || 'N/A'
    },
    {
      key: 'department',
      header: 'Department',
      render: (_, row) => row.department?.name || row.departmentName || '—'
    },
    {
      key: 'performanceCycle.cycleName',
      header: 'Performance Cycle',
      render: (_, row) => row.performanceCycle?.cycleName || row.performanceCycleName || '—'
    },
    {
      key: 'overallRating',
      header: 'Overall Rating',
      render: (value) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          ⭐ {value || 'N/A'}/5
        </span>
      )
    },
    {
      key: 'status',
      header: 'Admin Status',
      render: (value) => getStatusBadge(value || 'Pending')
    },
    {
      key: 'managerStatus',
      header: 'Manager Goal Status',
      render: (value) => getManagerGoalStatus(value)
    },
    {
      key: 'action',
      header: 'Action',
      render: (_, row) => (
        <button
          onClick={() => handleViewAssessment(row)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          <HiEye className="h-4 w-4" />
          View
        </button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Performance Assessments</h1>
        <p className="text-sm text-slate-600">
          Manage performance assessments for your team members and add goal details
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
          <HiMagnifyingGlass className="h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="border-0 bg-transparent outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Assessments Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
              </div>
              <p className="text-sm text-slate-600">Loading assessments...</p>
            </div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <HiMagnifyingGlass className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No assessments found</p>
            <p className="mt-1 text-xs text-slate-500">
              {search ? 'Try adjusting your search criteria' : 'No assessments have been assigned to you yet'}
            </p>
          </div>
        ) : (
          <>
            <Table columns={tableColumns} data={assessments} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <div className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Assessment Details Modal with Manager Goals */}
      {showDetailsModal && selectedAssessment && (
        <ManagerAssessmentModal
          assessment={selectedAssessment}
          onClose={handleCloseModal}
          onGoalsUpdated={handleGoalsUpdated}
        />
      )}
    </div>
  )
}

export default ManagerPerformance
