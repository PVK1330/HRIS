import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiBuildingOffice,
  HiUserGroup,
  HiUser,
  HiMagnifyingGlass,
  HiArrowPath,
  HiCheckBadge,
  HiExclamationTriangle,
  HiClock,
} from 'react-icons/hi2'
import { Avatar } from "../../components/ui/Avatar.jsx"
import { Badge } from '../../components/ui/Badge.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { getManagerDepartment, getManagerEmployees } from '../../services/managerDashboardService'

const statusColor = (status) => {
  if (status === 'Active') return 'green'
  if (status === 'Probation') return 'blue'
  if (status === 'Notice Period') return 'orange'
  if (status === 'On Leave') return 'yellow'
  return 'gray'
}

export default function ManagerDashboard() {
  const [department, setDepartment] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const fetchManagerData = async () => {
    setLoading(true)
    try {
      const [deptData, empData] = await Promise.all([
        getManagerDepartment(),
        getManagerEmployees({
          page,
          limit: 10,
          search: debouncedSearch,
        }),
      ])

      setDepartment(deptData)
      setEmployees(empData?.employees || empData?.records || [])
      setTotalEmployees(empData?.total || empData?.pagination?.total || 0)
    } catch (err) {
      console.error('Error fetching manager data:', err)
      toast.error('Failed to load department and employee data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManagerData()
  }, [page, debouncedSearch])

  const mapEmployee = (e) => ({
    id: e.id,
    empId: e.emp_id,
    name: e.full_name,
    email: e.work_email,
    jobTitle: e.job_title,
    department: e.department,
    departmentId: e.department_id,
    status: e.employment_status || 'Active',
    joinDate: e.join_date,
    manager: e.manager_name || 'N/A',
    profileImageUrl: e.profile_image_url || '',
  })

  const activeCount = employees.filter(e => e.employment_status === 'Active').length
  const probationCount = employees.filter(e => e.employment_status === 'Probation').length

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} size="sm" src={row.profileImageUrl} />
          <div>
            <div className="text-sm font-semibold text-slate-900">{v}</div>
            <div className="text-xs font-medium text-slate-500">{row.empId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge color={statusColor(v)}>
          {v}
        </Badge>
      ),
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      render: (v) => (
        <span className="text-sm font-medium text-slate-600">
          {v ? new Date(v).toLocaleDateString('en-GB') : '—'}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <HiArrowPath className="h-10 w-10 animate-spin text-[#0F766E]" />
          <p className="text-xs font-bold text-slate-500">Loading department data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Department Hero Card */}
      {department ? (
        <div className="border border-slate-200 bg-gradient-to-r from-[#0F766E]/5 to-emerald-50 p-8 shadow-sm">
          <div className="flex items-start justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none bg-[#0F766E] text-white">
                <HiBuildingOffice className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Your Department</p>
                <h2 className="text-3xl font-black text-slate-900 mb-2">{department.name}</h2>
                <p className="text-sm font-medium text-slate-600 mb-3">{department.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-[#0F766E]">
                    <HiUserGroup className="h-4 w-4" />
                    <span>{department.employeeCount} Employees</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <span className="text-slate-600">Code: {department.code}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-amber-200 bg-amber-50/50 p-8 text-center">
          <HiExclamationTriangle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-amber-900">No department assigned yet</p>
          <p className="text-xs text-amber-700 mt-1">Contact your HR administrator to assign a department</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          count={totalEmployees}
          bgColor="bg-slate-900"
          icon={HiUserGroup}
          trend={{ value: '+2', direction: 'up' }}
        />
        <StatCard
          label="Active"
          count={activeCount}
          bgColor="bg-emerald-600"
          icon={HiCheckBadge}
          subtext={`${activeCount}/${totalEmployees}`}
        />
        <StatCard
          label="On Probation"
          count={probationCount}
          bgColor="bg-blue-600"
          icon={HiClock}
          subtext={`${probationCount}/${totalEmployees}`}
        />
        <StatCard
          label="Team Health"
          count={totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0}
          bgColor="bg-[#0F766E]"
          icon={HiCheckBadge}
          subtext="% active"
        />
      </div>

      {/* Department Employees List */}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-tight text-slate-900">Department Employees</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              View all employees assigned to your department
            </p>
          </div>
          <button
            onClick={fetchManagerData}
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiArrowPath className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or employee ID..."
            className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
          />
        </div>

        {/* Employees Table */}
        {employees.length > 0 ? (
          <Table
            columns={columns}
            data={employees.map(mapEmployee)}
            pageSize={10}
            loading={loading}
            square
            totalCount={totalEmployees}
            currentPage={page - 1}
            onPageChange={(idx) => setPage(idx + 1)}
          />
        ) : (
          <div className="border border-slate-200 rounded-none bg-slate-50 p-12 text-center">
            <HiUser className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No employees found</p>
            <p className="text-xs text-slate-500 mt-1">
              {search ? 'Try adjusting your search filters' : 'No employees assigned to this department yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
