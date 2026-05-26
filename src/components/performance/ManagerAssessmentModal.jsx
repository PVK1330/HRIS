import { useState } from 'react'
import { HiXMark, HiArrowPath, HiCheckCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal.jsx'
import { Input } from '../ui/Input.jsx'
import { Button } from '../ui/Button.jsx'
import performanceAssessmentAPI from '../../services/performanceAssessmentAPI.js'

function ManagerAssessmentModal({ assessment, onClose, onGoalsUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    goalTitle: assessment?.goalTitle || '',
    kpiTarget: assessment?.kpiTarget || '',
    weightage: assessment?.weightage || '',
    dueDate: assessment?.dueDate || '',
    priority: assessment?.priority || 'Medium',
    managerStatus: assessment?.managerStatus || 'Pending'
  })

  if (!assessment) return null

  const formattedDate = assessment.createdAt
    ? new Date(assessment.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A'

  const hasGoalDetails = Boolean(
    assessment.goalTitle || assessment.kpiTarget || assessment.weightage || 
    assessment.dueDate || assessment.priority || assessment.managerStatus
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.goalTitle || !formData.goalTitle.trim()) {
      toast.error('Goal Title is required')
      return false
    }
    if (!formData.kpiTarget || !formData.kpiTarget.trim()) {
      toast.error('KPI / Target is required')
      return false
    }
    if (!formData.weightage || isNaN(parseInt(formData.weightage, 10)) || 
        parseInt(formData.weightage, 10) < 1 || parseInt(formData.weightage, 10) > 100) {
      toast.error('Weightage is required and must be between 1 and 100')
      return false
    }
    if (!formData.dueDate) {
      toast.error('Due Date is required')
      return false
    }
    if (!formData.priority || !formData.priority.trim()) {
      toast.error('Priority is required')
      return false
    }
    if (!formData.managerStatus || !formData.managerStatus.trim()) {
      toast.error('Manager Status is required')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await performanceAssessmentAPI.updateManagerGoalsForAssessment(assessment.id, {
        goalTitle: formData.goalTitle.trim(),
        kpiTarget: formData.kpiTarget.trim(),
        weightage: parseInt(formData.weightage, 10),
        dueDate: formData.dueDate,
        priority: formData.priority,
        managerStatus: formData.managerStatus
      })

      toast.success('Manager goal details updated successfully!')
      setIsEditing(false)
      onGoalsUpdated?.()
      onClose()
    } catch (err) {
      console.error('Error updating manager goals:', err)
      toast.error(err.response?.data?.message || 'Failed to update manager goals')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Performance Assessment Details</h2>
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

        {/* Admin Assessment Details (Read-only) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Admin Assessment Details</h3>
          
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Employee Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{assessment.employee?.fullName || assessment.employeeName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Department</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.department?.name || assessment.departmentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Manager</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.manager?.fullName || assessment.managerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Performance Cycle</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.performanceCycle?.cycleName || assessment.performanceCycleName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Overall Rating</p>
              <p className="mt-1 text-sm font-semibold text-blue-700">⭐ {assessment.overallRating || 'N/A'}/5</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Performance Band</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.performanceBand || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Status</p>
              <p className="mt-1 text-sm text-slate-900">{assessment.status || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Assessment Date</p>
              <p className="mt-1 text-sm text-slate-900">{formattedDate}</p>
            </div>
          </div>

          {/* Competency Ratings */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Competency Ratings</h4>
            {assessment.competencyRatings && assessment.competencyRatings.length > 0 ? (
              <div className="space-y-2">
                {assessment.competencyRatings.map((rating, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-sm text-slate-700">{rating.competency?.competencyName || 'Competency'}</p>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{rating.rating}/5</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No competency ratings available.</p>
            )}
          </div>

          {/* Key Contributions */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Contributions</h4>
            <p className="text-sm text-slate-700 line-clamp-3">{assessment.keyContributions || 'No key contributions provided.'}</p>
          </div>

          {/* Growth Objectives */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Growth Objectives</h4>
            <p className="text-sm text-slate-700 line-clamp-3">{assessment.growthObjectives || 'No growth objectives provided.'}</p>
          </div>

          {/* Remarks */}
          {assessment.remarks && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Remarks</h4>
              <p className="text-sm text-slate-700">{assessment.remarks}</p>
            </div>
          )}
        </div>

        {/* Manager Goal Details (Editable) */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Manager Goal Details</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase"
              >
                {hasGoalDetails ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Input
                label="Goal Title"
                name="goalTitle"
                value={formData.goalTitle}
                onChange={handleInputChange}
                placeholder="Enter goal title"
                required
              />
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">KPI / Target</label>
                <textarea
                  name="kpiTarget"
                  value={formData.kpiTarget}
                  onChange={handleInputChange}
                  placeholder="Enter KPI or target details"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Weightage (%)</label>
                  <Input
                    name="weightage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.weightage}
                    onChange={handleInputChange}
                    placeholder="1-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Due Date</label>
                  <Input
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Status</label>
                  <select
                    name="managerStatus"
                    value={formData.managerStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      goalTitle: assessment?.goalTitle || '',
                      kpiTarget: assessment?.kpiTarget || '',
                      weightage: assessment?.weightage || '',
                      dueDate: assessment?.dueDate || '',
                      priority: assessment?.priority || 'Medium',
                      managerStatus: assessment?.managerStatus || 'Pending'
                    })
                  }}
                />
                <Button
                  label="Save"
                  icon={isSaving ? HiArrowPath : HiCheckCircle}
                  onClick={handleSave}
                  disabled={isSaving}
                  className={isSaving ? 'animate-spin' : ''}
                />
              </div>
            </div>
          ) : hasGoalDetails ? (
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Goal Title</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formData.goalTitle || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Weightage</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formData.weightage || '—'}%</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Due Date</p>
                <p className="mt-1 text-sm text-slate-900">{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Priority</p>
                <p className="mt-1 text-sm text-slate-900">{formData.priority || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">KPI / Target</p>
                <p className="mt-1 text-sm text-slate-700 line-clamp-2">{formData.kpiTarget || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Status</p>
                <p className="mt-1 text-sm text-slate-900">{formData.managerStatus || '—'}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">No goal details added yet.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            label="Close"
            variant="secondary"
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  )
}

export default ManagerAssessmentModal
