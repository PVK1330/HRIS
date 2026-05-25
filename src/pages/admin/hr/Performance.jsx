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


const COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#99F6E4', '#F0FDFA']

const initialFormData = {
  employeeIds: [], // array of employee IDs for bulk assignment
  departmentId: '', // auto-populated when employee is selected
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

const analyticsData = {
  headcount: [
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 25 },
    { name: 'Sales', value: 38 },
    { name: 'HR', value: 12 },
    { name: 'Finance', value: 18 },
  ],
  attendance: [
    { day: 'Mon', rate: 94 },
    { day: 'Tue', rate: 96 },
    { day: 'Wed', rate: 92 },
    { day: 'Thu', rate: 95 },
    { day: 'Fri', rate: 91 },
  ],
  attrition: [
    { month: 'Jan', rate: 1.2 },
    { month: 'Feb', rate: 1.5 },
    { month: 'Mar', rate: 1.1 },
    { month: 'Apr', rate: 0.8 },
    { month: 'May', rate: 0.5 },
  ],
  performanceDist: [
    { name: 'Exceeds', count: 25 },
    { name: 'Meets', count: 45 },
    { name: 'Developing', count: 15 },
    { name: 'Unsatisfactory', count: 5 },
  ]
}

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
  const [compModalOpen, setCompModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [configData, setConfigData] = useState(initialConfigData)
  const [files, setFiles] = useState({})
  const [competencies, setCompetencies] = useState([])
  const [compForm, setCompForm] = useState({ competencyName: '' })
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
    pendingReviews: 0,
    completedReviews: 0
  })
  const [assessmentsLoading, setAssessmentsLoading] = useState(false)
  const [editingAssessmentId, setEditingAssessmentId] = useState(null)

  // Dropdown lists
  const [compDropdownList, setCompDropdownList] = useState([])
  const [cycleDropdownList, setCycleDropdownList] = useState([])
  const [employeeDropdownList, setEmployeeDropdownList] = useState([])

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

  // Fetch competencies when search query changes
  useEffect(() => {
    if (isHR) {
      fetchCompetencies(compSearch)
    }
  }, [compSearch, isHR])

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
      priority: assessment.priority || 'Medium'
    })

    setModalOpen(true)
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
   */
  const handleEmployeeSelect = (employeeId) => {
    const selected = employeeDropdownList.find(e => String(e.id) === String(employeeId))
    if (selected) {
      const mId = selected.manager_id || selected.managerId || ''
      const manager = mId ? employeeDropdownList.find(e => String(e.id) === String(mId)) : null;
      setFormData(prev => ({
        ...prev,
        employeeIds: [employeeId],
        departmentId: selected.department_id || selected.departmentId || '',
        managerId: mId,
        reviewerName: manager ? (manager.full_name || manager.name) : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        employeeIds: [employeeId],
        departmentId: '',
        managerId: '',
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

  const handleAddCompetency = async (e) => {
    e.preventDefault()
    if (!compForm.competencyName.trim()) return
    try {
      const response = await competenciesAPI.createCompetency({
        competencyName: compForm.competencyName.trim()
      })
      if (response.success) {
        setCompForm({ competencyName: '' })
        setCompModalOpen(false)
        await fetchCompetencies(compSearch)
        await fetchCompsSummary()
        await fetchDropdownData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add competency')
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
          {row.performanceCycle?.cycleName || 'N/A'}
        </span>
      )
    },
    {
      key: 'overallRating',
      label: 'Performance Rating',
      render: (_, row) => {
        const rating = row.overallRating || 0
        const ratingNum = Number(rating)
        const percentage = (ratingNum / 5) * 100
        const barColor = getProgressBarColor(rating)
        const label = getRatingLabel(rating)
        
        return (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="relative h-5 w-full overflow-hidden rounded-full bg-slate-200 shadow-md border border-slate-300">
                  <div
                    className="h-full transition-all duration-500 ease-out shadow-lg rounded-full"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 12px ${barColor}, inset 0 0 4px ${barColor}`
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 w-12 text-right tabular-nums">{ratingNum.toFixed(1)}/5</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const isCompleted = row.status === 'Completed'
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {row.status}
            </span>
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleEditAssessment(row)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56] shadow-sm"
            aria-label="Edit assessment"
            title="Edit"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteAssessment(row.id)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 shadow-sm"
            aria-label="Delete assessment"
            title="Delete"
          >
            <HiTrash className="h-4 w-4" />
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
        {/* {isHR && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfigModalOpen(true)}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Competency Ratings
            </button>
            <button
              onClick={() => setConfigModalOpen(true)}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Performance Cycle
            </button>
            <button
              onClick={openAddReview}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Add Assessment
            </button>
          </div>
        )} */}
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
                    onClick={() => { setCompForm({ competencyName: '' }); setCompModalOpen(true) }}
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
                            <span className="text-sm font-semibold text-slate-900">{comp.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-500">{comp.createdAt}</span>
                        </td>
                        {isHR && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center">
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
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <HiUserGroup className="h-4 w-4 text-[#0F766E]" /> Headcount Distribution
                  </h3>
                  <div className="h-2 w-8 bg-slate-100" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.headcount}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900, textAnchor: 'middle' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                        {analyticsData.headcount.map((entry, index) => (
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
                        data={analyticsData.performanceDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={0}
                        dataKey="count"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {analyticsData.performanceDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 border-t border-slate-50 pt-6">
                  {analyticsData.performanceDist.map((d, i) => (
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
                  <HiClock className="h-4 w-4 text-[#0F766E]" /> Attendance Velocity
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.attendance}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900' }} />
                      <Area type="monotone" dataKey="rate" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4 text-red-600">
                  <HiArrowTrendingUp className="h-4 w-4" /> Systemic Attrition Risk
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.attrition}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} />
                      <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: '900' }} />
                      <Line type="step" dataKey="rate" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                <HiClipboardDocumentCheck className="h-4 w-4 text-[#0F766E]" /> Compliance Quota Report
              </h3>
              <div className="grid gap-6 md:grid-cols-4">
                {[
                  { label: 'Visa Authentication', value: 95, color: 'bg-emerald-500' },
                  { label: 'Insurance Verification', value: 82, color: 'bg-amber-500' },
                  { label: 'Contract Integrity', value: 100, color: 'bg-[#0F766E]' },
                  { label: 'KYC Documentation', value: 98, color: 'bg-teal-500' }
                ].map((item, i) => (
                  <div key={i} className="rounded-none border border-slate-100 p-5 bg-slate-50/30">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{item.label}</div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">{item.value}%</div>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                value={(() => {
                  const empId = formData.employeeIds?.[0]
                  if (!empId) return ''
                  const emp = employeeDropdownList.find(e => String(e.id) === String(empId))
                  return emp?.department || 'N/A'
                })()}
                readOnly
                placeholder="Auto-filled department"
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
        onClose={() => { setCompModalOpen(false); setCompForm({ competencyName: '' }) }}
        size="sm"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add Competency</h2>
            <p className="text-xs font-medium text-slate-500">Enter a new competency to add to the registry.</p>
          </div>
        }
      >
        <form onSubmit={handleAddCompetency} className="pt-2">
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
              onClick={() => { setCompModalOpen(false); setCompForm({ competencyName: '' }) }}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors"
            >
              Add Competency
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
