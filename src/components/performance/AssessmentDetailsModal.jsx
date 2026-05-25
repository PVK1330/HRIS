import { HiXMark } from 'react-icons/hi2'
import { Modal } from '../ui/Modal.jsx'

function AssessmentDetailsModal({ assessment, onClose }) {
  if (!assessment) return null

  const formattedDate = assessment.createdAt
    ? new Date(assessment.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A'

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Performance Review Details</h2>
            <p className="mt-1 text-sm text-slate-600">
              {assessment.employee?.fullName || assessment.employeeName || 'Employee'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-600">Employee Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{assessment.employee?.fullName || assessment.employeeName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Department</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.department?.name || assessment.departmentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Manager</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.manager?.fullName || assessment.managerName || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-600">Performance Cycle</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.performanceCycle?.cycleName || assessment.performanceCycleName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Admin Status</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.status || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Employee Status</p>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border
                  ${assessment.employeeStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                    assessment.employeeStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    assessment.employeeStatus === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    assessment.employeeStatus === 'On Hold' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  <span className={`h-2 w-2 rounded-full ${assessment.employeeStatus === 'Approved' ? 'bg-green-500' : assessment.employeeStatus === 'Completed' ? 'bg-emerald-500' : assessment.employeeStatus === 'In Progress' ? 'bg-blue-500' : assessment.employeeStatus === 'On Hold' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                  {assessment.employeeStatus || 'Not Started'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Created Date</p>
              <p className="mt-1 text-sm text-slate-900">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Competency Ratings</h3>
            <div className="mt-4 grid gap-3">
              {assessment.competencyRatings && assessment.competencyRatings.length > 0 ? (
                assessment.competencyRatings.map((rating, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{rating.competency?.competencyName || 'Competency'}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{rating.rating}/5</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No competency ratings available.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Key Contributions</h3>
            <p className="mt-3 text-sm text-slate-700">{assessment.keyContributions || 'No key contributions provided.'}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Growth Objectives</h3>
            <p className="mt-3 text-sm text-slate-700">{assessment.growthObjectives || 'No growth objectives provided.'}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AssessmentDetailsModal
