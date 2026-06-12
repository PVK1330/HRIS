import { useMemo, useState, useEffect } from 'react'
import {
  HiChartBar,
  HiClipboardDocumentCheck,
  HiUserGroup,
  HiClock,
  HiIdentification,
  HiArrowTrendingUp,
  HiPlus,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiCalendarDays,
  HiDocumentText,
  HiChevronRight,
  HiStar,
  HiOutlineStar,
  HiXMark,
  HiPencilSquare,
  HiTrash,
  HiBriefcase
} from 'react-icons/hi2'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts'
import { Badge } from '../../../components/ui/Badge.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { employees, performanceKpis } from '../../../data/mockData.js'
import performanceCyclesAPI from '../../../services/performanceCyclesAPI.js'
import competenciesAPI from '../../../services/competenciesAPI.js'
import performanceAssessmentAPI from '../../../services/performanceAssessmentAPI.js'
import { getEmployee } from '../../../services/employeeService.js'


const COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#99F6E4', '#F0FDFA']

const initialFormData = {
  employeeIds: [], // array of employee IDs for bulk assignment
  departmentId: '', // auto-populated when employee is selected
  department: '', // auto-populated when employee is selected
  managerId: '', // auto-populated when employee is selected
  managerName: '', // auto-populated when employee is selected
  reviewPeriod: '',
  competencyRatings: [], // array of { competency, rating }
  overallRating: 0,
  strengths: '',
  goalsNextPeriod: '',
  remarks: '',
  assessmentDate: new Date().toISOString().split('T')[0],
  status: 'Completed',
  goalTitle: '',
  kpiTarget: '',
  dueDate: '',
  priority: 'Medium'
}

const reviews = employees.slice(0, 10).map((e, idx) => ({
  id: `pr-${e.id}`,
  employeeId: e.id,
  employee: e.name,
  empId: e.empId,
  cycle: 'H1 2026',
  rating: idx % 4 === 0 ? 'Exceeds' : idx % 4 === 1 ? 'Meets' : idx % 4 === 2 ? 'Outstanding' : 'Developing',
  manager: e.manager,
  due: '2026-04-30',
  status: idx % 2 === 0 ? 'Completed' : 'Pending',
}))

function StarRating({ label, value, onChange }) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform active:scale-125"
          >
            {star <= value ? (
              <HiStar className="h-5 w-5 text-amber-400" />
            ) : (
              <HiOutlineStar className="h-5 w-5 text-slate-300 hover:text-amber-200" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function SearchableEmployeeSelect({ value, onChange, employees = [], isMulti = false, disabled = false }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return employees.slice(0, 5)
    return employees.filter(e => {
      const name = String(e.full_name || e.fullName || e.name || '').toLowerCase()
      const code = String(e.emp_id || e.empId || e.empCode || '').toLowerCase()
      const term = search.toLowerCase()
      return name.includes(term) || code.includes(term)
    }).slice(0, 8)
  }, [search, employees])

  const selectedIds = Array.isArray(value) ? value : (value ? [value] : [])

  const handleSelect = (id) => {
    if (!isMulti) {
      onChange([id])
      setIsOpen(false)
      return
    }
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]
    onChange(newSelected)
  }

  const handleRemove = (e, id) => {
    e.stopPropagation()
    onChange(selectedIds.filter(i => i !== id))
  }

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-slate-800">
        Employee{isMulti && 's'}
      </label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex w-full min-h-[40px] cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E]/20 hover:border-slate-400'}`}
      >
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.length > 0 ? (
            selectedIds.map(id => {
              const emp = employees.find(e => String(e.id) === String(id));
              const name = emp ? `${emp.full_name || emp.fullName || emp.name} (${emp.emp_id || emp.empId || emp.empCode || 'N/A'})` : 'Unknown';
              if (!isMulti) return <span key={id} className="text-slate-950 font-bold text-sm my-auto">{name}</span>;
              return (
                <span key={id} className="inline-flex items-center gap-1 bg-[#0F766E]/10 text-[#0F766E] px-2 py-0.5 rounded text-xs font-semibold">
                  {name}
                  {!disabled && (
                    <button type="button" onClick={(e) => handleRemove(e, id)} className="hover:text-red-500 transition-colors">
                      <HiXMark className="h-3 w-3" />
                    </button>
                  )}
                </span>
              )
            })
          ) : (
            <span className="text-slate-400 font-medium my-auto">Select employee{isMulti ? 's' : ''}...</span>
          )}
        </div>
        {!disabled && <HiMagnifyingGlass className="h-4 w-4 text-slate-500 shrink-0 ml-2" />}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[100] mt-1 w-full animate-in fade-in slide-in-from-top-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl">
          <input
            autoFocus
            type="text"
            placeholder="Type to filter..."
            className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((e) => {
              const empName = e.full_name || e.fullName || e.name || 'Unknown Employee';
              const empCode = e.emp_id || e.empId || e.empCode || 'N/A';
              const isSelected = selectedIds.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none ${isSelected ? 'bg-emerald-100/50' : 'hover:bg-emerald-50 focus:bg-emerald-50'}`}
                  onClick={() => handleSelect(e.id)}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-[#0F766E] text-white' : 'bg-emerald-50 text-[#0F766E]'} font-bold text-xs`}>
                    {empName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{empName}</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{empCode}</div>
                  </div>
                  {isSelected && isMulti && <div className="ml-auto text-[#0F766E]"><HiDocumentText className="h-4 w-4" /></div>}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 italic">No employee found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 ${checked ? 'bg-[#0F766E]' : 'bg-slate-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

const initialConfigData = {
  cycleName: '',
  startDate: '',
  endDate: '',
  submissionDeadline: '',
  automatedReminder: false,
}

export default function Performance() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [activeTab, setActiveTab] = useState('hub')
  const [modalOpen, setModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingAssessment, setViewingAssessment] = useState(null)
  const [exportFilters, setExportFilters] = useState({
    cycleId: '',
    startDate: '',
    endDate: '',
    departmentId: '',
    employeeId: '',
    exportType: 'pdf'
  })
  const [exportCycles, setExportCycles] = useState([])
  const [exportLoading, setExportLoading] = useState(false)
  const [exportCyclesLoading, setExportCyclesLoading] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [compModalOpen, setCompModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [configData, setConfigData] = useState(initialConfigData)
  const [files, setFiles] = useState({})
  const [competencies, setCompetencies] = useState([])
  const [compForm, setCompForm] = useState({ competencyName: '' })
  const [editingCompId, setEditingCompId] = useState(null)
  const [compSearch, setCompSearch] = useState('')
  const [compsLoading, setCompsLoading] = useState(false)
  const [compsError, setCompsError] = useState(null)
  const [compsSummary, setCompsSummary] = useState({
    totalCompetencies: 0,
    createdThisMonth: 0,
    recentCompetencies: 0,
  })

  // Performance Cycles State
  const [cycles, setCycles] = useState([])
  const [cyclesSummary, setCyclesSummary] = useState({
    activeCycles: 0,
    upcomingCycles: 0,
    completedCycles: 0,
  })
  const [cyclesLoading, setCyclesLoading] = useState(false)
  const [cyclesError, setCyclesError] = useState(null)
  const [editingCycleId, setEditingCycleId] = useState(null)
  const [cycleSearch, setCycleSearch] = useState('')

  // Employee Performance Assessments State
  const [assessments, setAssessments] = useState([])
  const [assessmentsSummary, setAssessmentsSummary] = useState({
    totalAssessments: 0,
    pendingReview: 0,
    completed: 0
  })
  const [assessmentsLoading, setAssessmentsLoading] = useState(false)
  const [editingAssessmentId, setEditingAssessmentId] = useState(null)

  // Dropdown lists
  const [compDropdownList, setCompDropdownList] = useState([])
  const [cycleDropdownList, setCycleDropdownList] = useState([])
  const [employeeDropdownList, setEmployeeDropdownList] = useState([])

  // Performance Reports / analytics state (real, tenant-scoped)
  const [analytics, setAnalytics] = useState({
    byDepartment: [],
    performanceDist: [],
    byStatus: [],
    ratingTrend: [],
    summary: { total: 0, avgRating: 0, completed: 0, approved: 0 }
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const isHR = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin'

  // Fetch performance cycles and summary on component mount
  useEffect(() => {
    if (isHR) {
      fetchCycles()
      fetchCyclesSummary()
      fetchCompetencies()
      fetchCompsSummary()
      fetchDropdownData()
      fetchAssessments()
      fetchAssessmentsSummary()
    }
  }, [isHR])

  // Fetch assessments when search q changes
  useEffect(() => {
    if (isHR) {
      fetchAssessments(q)
    }
  }, [q, isHR])

  // Fetch performance cycles when export modal opens
  useEffect(() => {
    if (exportModalOpen && exportCycles.length === 0) {
      fetchPerformanceCycles()
    }
  }, [exportModalOpen])

  // Fetch competencies when search query changes
  useEffect(() => {
    if (isHR) {
      fetchCompetencies(compSearch)
    }
  }, [compSearch, isHR])

  // Fetch analytics when the Performance Reports tab is opened
  useEffect(() => {
    if (isHR && activeTab === 'analytics') {
      fetchAnalytics()
    }
  }, [activeTab, isHR])

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const response = await performanceAssessmentAPI.getAnalytics()
      if (response.success && response.data) {
        setAnalytics({
          byDepartment: response.data.byDepartment || [],
          performanceDist: response.data.performanceDist || [],
          byStatus: response.data.byStatus || [],
          ratingTrend: response.data.ratingTrend || [],
          summary: response.data.summary || { total: 0, avgRating: 0, completed: 0, approved: 0 }
        })
      }
    } catch (error) {
      console.error('Failed to load performance analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  /**
   * Fetch all performance cycles from API
   */
  const fetchCycles = async (search = '') => {
    try {
      setCyclesLoading(true)
      setCyclesError(null)
      const response = await performanceCyclesAPI.getAllCycles({
        search,
        page: 1,
        limit: 100,
      })
      if (response.success && response.data?.cycles) {
        setCycles(response.data.cycles)
      }
    } catch (error) {
      setCyclesError(error.response?.data?.message || 'Failed to fetch performance cycles')
      console.error('Error fetching cycles:', error)
    } finally {
      setCyclesLoading(false)
    }
  }

  /**
   * Fetch performance cycles summary
   */
  const fetchCyclesSummary = async () => {
    try {
      const response = await performanceCyclesAPI.getSummary()
      if (response.success && response.data) {
        setCyclesSummary(response.data)
      }
    } catch (error) {
      console.error('Error fetching cycles summary:', error)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const [cyclesRes, compsRes, empsRes] = await Promise.all([
        performanceAssessmentAPI.getCyclesDropdown(),
        performanceAssessmentAPI.getCompetenciesDropdown(),
        performanceAssessmentAPI.getEmployeesDropdown()
      ])
      if (cyclesRes.success) setCycleDropdownList(cyclesRes.data)
      if (compsRes.success) setCompDropdownList(compsRes.data)
      if (empsRes.success) {
        const empList = Array.isArray(empsRes.data) ? empsRes.data : (empsRes.data?.employees || [])
        setEmployeeDropdownList(empList)
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    }
  }

  /**
   * Fetch performance cycles for export modal
   */
  const fetchPerformanceCycles = async () => {
    try {
      setExportCyclesLoading(true)
      const response = await performanceAssessmentAPI.getPerformanceCycles()
      if (response.success && response.data) {
        setExportCycles(response.data)
      }
    } catch (error) {
      console.error('Error fetching performance cycles:', error)
    } finally {
      setExportCyclesLoading(false)
    }
  }

  /**
   * Fetch employee performance assessments
   */
  const fetchAssessments = async (search = '') => {
    try {
      setAssessmentsLoading(true)
      const response = await performanceAssessmentAPI.getAllAssessments({ search })
      if (response.success && response.data?.assessments) {
        setAssessments(response.data.assessments)
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setAssessmentsLoading(false)
    }
  }

  /**
   * Fetch employee performance summary statistics
   */
  const fetchAssessmentsSummary = async () => {
    try {
      const response = await performanceAssessmentAPI.getSummary()
      if (response.success && response.data) {
        setAssessmentsSummary(response.data)
      }
    } catch (error) {
      console.error('Error fetching assessments summary:', error)
    }
  }

  /**
   * Populate edit modal with selected assessment data
   */
  const handleEditAssessment = (assessment) => {
    setEditingAssessmentId(assessment.id)

    // Format competency ratings from populated objects to simple array
    const formattedRatings = (assessment.competencyRatings || []).map(cr => ({
      competency: cr.competency?.id || cr.competency,
      rating: cr.rating
    }))

    setFormData({
      employeeIds: [assessment.employee?.id || assessment.employee],
      reviewPeriod: assessment.performanceCycle?.id || assessment.performanceCycle,
      competencyRatings: formattedRatings,
      overallRating: assessment.overallRating,
      strengths: assessment.keyContributions || '',
      goalsNextPeriod: assessment.growthObjectives || '',
      remarks: assessment.remarks || '',
      assessmentDate: assessment.assessmentDate ? assessment.assessmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
      status: assessment.status || 'Completed',
      goalTitle: assessment.goalTitle || '',
      kpiTarget: assessment.kpiTarget || '',
      dueDate: assessment.dueDate ? assessment.dueDate.split('T')[0] : '',
      priority: assessment.priority || 'Medium',
      departmentId: assessment.departmentId || assessment.employee?.departmentId || assessment.employee?.department_id || '',
      department: assessment.departmentName || assessment.employee?.departmentName || assessment.employee?.department || '',
      managerId: assessment.managerId || assessment.employee?.managerId || assessment.employee?.manager_id || '',
      managerName: assessment.managerName || assessment.employee?.managerName || 'No manager assigned'
    })

    setModalOpen(true)
  }

  const handleViewAssessment = (assessment) => {
    setViewingAssessment(assessment)
    setViewModalOpen(true)
  }

  /**
   * Handle approval of performance assessment
   */
  const handleApproveAssessment = async () => {
    if (!viewingAssessment?.id) return

    try {
      setApprovalLoading(true)
      const response = await performanceAssessmentAPI.approveAssessment(viewingAssessment.id)

      if (response.success) {
        // Update the viewing assessment with the approved status
        setViewingAssessment(response.data)

        // Update the assessments list
        setAssessments(prev => prev.map(a => a.id === response.data.id ? response.data : a))

        // Show success message
        alert('Assessment approved successfully')

        // Auto-close the modal after approval
        setTimeout(() => {
          setViewModalOpen(false)
          setViewingAssessment(null)
        }, 500)
      } else {
        alert(response.message || 'Failed to approve assessment')
      }
    } catch (error) {
      console.error('Error approving assessment:', error)
      alert(error.response?.data?.message || 'Error approving assessment')
    } finally {
      setApprovalLoading(false)
    }
  }

  /**
   * Handle soft deletion of performance assessment
   */
  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this performance assessment?')) return
    try {
      const response = await performanceAssessmentAPI.deleteAssessment(id)
      if (response.success) {
        await fetchAssessments(q)
        await fetchAssessmentsSummary()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete assessment')
    }
  }

  /**
   * Handle form submission for creating or updating performance assessment
   */
  const handleSubmitAssessment = async (e) => {
    e.preventDefault()

    if (!formData.employeeIds || formData.employeeIds.length === 0) {
      alert('Please select at least one employee')
      return
    }
    if (!formData.reviewPeriod) {
      alert('Please select a performance cycle')
      return
    }

    // Map competency ratings dynamically from list - ensure all IDs and ratings are numbers
    const competencyRatings = compDropdownList.map(comp => {
      const rObj = formData.competencyRatings?.find(r => Number(r.competency) === Number(comp.id))
      return {
        competency: Number(comp.id), // ensure competency ID is a number
        rating: rObj ? Number(rObj.rating) : 1 // ensure rating is a number
      }
    })

    try {
      // Ensure all IDs are numbers
      const employeeId = Number(formData.employeeIds[0])
      const departmentId = Number(formData.departmentId) || null
      const managerId = Number(formData.managerId) || null
      const cycleId = Number(formData.reviewPeriod)

      if (editingAssessmentId) {
        // Edit single assessment
        const payload = {
          employeeId,
          departmentId,
          performanceCycleId: cycleId,
          competencyRatings,
          keyContributions: formData.strengths,
          growthObjectives: formData.goalsNextPeriod,
          remarks: formData.remarks,
          assessmentDate: formData.assessmentDate,
          status: formData.status || 'Completed',
          goalTitle: formData.goalTitle,
          kpiTarget: formData.kpiTarget,
          dueDate: formData.dueDate || null,
          priority: formData.priority
        }
        await performanceAssessmentAPI.updateAssessment(editingAssessmentId, payload)
      } else {
        // Create detailed assessments for each selected employee
        for (const empIdRaw of formData.employeeIds) {
          const empId = Number(empIdRaw)
          const payload = {
            employeeId: empId,
            departmentId,
            performanceCycleId: cycleId,
            competencyRatings,
            keyContributions: formData.strengths,
            growthObjectives: formData.goalsNextPeriod,
            remarks: formData.remarks,
            assessmentDate: formData.assessmentDate,
            status: formData.status || 'Completed',
            goalTitle: formData.goalTitle,
            kpiTarget: formData.kpiTarget,
            dueDate: formData.dueDate || null,
            priority: formData.priority
          }

          await performanceAssessmentAPI.createAssessment(payload)
        }
      }

      handleCloseModal()
      await fetchAssessments(q)
      await fetchAssessmentsSummary()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save assessment')
      console.error('Error saving assessment:', error)
    }
  }

  /**
   * Fetch all competencies from API
   */
  const fetchCompetencies = async (search = '') => {
    try {
      setCompsLoading(true)
      setCompsError(null)
      const response = await competenciesAPI.getAllCompetencies({ search })
      if (response.success && response.data) {
        setCompetencies(response.data)
      }
    } catch (error) {
      setCompsError(error.response?.data?.message || 'Failed to fetch competencies')
      console.error('Error fetching competencies:', error)
    } finally {
      setCompsLoading(false)
    }
  }

  /**
   * Fetch competencies summary from API
   */
  const fetchCompsSummary = async () => {
    try {
      const response = await competenciesAPI.getSummary()
      if (response.success && response.data) {
        setCompsSummary(response.data)
      }
    } catch (error) {
      console.error('Error fetching competencies summary:', error)
    }
  }

  /**
   * Handle competency deletion
   */
  const handleDeleteCompetency = async (id) => {
    if (!window.confirm('Are you sure you want to delete this competency?')) return
    try {
      const response = await competenciesAPI.deleteCompetency(id)
      if (response.success) {
        await fetchCompetencies(compSearch)
        await fetchCompsSummary()
        await fetchDropdownData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete competency')
    }
  }

  /**
   * Handle create new cycle
   */
  const handleCreateCycle = async (e) => {
    e.preventDefault()
    try {
      const cyclePayload = {
        cycleName: configData.cycleName,
        startDate: new Date(configData.startDate).toISOString(),
        endDate: new Date(configData.endDate).toISOString(),
        submissionDeadline: new Date(configData.submissionDeadline).toISOString(),
        automatedReminder: configData.automatedReminder,
      }

      const response = await performanceCyclesAPI.createCycle(cyclePayload)
      if (response.success) {
        // Refresh cycles and summary
        await fetchCycles()
        await fetchCyclesSummary()
        await fetchDropdownData()
        handleCloseConfigModal()
      }
    } catch (error) {
      setCyclesError(error.response?.data?.message || 'Failed to create cycle')
      console.error('Error creating cycle:', error)
    }
  }

  /**
   * Handle update cycle
   */
  const handleUpdateCycle = async (e) => {
    e.preventDefault()
    if (!editingCycleId) return

    try {
      const updatePayload = {
        cycleName: configData.cycleName,
        startDate: new Date(configData.startDate).toISOString(),
        endDate: new Date(configData.endDate).toISOString(),
        submissionDeadline: new Date(configData.submissionDeadline).toISOString(),
        automatedReminder: configData.automatedReminder,
      }

      const response = await performanceCyclesAPI.updateCycle(editingCycleId, updatePayload)
      if (response.success) {
        await fetchCycles()
        await fetchCyclesSummary()
        await fetchDropdownData()
        handleCloseConfigModal()
        setEditingCycleId(null)
      }
    } catch (error) {
      setCyclesError(error.response?.data?.message || 'Failed to update cycle')
      console.error('Error updating cycle:', error)
    }
  }

  /**
   * Handle delete cycle
   */
  const handleDeleteCycle = async (cycleId) => {
    if (!window.confirm('Are you sure you want to delete this performance cycle?')) return

    try {
      const response = await performanceCyclesAPI.deleteCycle(cycleId)
      if (response.success) {
        await fetchCycles()
        await fetchCyclesSummary()
        await fetchDropdownData()
      }
    } catch (error) {
      setCyclesError(error.response?.data?.message || 'Failed to delete cycle')
      console.error('Error deleting cycle:', error)
    }
  }

  /**
   * Handle edit cycle
   */
  const handleEditCycle = (cycle) => {
    setEditingCycleId(cycle.id)
    setConfigData({
      cycleName: cycle.cycle_name,
      startDate: cycle.start_date.split('T')[0],
      endDate: cycle.end_date.split('T')[0],
      submissionDeadline: cycle.submission_deadline.split('T')[0],
      automatedReminder: cycle.automated_reminder,
    })
    setConfigModalOpen(true)
  }

  const filtered = useMemo(() => {
    return assessments
  }, [assessments])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /**
   * Handle employee selection and auto-populate department and manager
   * Fetches manager details from API if manager_id is available
   */
  const handleEmployeeSelect = async (employeeId) => {
    const selected = employeeDropdownList.find(e => String(e.id) === String(employeeId))
    if (selected) {
      let deptName = selected.departmentName || selected.department || ''
      let managerName = selected.managerName || ''
      let managerId = selected.managerId || selected.manager_id || ''

      // If employee search API does not return managerName:
      // Call employee details API by employee id.
      // Use response.managerName to fill Manager field.
      if (!managerName) {
        try {
          const empDetails = await getEmployee(employeeId)
          if (empDetails) {
            deptName = empDetails.departmentName || empDetails.department || deptName
            managerName = empDetails.managerName || ''
            managerId = empDetails.managerId || empDetails.manager_id || managerId
          }
        } catch (error) {
          console.warn(`Failed to fetch employee details for ID ${employeeId}:`, error)
        }
      }

      // Do not set manager as N/A unless managerName is actually empty/null.
      // Remove any hardcoded fallback like: managerName || "N/A"
      // Use fallback only: managerName || "No manager assigned"
      const finalManagerName = managerName || "No manager assigned"

      setFormData(prev => ({
        ...prev,
        employeeIds: [employeeId],
        departmentId: selected.departmentId || selected.department_id || '',
        department: deptName,
        managerId: managerId || '',
        managerName: finalManagerName,
        reviewerName: finalManagerName
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        employeeIds: [],
        departmentId: '',
        department: '',
        managerId: '',
        managerName: '',
        reviewerName: ''
      }))
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setFiles({})
  }

  const handleCloseConfigModal = () => {
    setConfigModalOpen(false)
    setConfigData(initialConfigData)
    setEditingCycleId(null)
  }

  const handleConfigChange = (e) => {
    const { name, value } = e.target
    setConfigData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddReview = () => {
    setFormData(initialFormData)
    setFiles({})
    setModalOpen(true)
  }

  const applyQuickFilter = (days) => {
    const end = new Date()
    const start = new Date()
    if (days) {
      start.setDate(end.getDate() - days)
    } else {
      start.setMonth(end.getMonth() - 12)
    }
    setExportFilters(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }))
  }

  const handleExport = async () => {
    try {
      // Validate inputs
      if (!exportFilters.employeeId) {
        alert('Please select an employee.')
        return
      }

      if (!exportFilters.exportType) {
        alert('Please select an export type.')
        return
      }

      const hasCycle = exportFilters.cycleId !== undefined && exportFilters.cycleId !== null && exportFilters.cycleId !== ''
      const hasDateRange = exportFilters.startDate || exportFilters.endDate

      if (hasCycle && hasDateRange) {
        alert('Please select either performance cycle or custom date range, not both.')
        return
      }

      if (!hasCycle && (!exportFilters.startDate || !exportFilters.endDate)) {
        alert('Please select performance cycle or start and end date.')
        return
      }

      setExportLoading(true)
      const response = await performanceAssessmentAPI.exportPerformanceData(
        {
          employeeId: Number(exportFilters.employeeId),
          cycleId: hasCycle ? Number(exportFilters.cycleId) : null,
          startDate: !hasCycle ? exportFilters.startDate : null,
          endDate: !hasCycle ? exportFilters.endDate : null,
          departmentId: exportFilters.departmentId ? Number(exportFilters.departmentId) : null,
        },
        exportFilters.exportType
      )

      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const filename = `employee-performance-report.${exportFilters.exportType}`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setExportModalOpen(false)
      setExportFilters({
        cycleId: '',
        startDate: '',
        endDate: '',
        departmentId: '',
        employeeId: '',
        exportType: 'pdf'
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      alert(error.response?.data?.message || 'Error exporting data.')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!exportFilters.startDate || !exportFilters.endDate) {
      alert("Start date and End date are required.")
      return
    }
    if (new Date(exportFilters.endDate) < new Date(exportFilters.startDate)) {
      alert("End date cannot be before start date.")
      return
    }

    const filteredForExport = assessments.filter(assessment => {
      const aDateStr = assessment.assessmentDate || assessment.reviewDate || assessment.createdAt
      if (!aDateStr) return false
      const aDate = new Date(aDateStr)
      const start = new Date(exportFilters.startDate)
      const end = new Date(exportFilters.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      if (aDate < start || aDate > end) return false

      if (exportFilters.department !== 'All Departments') {
        const empDept = assessment.employee?.department || assessment.department || ''
        if (empDept !== exportFilters.department) return false
      }
      return true
    })

    if (filteredForExport.length === 0) {
      alert("No performance data found for the selected filters.")
      return
    }

    try {
      const { jsPDF } = await import('jspdf')
      await import('jspdf-autotable')

      const doc = new jsPDF('landscape')

      doc.setFontSize(16)
      doc.text("Performance Data Report", 14, 15)

      doc.setFontSize(10)
      doc.text(`Selected Date Range: ${exportFilters.startDate} to ${exportFilters.endDate}`, 14, 22)
      doc.text(`Selected Department: ${exportFilters.department}`, 14, 27)
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 32)

      const tableColumn = [
        "Employee Name", "Employee ID", "Department", "Performance Cycle",
        "Manager Name", "Status", "Rating", "Review Date",
        "Key Contributions", "Growth Objectives"
      ]

      const tableRows = []
      filteredForExport.forEach(assessment => {
        const ratingVal = assessment.overallRating ? Number(assessment.overallRating).toFixed(1) : 'N/A'

        tableRows.push([
          assessment.employee?.fullName || assessment.employee?.name || 'N/A',
          assessment.employee?.empId || assessment.employee?.empCode || 'N/A',
          assessment.employee?.department || assessment.department || 'N/A',
          assessment.performanceCycle?.cycleName || assessment.performanceCycle || 'N/A',
          assessment.managerName || assessment.reviewerName || 'No manager assigned',
          assessment.status || 'N/A',
          ratingVal,
          assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : 'N/A',
          assessment.keyContributions || assessment.strengths || '',
          assessment.growthObjectives || assessment.goalsNextPeriod || ''
        ])
      })

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 118, 110] }
      })

      doc.save(`Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      setExportModalOpen(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please ensure jsPDF and jspdf-autotable are installed.')
    }
  }

  const openCompModalForCreate = () => {
    setEditingCompId(null)
    setCompForm({ competencyName: '' })
    setCompModalOpen(true)
  }

  const openCompModalForEdit = (comp) => {
    setEditingCompId(comp.id)
    setCompForm({ competencyName: comp.competencyName || comp.name || '' })
    setCompModalOpen(true)
  }

  const closeCompModal = () => {
    setCompModalOpen(false)
    setEditingCompId(null)
    setCompForm({ competencyName: '' })
  }

  const handleSaveCompetency = async (e) => {
    e.preventDefault()
    if (!compForm.competencyName.trim()) return
    try {
      const payload = { competencyName: compForm.competencyName.trim() }
      const response = editingCompId
        ? await competenciesAPI.updateCompetency(editingCompId, payload)
        : await competenciesAPI.createCompetency(payload)
      if (response.success) {
        closeCompModal()
        await fetchCompetencies(compSearch)
        await fetchCompsSummary()
        await fetchDropdownData()
      }
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${editingCompId ? 'update' : 'add'} competency`)
    }
  }

  const filteredComps = competencies;

  const tabStats = useMemo(() => {
    return {
      hub: [
        { label: 'TOTAL ASSESSMENTS', count: assessmentsSummary.totalAssessments, bgColor: 'bg-[#0F172A]', icon: HiClipboardDocumentCheck },
        { label: 'PENDING REVIEW', count: assessmentsSummary.pendingReview, bgColor: 'bg-[#F59E0B]', icon: HiClock },
        { label: 'COMPLETED', count: assessmentsSummary.completed, bgColor: 'bg-[#0F766E]', icon: HiArrowTrendingUp },
      ],
      cycles: [
        { label: 'ACTIVE CYCLES', count: cyclesSummary.activeCycles, bgColor: 'bg-[#0F766E]', icon: HiCalendarDays },
        { label: 'UPCOMING', count: cyclesSummary.upcomingCycles, bgColor: 'bg-[#3B82F6]', icon: HiClock },
        { label: 'COMPLETED', count: cyclesSummary.completedCycles, bgColor: 'bg-[#0F172A]', icon: HiClipboardDocumentCheck },
      ],
      compCycle: [
        { label: 'COMPETENCIES', count: compsSummary.totalCompetencies, bgColor: 'bg-[#0F172A]', icon: HiAdjustmentsHorizontal },
        { label: 'ACTIVE IN CYCLES', count: cyclesSummary.activeCycles, bgColor: 'bg-[#0F766E]', icon: HiBriefcase },
        { label: 'CREATED THIS MONTH', count: compsSummary.createdThisMonth, bgColor: 'bg-[#F59E0B]', icon: HiClock },
      ],
    }
  }, [competencies, cyclesSummary, compsSummary, assessmentsSummary])

  const renderTabStats = (tabId) => {
    const cards = tabStats[tabId]
    if (!cards?.length) return null
    return (
      <div
        key={tabId}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm min-w-0"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">
                {card.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Helper function to get progress bar color based on rating
  const getProgressBarColor = (rating) => {
    if (!rating) return 'rgba(203, 213, 225, 1)'
    const ratingNum = Number(rating)
    if (ratingNum >= 4.5) return 'rgba(5, 150, 105, 1)' // emerald-600
    if (ratingNum >= 4) return 'rgba(37, 99, 235, 1)' // blue-600
    if (ratingNum >= 3) return 'rgba(217, 119, 6, 1)' // amber-600
    if (ratingNum >= 2) return 'rgba(234, 88, 12, 1)' // orange-600
    return 'rgba(220, 38, 38, 1)' // red-600
  }

  // Helper function to get progress bar CSS class for Tailwind fallback
  const getProgressBarClass = (rating) => {
    if (!rating) return 'bg-slate-300'
    const ratingNum = Number(rating)
    if (ratingNum >= 4.5) return 'bg-emerald-500'
    if (ratingNum >= 4) return 'bg-blue-500'
    if (ratingNum >= 3) return 'bg-amber-500'
    if (ratingNum >= 2) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Helper function to get rating label
  const getRatingLabel = (rating) => {
    if (!rating) return 'Not Rated'
    const ratingNum = Number(rating)
    if (ratingNum >= 4.5) return 'Outstanding'
    if (ratingNum >= 4) return 'Exceeds'
    if (ratingNum >= 3) return 'Meets'
    if (ratingNum >= 2) return 'Developing'
    return 'Unsatisfactory'
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiIdentification className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {row.employee?.fullName || row.employee?.name || 'N/A'}
            </div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {row.employee?.empId || row.employee?.empCode || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'performanceCycle',
      label: 'Cycle',
      render: (_, row) => (
        <span className="text-sm font-medium text-slate-600">
          {row.performanceCycle?.name || row.performanceCycle?.cycleName || (typeof row.performanceCycle === 'string' ? row.performanceCycle : 'N/A')}
        </span>
      )
    },
    {
      key: 'employeeStatus',
      label: 'Employee Status',
      render: (_, row) => {
        const status = row.employeeStatus || 'Not Started'
        let colorClass = 'bg-slate-100 text-slate-700'
        let dotClass = 'bg-slate-400'
        if (status === 'Approved') {
          colorClass = 'bg-green-100 text-green-700'
          dotClass = 'bg-green-500'
        } else if (status === 'In Progress') {
          colorClass = 'bg-blue-100 text-blue-700'
          dotClass = 'bg-blue-500'
        } else if (status === 'Completed') {
          colorClass = 'bg-emerald-100 text-emerald-700'
          dotClass = 'bg-emerald-500'
        } else if (status === 'On Hold') {
          colorClass = 'bg-orange-100 text-orange-700'
          dotClass = 'bg-orange-500'
        }
        return (
          <div className="flex items-center">
            <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
              {status}
            </span>
          </div>
        )
      }
    },
    {
      key: 'employeeProgress',
      label: 'Employee Progress',
      render: (_, row) => {
        const rawProgress = row.employeeProgress || '0%'

        // Get all numbers from text like "50 to 80%"
        const numbers = String(rawProgress).match(/\d+/g)?.map(Number) || [0]

        // Use highest value for progress bar width
        const percentage = Math.min(100, Math.max(0, Math.max(...numbers)))

        let barColor = '#EF4444' // red
        if (percentage >= 80) barColor = '#10B981' // green
        else if (percentage >= 50) barColor = '#F59E0B' // orange
        else if (percentage >= 1) barColor = '#3B82F6' // blue

        const displayLabel = String(rawProgress).includes('%')
          ? rawProgress
          : `${rawProgress}%`

        return (
          <div className="flex items-center gap-3 w-full min-w-[180px]">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>

            <span className="text-xs font-bold text-slate-700 min-w-[70px] text-right">
              {displayLabel}
            </span>
          </div>
        )
      }
    },
    {
      key: 'employeeUpdatedAt',
      label: 'Last Updated',
      render: (_, row) => {
        const dateStr = row.employeeUpdatedAt
        if (!dateStr) return <span className="text-xs text-slate-400">N/A</span>
        return (
          <span className="text-xs font-medium text-slate-600">
            {new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleViewAssessment(row)
            }}
            className="inline-flex items-center justify-center rounded-none border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] uppercase tracking-wider shadow-sm"
          >
            View
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Performance Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>HR Operations</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Performance Listing</span>
          </div>
        </div>
        {isHR && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExportModalOpen(true)}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiDocumentText className="h-4 w-4" /> Export Performance Data
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'hub', label: 'Employee Performance', icon: HiBriefcase },
            { id: 'cycles', label: 'Performance Cycle', icon: HiCalendarDays },
            { id: 'compCycle', label: 'Competency Ratings', icon: HiAdjustmentsHorizontal },
            { id: 'analytics', label: 'Performance Reports', icon: HiChartBar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-3 px-8 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id
                ? 'text-[#0F766E]'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F766E] animate-in fade-in duration-300" />
              )}
            </button>
          ))}
        </div>

        {['hub', 'cycles', 'compCycle'].includes(activeTab) && renderTabStats(activeTab)}

        {activeTab === 'hub' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              {/* Green Table Header */}
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Employee Performance</h2>
                {isHR && (
                  <button
                    type="button"
                    onClick={openAddReview}
                    className="inline-flex items-center gap-1.5 rounded-none bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <HiPlus className="h-3.5 w-3.5" /> Add Assessment
                  </button>
                )}
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search employee, ID or manager..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ('')}
                      className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {assessmentsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-slate-50/20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F766E]" />
                  <span className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading assessments...</span>
                </div>
              ) : (
                <Table columns={columns} data={filtered} pageSize={10} square />
              )}
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              {/* Green Header */}
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Performance Cycles</h2>
                <button
                  onClick={() => setConfigModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-none bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <HiPlus className="h-3.5 w-3.5" /> New Cycle
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search cycles..."
                    value={cycleSearch}
                    onChange={(e) => setCycleSearch(e.target.value)}
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <p className="text-xs font-medium text-slate-500">{cycles.length} records shown</p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Cycle Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Period</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Completion</th>
                      {isHR && <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cyclesLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F766E] border-t-transparent" />
                            <span className="text-sm text-slate-500">Loading cycles...</span>
                          </div>
                        </td>
                      </tr>
                    ) : cycles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                          No performance cycles found
                        </td>
                      </tr>
                    ) : (
                      cycles.map((cycle) => (
                        <tr key={cycle.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
                                <HiCalendarDays className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{cycle.cycle_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-slate-600">
                              {new Date(cycle.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(cycle.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${cycle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                              cycle.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${cycle.status === 'ACTIVE' ? 'bg-emerald-500' :
                                cycle.status === 'UPCOMING' ? 'bg-blue-500' :
                                  'bg-slate-400'
                                }`} />
                              {cycle.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 w-48">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${cycle.status === 'ACTIVE' ? 'bg-emerald-500' :
                                    cycle.status === 'UPCOMING' ? 'bg-blue-500' :
                                      'bg-slate-400'
                                    }`}
                                  style={{ width: `${cycle.completion_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700 w-8 text-right">{cycle.completion_percentage}%</span>
                            </div>
                          </td>
                          {isHR && (
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditCycle(cycle)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56] shadow-sm"
                                  title="Edit"
                                  aria-label="Edit cycle"
                                >
                                  <HiPencilSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCycle(cycle.id)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 shadow-sm"
                                  title="Delete"
                                  aria-label="Delete cycle"
                                >
                                  <HiTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compCycle' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              {/* Green Header */}
              <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
                <h2 className="text-sm font-semibold text-white">Competency Registry</h2>
                {isHR && (
                  <button
                    onClick={openCompModalForCreate}
                    className="inline-flex items-center gap-1.5 rounded-none bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <HiPlus className="h-3.5 w-3.5" /> Add Competency
                  </button>
                )}
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="relative min-w-[250px] flex-1 max-w-md">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    placeholder="Search competencies..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-medium text-slate-500">{filteredComps.length} records shown</p>
                  {compSearch && (
                    <button
                      type="button"
                      onClick={() => setCompSearch('')}
                      className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">#</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Competency Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">Created Date</th>
                      {isHR && <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComps.map((comp, i) => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E]">
                              <HiAdjustmentsHorizontal className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{comp.competencyName || comp.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-500">{comp.createdAt ? new Date(comp.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                        </td>
                        {isHR && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openCompModalForEdit(comp)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                                aria-label="Edit"
                              >
                                <HiPencilSquare className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCompetency(comp.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-50 text-red-500 transition hover:bg-red-100"
                                aria-label="Delete"
                              >
                                <HiXMark className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {filteredComps.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                          No competencies found. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {analyticsLoading && (
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <HiClock className="h-4 w-4 animate-pulse text-[#0F766E]" /> Loading analytics…
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <HiUserGroup className="h-4 w-4 text-[#0F766E]" /> Assessments by Department
                  </h3>
                  <div className="h-2 w-8 bg-slate-100" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900, textAnchor: 'middle' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                        {analytics.byDepartment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <HiChartBar className="h-4 w-4 text-[#0F766E]" /> Performance Band Matrix
                  </h3>
                  <div className="h-2 w-8 bg-slate-100" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.performanceDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={0}
                        dataKey="count"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {analytics.performanceDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 border-t border-slate-50 pt-6">
                  {analytics.performanceDist.map((d, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{d.name}</div>
                      <div className="text-sm font-black text-slate-900 tracking-tight">{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
                  <HiClock className="h-4 w-4 text-[#0F766E]" /> Average Rating by Cycle
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.ratingTrend}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="cycle" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900' }} />
                      <Area type="monotone" dataKey="rate" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
                  <HiArrowTrendingUp className="h-4 w-4 text-[#0F766E]" /> Assessment Status Breakdown
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byStatus}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900' }} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                        {analytics.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                <HiClipboardDocumentCheck className="h-4 w-4 text-[#0F766E]" /> Performance Snapshot
              </h3>
              <div className="grid gap-6 md:grid-cols-4">
                {(() => {
                  const total = analytics.summary.total || 0
                  const completed = analytics.summary.completed || 0
                  const approved = analytics.summary.approved || 0
                  const completedPct = total ? Math.round((completed / total) * 100) : 0
                  const approvedPct = total ? Math.round((approved / total) * 100) : 0
                  const avgPct = Math.round(((analytics.summary.avgRating || 0) / 5) * 100)
                  return [
                    { label: 'Total Assessments', display: String(total), value: total ? 100 : 0, color: 'bg-[#0F766E]' },
                    { label: 'Avg Rating (/5)', display: Number(analytics.summary.avgRating || 0).toFixed(2), value: avgPct, color: 'bg-emerald-500' },
                    { label: 'Completed', display: `${completedPct}%`, value: completedPct, color: 'bg-teal-500' },
                    { label: 'Approved', display: `${approvedPct}%`, value: approvedPct, color: 'bg-amber-500' }
                  ]
                })().map((item, i) => (
                  <div key={i} className="rounded-none border border-slate-100 p-5 bg-slate-50/30">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{item.label}</div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">{item.display}</div>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-none overflow-hidden mb-1">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assessment Modal */}
      {/* ── Performance Review Modal ───────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="xl"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              Performance Review
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure employee assessment details, ratings, and strategic feedback.
            </p>
          </div>
        }
      >
        <form
          onSubmit={handleSubmitAssessment}
          className="pt-2"
        >
          <div className="space-y-4">
            {/* Employee + Review Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <SearchableEmployeeSelect
                  value={formData.employeeIds?.[0] || ''}
                  onChange={(id) => handleEmployeeSelect(id)}
                  employees={employeeDropdownList}
                />
              </div>

              <Input
                label="Department"
                name="department"
                type="text"
                value={formData.department || ''}
                readOnly
                placeholder="Auto-filled department"
                inputClassName="h-10 rounded-lg border-slate-300 bg-slate-50 text-slate-500 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-medium text-slate-800"
              />

              <Input
                label="Manager"
                name="managerName"
                type="text"
                value={formData.managerName}
                readOnly
                placeholder="Auto-filled manager"
                inputClassName="h-10 rounded-lg border-slate-300 bg-slate-50 text-slate-500 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-medium text-slate-800"
              />

              <Input
                label="Performance Cycle"
                name="reviewPeriod"
                type="select"
                value={formData.reviewPeriod}
                onChange={handleFormChange}
                required
                placeholder="Select review cycle"
                options={cycleDropdownList.map(cycle => ({
                  label: cycle.cycleName,
                  value: cycle.id
                }))}
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20 "
                labelClassName="mb-1 block text-sm font-medium text-slate-800"
              />
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <Input
                label="Status"
                name="status"
                type="select"
                value={formData.status}
                onChange={handleFormChange}
                required
                options={[
                  { label: 'Completed', value: 'Completed' },
                  { label: 'Pending', value: 'Pending' }
                ]}
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-medium text-slate-800"
              />
            </div>

            {/* Dynamic Ratings */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs font-medium text-slate-500 mb-4 font-bold uppercase tracking-wider">Competency Ratings — rate each area (1 to 5 stars)</p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {compDropdownList.map((comp) => {
                  const ratingObj = formData.competencyRatings?.find(r => r.competency === comp.id) || { rating: 0 }
                  return (
                    <StarRating
                      key={comp.id}
                      label={comp.competencyName}
                      value={ratingObj.rating}
                      onChange={(starValue) => {
                        const currentRatings = [...(formData.competencyRatings || [])]
                        const index = currentRatings.findIndex(r => r.competency === comp.id)
                        if (index > -1) {
                          currentRatings[index].rating = starValue
                        } else {
                          currentRatings.push({ competency: comp.id, rating: starValue })
                        }

                        const total = currentRatings.reduce((sum, r) => sum + r.rating, 0)
                        const avg = currentRatings.length > 0 ? Math.round((total / currentRatings.length) * 10) / 10 : 0

                        setFormData(prev => ({
                          ...prev,
                          competencyRatings: currentRatings,
                          overallRating: avg
                        }))
                      }}
                    />
                  )
                })}
                {compDropdownList.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-slate-400 italic text-xs">
                    No competencies configured. Add competencies in the Competency Registry tab first.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Calculated Overall Rating:</span>
                <span className="text-lg font-black text-[#0F766E]">{formData.overallRating || 0} / 5.0</span>
              </div>
            </div>

            {/* Feedback */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Key Contributions
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleFormChange}
                  placeholder="Describe employee strengths and achievements"
                  className="min-h-[120px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Growth Objectives
                </label>
                <textarea
                  name="goalsNextPeriod"
                  value={formData.goalsNextPeriod}
                  onChange={handleFormChange}
                  placeholder="Define goals and KPIs for the next review cycle"
                  className="min-h-[120px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  placeholder="Any additional remarks"
                  className="min-h-[80px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>

              <div>
                <Input
                  label="Assessment Date"
                  name="assessmentDate"
                  type="date"
                  value={formData.assessmentDate}
                  onChange={handleFormChange}
                  required
                  inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-1 block text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Goal & KPI Section */}
            <div className="rounded-lg border border-slate-200 bg-emerald-50/40 p-4">
              <p className="text-xs font-medium text-slate-600 mb-4 font-bold uppercase tracking-wider">Goal & KPI Details — Set performance targets and priorities</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Goal Title"
                  name="goalTitle"
                  type="text"
                  value={formData.goalTitle}
                  onChange={handleFormChange}
                  placeholder="e.g., Improve customer retention rate"
                  inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-1 block text-sm font-medium text-slate-800"
                />

                <Input
                  label="Priority"
                  name="priority"
                  type="select"
                  value={formData.priority}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Low', value: 'Low' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'High', value: 'High' },
                    { label: 'Critical', value: 'Critical' }
                  ]}
                  inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  labelClassName="mb-1 block text-sm font-medium text-slate-800"
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-800">
                    KPI Target
                  </label>
                  <textarea
                    name="kpiTarget"
                    value={formData.kpiTarget}
                    onChange={handleFormChange}
                    placeholder="Define measurable KPI targets (e.g., Increase sales by 15%, Response time under 2 hours)"
                    className="min-h-[100px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-800">
                    Goal Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleFormChange}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              Create Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* Cycle Config Modal */}
      <Modal
        isOpen={configModalOpen}
        onClose={handleCloseConfigModal}
        title={editingCycleId ? "Edit Performance Cycle" : "Create Performance Cycle"}
        size="lg"
        className="rounded-none"
      >
        <form onSubmit={editingCycleId ? handleUpdateCycle : handleCreateCycle} className="pt-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Cycle Name</label>
              <input
                type="text"
                name="cycleName"
                required
                value={configData.cycleName}
                onChange={handleConfigChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                placeholder="e.g. Q3 2026 Performance Review"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={configData.startDate}
                  onChange={handleConfigChange}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={configData.endDate}
                  onChange={handleConfigChange}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Submission Deadline</label>
              <input
                type="date"
                name="submissionDeadline"
                required
                value={configData.submissionDeadline}
                onChange={handleConfigChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 py-3 border-y border-slate-100">
              <Toggle
                checked={configData.automatedReminder}
                onChange={(v) => setConfigData(p => ({ ...p, automatedReminder: v }))}
              />
              <span className="text-sm font-medium text-slate-700">Enable automated reminder notifications</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseConfigModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              {editingCycleId ? 'Update Cycle' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Competency Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={compModalOpen}
        onClose={closeCompModal}
        size="sm"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">{editingCompId ? 'Edit Competency' : 'Add Competency'}</h2>
            <p className="text-xs font-medium text-slate-500">{editingCompId ? 'Update the competency name.' : 'Enter a new competency to add to the registry.'}</p>
          </div>
        }
      >
        <form onSubmit={handleSaveCompetency} className="pt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">Competency Name</label>
            <input
              type="text"
              autoFocus
              required
              value={compForm.competencyName}
              onChange={(e) => setCompForm({ competencyName: e.target.value })}
              placeholder="e.g. Problem Solving"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20"
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeCompModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              {editingCompId ? 'Save Changes' : 'Add Competency'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Assessment Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setViewingAssessment(null) }}
        size="2xl"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Assessment Details</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Review employee performance and progress updates
            </p>
          </div>
        }
      >
        {viewingAssessment && (
          <div className="pt-2 pb-6 space-y-6">

            {/* 1. Assessment Information */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <HiIdentification className="h-4 w-4 text-slate-400" />
                  Assessment Information
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Employee Name</div>
                  <div className="text-sm font-bold text-slate-900">{viewingAssessment.employee?.fullName || viewingAssessment.employee?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</div>
                  <div className="text-sm font-bold text-slate-900">{viewingAssessment.employee?.department?.name || viewingAssessment.employee?.department || viewingAssessment.department?.name || viewingAssessment.department || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Performance Cycle</div>
                  <div className="text-sm font-bold text-slate-900">{viewingAssessment.performanceCycle?.name || viewingAssessment.performanceCycle?.cycleName || (typeof viewingAssessment.performanceCycle === 'string' ? viewingAssessment.performanceCycle : 'N/A')}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Admin Status</div>
                  <div className="text-sm font-bold text-slate-900">
                    <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${viewingAssessment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {viewingAssessment.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Created Date</div>
                  <div className="text-sm font-bold text-slate-900">
                    {viewingAssessment.assessmentDate ? new Date(viewingAssessment.assessmentDate).toLocaleDateString() : (viewingAssessment.createdAt ? new Date(viewingAssessment.createdAt).toLocaleDateString() : 'N/A')}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Competency Ratings */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <HiStar className="h-4 w-4 text-slate-400" />
                  Competency Ratings
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {(viewingAssessment.competencyRatings || []).length > 0 ? (
                  viewingAssessment.competencyRatings.map((cr, idx) => {
                    const competencyLabel =
                      cr.competency?.competencyName ||
                      cr.competency?.name ||
                      cr.competencyName ||
                      'Unknown'

                    return (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 truncate"
                          title={competencyLabel}
                        >
                          {competencyLabel}
                        </div>

                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <HiStar
                              key={star}
                              className={`h-4 w-4 ${star <= (Number(cr.rating) || 0)
                                ? 'text-amber-400'
                                : 'text-slate-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })

                ) : (
                  <div className="col-span-full text-xs text-slate-400 italic">No competencies rated.</div>
                )}
              </div>
            </div>

            {/* 3. Admin Feedback */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <HiPencilSquare className="h-4 w-4 text-slate-400" />
                  Admin Feedback
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key Contributions</div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg min-h-[80px] border border-slate-100">
                    {viewingAssessment.keyContributions || viewingAssessment.strengths || <span className="text-slate-400 italic">No feedback provided.</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Growth Objectives</div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg min-h-[80px] border border-slate-100">
                    {viewingAssessment.growthObjectives || viewingAssessment.goalsNextPeriod || <span className="text-slate-400 italic">No objectives provided.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Goal & KPI Details */}
            {(viewingAssessment.goalTitle || viewingAssessment.kpiTarget || viewingAssessment.dueDate || viewingAssessment.priority) && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm overflow-hidden">
                <div className="bg-blue-50/60 px-4 py-3 border-b border-blue-200">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-2">
                    <HiBriefcase className="h-4 w-4" />
                    Goal & KPI Details
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Goal Title</div>
                    <div className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-blue-100">
                      {viewingAssessment.goalTitle || <span className="text-slate-400 italic">No goal title provided.</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Priority</div>
                    <div className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-blue-100">
                      {viewingAssessment.priority ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${viewingAssessment.priority === 'High' ? 'bg-red-100 text-red-800' :
                          viewingAssessment.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {viewingAssessment.priority}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No priority set.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">KPI Target</div>
                    <div className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-blue-100">
                      {viewingAssessment.kpiTarget || <span className="text-slate-400 italic">No KPI target provided.</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Goal Due Date</div>
                    <div className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-blue-100">
                      {viewingAssessment.dueDate ? new Date(viewingAssessment.dueDate).toLocaleDateString() : <span className="text-slate-400 italic">No due date set.</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Employee Progress Update (Highlighted) */}
            <div className="rounded-xl border-2 border-[#0F766E] bg-emerald-50/30 shadow-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F766E]" />
              <div className="bg-[#0F766E]/5 px-4 py-3 border-b border-[#0F766E]/10 flex justify-between items-center ml-1.5">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0F766E] flex items-center gap-2">
                  <HiChartBar className="h-4 w-4" />
                  Employee Progress Update
                </h3>
                {viewingAssessment.employeeUpdatedAt && (
                  <span className="text-[10px] font-bold text-slate-500">
                    Last Updated: {new Date(viewingAssessment.employeeUpdatedAt).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="p-5 ml-1.5 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Status & Progress Bar */}
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Employee Status</div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm border
                      ${viewingAssessment.employeeStatus === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        viewingAssessment.employeeStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          viewingAssessment.employeeStatus === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            viewingAssessment.employeeStatus === 'On Hold' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      <span className={`h-2 w-2 rounded-full ${viewingAssessment.employeeStatus === 'Approved' ? 'bg-green-500' : viewingAssessment.employeeStatus === 'Completed' ? 'bg-emerald-500' : viewingAssessment.employeeStatus === 'In Progress' ? 'bg-blue-500' : viewingAssessment.employeeStatus === 'On Hold' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                      {viewingAssessment.employeeStatus || 'Not Started'}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Progress Percentage</div>

                    {(() => {
                      const rawProgress = viewingAssessment.employeeProgress || '0'
                      const match = rawProgress.match(/\d+/)
                      const numericProgress = match ? parseInt(match[0], 10) : 0
                      const percentage = Math.min(100, Math.max(0, numericProgress))
                      let barColor = '#3B82F6'
                      if (percentage >= 100) barColor = '#10B981'
                      else if (percentage <= 0) barColor = '#CBD5E1'
                      const displayLabel = rawProgress === '0' ? '0%' : (rawProgress.includes('%') ? rawProgress : `${rawProgress}%`)

                      return (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-slate-900 leading-none">{displayLabel}</span>
                          </div>
                          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full transition-all duration-500 ease-out rounded-full"
                              style={{ width: `${percentage}%`, backgroundColor: barColor }}
                            />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Comments & Notes */}
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Employee Comments</div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg min-h-[80px] border border-slate-200 shadow-sm">
                      {viewingAssessment.employeeComments || <span className="text-slate-400 italic">No comments provided.</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Completion Notes</div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg min-h-[80px] border border-slate-200 shadow-sm">
                      {viewingAssessment.completionNotes || <span className="text-slate-400 italic">No notes provided.</span>}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-between bg-slate-50 rounded-b-xl">
          <div>
            {viewingAssessment?.approvedBy && (
              <span className="text-xs text-slate-500">
                ✓ Approved on {new Date(viewingAssessment.approvedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {!viewingAssessment?.approvedBy ? (
              <button
                type="button"
                onClick={handleApproveAssessment}
                disabled={approvalLoading}
                className="h-10 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-6 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {approvalLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Approving...
                  </>
                ) : (
                  <>
                    ✓ Approve & Save
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-10 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-6 text-sm font-semibold text-white cursor-not-allowed opacity-75 shadow-sm"
              >
                ✓ Approved
              </button>
            )}
            <button
              type="button"
              onClick={() => { setViewModalOpen(false); setViewingAssessment(null) }}
              className="h-10 rounded-md bg-slate-800 px-6 text-sm font-semibold text-white hover:bg-slate-900 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Export Performance Data Modal ───────────────────────────────── */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => {
          setExportModalOpen(false)
          setExportFilters({
            cycleId: '',
            startDate: '',
            endDate: '',
            departmentId: '',
            employeeId: '',
            exportType: 'pdf'
          })
        }}
        size="md"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Export Performance Data</h2>
            <p className="text-xs font-medium text-slate-500">Filter and export employee performance data in CSV or PDF format.</p>
          </div>
        }
      >
        <div className="pt-2 space-y-4">
          {/* Employee Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={exportFilters.employeeId}
              onChange={(e) => {
                const empId = e.target.value;
                const emp = employeeDropdownList.find(x => String(x.id) === String(empId));
                setExportFilters(prev => ({
                  ...prev,
                  employeeId: empId,
                  departmentId: emp ? (emp.department_id || emp.departmentId || '') : ''
                }));
              }}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20"
            >
              <option value="">-- Select Employee --</option>
              {employeeDropdownList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name || emp.fullName || emp.name} ({emp.emp_id || emp.empId})</option>
              ))}
            </select>
          </div>

          {/* Performance Cycle Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">Select Performance Cycle</label>
            <select
              value={exportFilters.cycleId}
              onChange={(e) => setExportFilters(prev => ({
                ...prev,
                cycleId: e.target.value,
                startDate: '',
                endDate: ''
              }))}
              disabled={exportFilters.startDate !== '' || exportFilters.endDate !== ''}
              className={`h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 ${(exportFilters.startDate !== '' || exportFilters.endDate !== '') ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
            >
              <option value="">-- Select Cycle --</option>
              {exportCyclesLoading ? (
                <option disabled>Loading cycles...</option>
              ) : (
                exportCycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>{cycle.cycleName}</option>
                ))
              )}
            </select>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Start Date</label>
              <input
                type="date"
                value={exportFilters.startDate}
                onChange={(e) => setExportFilters(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  cycleId: ''
                }))}
                disabled={exportFilters.cycleId !== ''}
                className={`h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 ${exportFilters.cycleId !== '' ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">End Date</label>
              <input
                type="date"
                value={exportFilters.endDate}
                onChange={(e) => setExportFilters(prev => ({
                  ...prev,
                  endDate: e.target.value,
                  cycleId: ''
                }))}
                disabled={exportFilters.cycleId !== ''}
                className={`h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 ${exportFilters.cycleId !== '' ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
              />
            </div>
          </div>

          {/* Export Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">Export Type</label>
            <select
              value={exportFilters.exportType}
              onChange={(e) => setExportFilters(prev => ({ ...prev, exportType: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => {
                setExportModalOpen(false)
                setExportFilters({
                  cycleId: '',
                  startDate: '',
                  endDate: '',
                  departmentId: '',
                  employeeId: '',
                  exportType: 'pdf'
                })
              }}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportLoading}
              className="h-10 inline-flex items-center justify-center gap-2 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {exportLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <HiDocumentText className="h-4 w-4" /> Export
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
