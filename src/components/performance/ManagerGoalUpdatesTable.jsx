import { useState, useEffect } from 'react'
import { HiMagnifyingGlass, HiEye, HiArrowPath } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Input } from '../ui/Input.jsx'
import { Table } from '../ui/Table.jsx'
import performanceAssessmentAPI from '../../services/performanceAssessmentAPI.js'
import AssessmentDetailsModal from './AssessmentDetailsModal.jsx'

function ManagerGoalUpdatesTable() {
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

  useEffect(() => {
    fetchManagerGoalUpdates()
  }, [search, pagination.page])

  const fetchManagerGoalUpdates = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all assessments and filter for ones with manager goal details
      const response = await performanceAssessmentAPI.getAllAssessments({
        search,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      })

      if (response?.data) {
        // Filter only assessments that have manager goal details
        const withGoals = (response.data.assessments || []).filter(a => 
          a.goalTitle || a.kpiTarget || a.weightage || a.dueDate || a.priority || a.managerStatus
        )
        setAssessments(withGoals)
        setPagination(prev => ({
          ...prev,
          total: withGoals.length,
          totalPages: Math.ceil(withGoals.length / pagination.limit)
        }))
      } else {
        // Filter only assessments that have manager goal details
        const withGoals = (response.assessments || []).filter(a => 
          a.goalTitle || a.kpiTarget || a.weightage || a.dueDate || a.priority || a.managerStatus
        )
        setAssessments(withGoals)
        setPagination(prev => ({
          ...prev,
          total: withGoals.length,
          totalPages: Math.ceil(withGoals.length / pagination.limit)
        }))
      }
    } catch (err) {
      console.error('Error fetching manager goal updates:', err)
      setError(err.response?.data?.message || 'Failed to fetch manager goal updates')
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

  const tableColumns = [
    {
      key: 'employee.fullName',
      header: 'Employee Name',
      render: (_, row) => row.employee?.fullName || 'N/A'
    },
    {
      key: 'manager.fullName',
      header: 'Manager Name',
      render: (_, row) => row.manager?.fullName || row.managerName || 'N/A'
    },
    {
      key: 'performanceCycle.cycleName',
      header: 'Performance Cycle',
      render: (_, row) => row.performanceCycle?.cycleName || row.performanceCycleName || 'N/A'
    },
    {
      key: 'goalTitle',
      header: 'Goal Title',
      render: (value) => (
        <span className="text-sm text-slate-700 line-clamp-1" title={value}>
          {value || '—'}
        </span>
      )
    },
    {
      key: 'kpiTarget',
      header: 'KPI / Target',
      render: (value) => (
        <span className="text-sm text-slate-700 line-clamp-1" title={value}>
          {value ? value.substring(0, 30) : '—'}
        </span>
      )
    },
    {
      key: 'weightage',
      header: 'Weightage',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">
          {value ? `${value}%` : '—'}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (value) => (
        <span className="text-sm text-slate-700">
          {value ? new Date(value).toLocaleDateString('en-IN') : '—'}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (value) => {
        const priorityConfig = {
          'Low': 'bg-blue-100 text-blue-700',
          'Medium': 'bg-yellow-100 text-yellow-700',
          'High': 'bg-orange-100 text-orange-700',
          'Critical': 'bg-red-100 text-red-700'
        }
        const classes = priorityConfig[value] || 'bg-slate-100 text-slate-700'
        return (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
            {value || '—'}
          </span>
        )
      }
    },
    {
      key: 'managerStatus',
      header: 'Manager Status',
      render: (value) => {
        const statusConfig = {
          'Pending': 'bg-slate-100 text-slate-700',
          'In Progress': 'bg-blue-100 text-blue-700',
          'Completed': 'bg-green-100 text-green-700',
          'On Hold': 'bg-red-100 text-red-700'
        }
        const classes = statusConfig[value] || 'bg-slate-100 text-slate-700'
        return (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
            {value || '—'}
          </span>
        )
      }
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Manager Goal Updates</h2>
        <span className="text-xs font-medium text-slate-500">
          {assessments.length} record{assessments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
          <HiMagnifyingGlass className="h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by employee, manager, or goal..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="border-0 bg-transparent outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
              </div>
              <p className="text-sm text-slate-600">Loading manager goal updates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <HiMagnifyingGlass className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No manager goal updates found</p>
            <p className="mt-1 text-xs text-slate-500">
              {search ? 'Try adjusting your search criteria' : 'Managers have not added goal details yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table columns={tableColumns} data={assessments} pageSize={10} />
            </div>

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

      {/* Assessment Details Modal */}
      {showDetailsModal && selectedAssessment && (
        <AssessmentDetailsModal
          assessment={selectedAssessment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default ManagerGoalUpdatesTable
