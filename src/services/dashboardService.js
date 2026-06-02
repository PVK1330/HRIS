import api from './api.js'
import { getEmployeeStats, listEmployees } from './employeeService.js'
import { listAttendance } from './attendanceService.js'
import { listLeave } from './leaveService.js'
import { getExpenseStats } from './expenseService.js'
import { getVisaRecordStats, listVisaRecords } from './visaRecordService.js'
import { getExitRecordStats, listExitRecords } from './exitManagementService.js'
import { getLeave as getEmployeeLeave, getAttendance as getEmployeeAttendance } from './employeeProfileService.js'
import { listExpenses } from './expenseService.js'
import { getUnreadCount, listConversations } from './messagesService.js'

const todayIso = () => new Date().toISOString().split('T')[0]

async function safe(fn, fallback = null) {
  try {
    return await fn()
  } catch (err) {
    console.warn('[dashboard]', err?.response?.data?.message || err?.message || err)
    return fallback
  }
}

function monthDayKey(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getMonth()}-${d.getDate()}`
}

function formatShortDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return String(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function buildCelebrations(employees = []) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const todayKey = `${today.getMonth()}-${today.getDate()}`
  const tomorrowKey = `${tomorrow.getMonth()}-${tomorrow.getDate()}`
  const events = []

  for (const e of employees) {
    const name = e.full_name || e.name || 'Employee'
    const dept = e.department || '—'
    const dobKey = monthDayKey(e.date_of_birth)
    const joinKey = monthDayKey(e.join_date)

    if (dobKey === todayKey) {
      events.push({ name, type: 'Birthday', icon: '🎂', date: 'Today', dept })
    } else if (dobKey === tomorrowKey) {
      events.push({ name, type: 'Birthday', icon: '🎂', date: 'Tomorrow', dept })
    }

    if (joinKey === todayKey && e.join_date) {
      const joinYear = new Date(e.join_date).getFullYear()
      if (joinYear < today.getFullYear()) {
        events.push({ name, type: 'Anniversary', icon: '🎉', date: 'Today', dept })
      }
    }
  }

  return events.slice(0, 6)
}

function buildHeadcountTrend(employees = [], currentTotal = 0) {
  const now = new Date()
  const months = []

  for (let i = 5; i >= 0; i -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59)
    const label = monthStart.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    let headcount = employees.filter((e) => {
      if (!e.join_date) return false
      const join = new Date(e.join_date)
      return !Number.isNaN(join.getTime()) && join <= monthEnd
    }).length

    if (i === 0 && currentTotal > headcount) headcount = currentTotal

    months.push({ name: label, headcount })
  }

  return months
}

function mapJoiners(employees = []) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return employees
    .filter((e) => {
      if (!e.join_date) return false
      const join = new Date(e.join_date)
      return !Number.isNaN(join.getTime()) && join >= monthStart
    })
    .slice(0, 5)
    .map((e) => ({
      name: e.full_name || e.name || '—',
      dept: e.department || '—',
      date: formatShortDate(e.join_date),
    }))
}

function mapExits(records = []) {
  return records.slice(0, 5).map((r) => ({
    name: r.full_name || r.employee_name || '—',
    dept: r.department || r.job_title || '—',
    date: formatShortDate(r.last_working_day || r.resignation_date),
  }))
}

function buildComplianceAlerts(visaStats, visaRecords = []) {
  const expiring = visaRecords.filter((r) => {
    const expiry = r.visa_expiry_date || r.passport_expiry_date
    if (!expiry) return false
    const d = new Date(expiry)
    const diff = (d - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 60
  })

  const passportItems = expiring
    .filter((r) => r.passport_expiry_date)
    .slice(0, 3)
    .map((r) => r.full_name || r.employee_name || 'Employee')

  const visaItems = expiring
    .filter((r) => r.visa_expiry_date)
    .slice(0, 3)
    .map((r) => r.full_name || r.employee_name || 'Employee')

  return [
    {
      name: 'PASSPORT_EXPIRY',
      count: passportItems.length || visaStats?.expiringSoon || 0,
      items: passportItems.length ? passportItems : ['No records in next 60 days'],
      color: 'rose',
    },
    {
      name: 'VISA_EXPIRY',
      count: visaItems.length || visaStats?.expiringSoon || 0,
      items: visaItems.length ? visaItems : ['No records in next 60 days'],
      color: 'amber',
    },
  ]
}

/**
 * Admin / HR dashboard payload
 */
export async function fetchAdminDashboard() {
  const today = todayIso()
  const year = new Date().getFullYear()

  const [
    employeeStats,
    attendance,
    leaveData,
    expenseStats,
    visaStats,
    visaExpiring,
    exitStats,
    exitList,
    employeePage,
    announcementsRes,
    notificationsRes,
    unreadMessages,
    conversations,
  ] = await Promise.all([
    safe(() => getEmployeeStats(), {}),
    safe(() => listAttendance({ date: today, limit: 1, page: 1 }), {}),
    safe(() => listLeave({ status: 'Pending', limit: 1, page: 1, year }), {}),
    safe(() => getExpenseStats(), {}),
    safe(() => getVisaRecordStats(), {}),
    safe(() => listVisaRecords({ expiryWindow: '60', limit: 10, page: 1, sortBy: 'visa_expiry_date', sortOrder: 'asc' }), {}),
    safe(() => getExitRecordStats(), {}),
    safe(() => listExitRecords({ limit: 5, page: 1, sortBy: 'last_working_day', sortOrder: 'asc' }), {}),
    safe(() => listEmployees({ limit: 500, page: 1, status: 'all', sortBy: 'join_date', sortOrder: 'desc' }), {}),
    safe(() => api.get('/admin/announcements'), null),
    safe(() => api.get('/notifications'), null),
    safe(() => getUnreadCount(), 0),
    safe(() => listConversations(), []),
  ])

  const employees = employeePage?.records || employeePage?.employees || []
  const summary = attendance?.summary || {}
  const total = employeeStats?.total ?? 0

  const announcements = (announcementsRes?.data?.data || [])
    .filter((a) => a.status === 'Published' && (!a.dispatch_channels || a.dispatch_channels === 'In App' || a.dispatch_channels === 'Both'))
    .slice(0, 4)
  const notifications = Array.isArray(notificationsRes?.data)
    ? notificationsRes.data
    : Array.isArray(notificationsRes?.data?.notifications)
      ? notificationsRes.data.notifications
      : Array.isArray(notificationsRes?.data?.data?.notifications)
        ? notificationsRes.data.data.notifications
        : Array.isArray(notificationsRes?.data?.data)
          ? notificationsRes.data.data
          : []
  const messageThreads = Array.isArray(conversations) ? conversations : []

  return {
    employees: {
      total: employeeStats?.total ?? 0,
      active: employeeStats?.active ?? 0,
      probation: employeeStats?.probation ?? 0,
      notice: employeeStats?.notice ?? 0,
      onLeave: employeeStats?.onLeave ?? 0,
      newThisMonth: employeeStats?.newThisMonth ?? 0,
    },
    attendance: {
      present: summary.in_office ?? summary.present ?? 0,
      remote: summary.remote ?? 0,
      onLeave: summary.on_leave ?? 0,
      absent: summary.absent ?? 0,
    },
    pending: {
      leaves: leaveData?.stats?.pending ?? 0,
      documents: summary.pending_regularization ?? 0,
      expenses: expenseStats?.pending ?? expenseStats?.Pending ?? 0,
    },
    growthData: buildHeadcountTrend(employees, total),
    celebrations: buildCelebrations(employees),
    expiryAlerts: buildComplianceAlerts(visaStats, visaExpiring?.records || []),
    joinersExits: {
      newJoiners: mapJoiners(employees),
      exits: mapExits(exitList?.records || []),
    },
    exitStats,
    announcements,
    notifications: notifications.slice(0, 6),
    notificationsUnread: notifications.filter((n) => !(n?.isRead ?? n?.read ?? n?.is_read)).length,
    unreadMessages: Number(unreadMessages) || 0,
    recentConversations: messageThreads.slice(0, 6),
  }
}

/**
 * Employee self-service dashboard payload
 */
export async function fetchEmployeeDashboard(employeeId) {
  const today = todayIso()
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  const [leaveData, attendanceData, expensePage, announcementsRes, notificationsRes, unreadMessages, conversations] = await Promise.all([
    safe(() => getEmployeeLeave(employeeId, { year }), {}),
    safe(() => getEmployeeAttendance(employeeId, { year, month }), {}),
    safe(() => listExpenses({ status: 'Pending', limit: 1, page: 1 }), { rows: [], total: 0 }),
    safe(() => api.get('/admin/announcements'), null),
    safe(() => api.get('/notifications'), null),
    safe(() => getUnreadCount(), 0),
    safe(() => listConversations(), []),
  ])

  const balances = leaveData?.balances || []
  const leaveBalance = balances.reduce((sum, b) => sum + (Number(b.remaining) || 0), 0)
  const summary = attendanceData?.summary || {}
  const totalDays = (summary.present ?? 0) + (summary.absent ?? 0) + (summary.late ?? 0) + (summary.on_leave ?? 0)
  const attendanceRate = totalDays > 0
    ? `${Math.round(((summary.present ?? 0) / totalDays) * 100)}%`
    : '—'

  const announcements = (announcementsRes?.data?.data || [])
    .filter((a) => a.status === 'Published')
    .slice(0, 4)
  const notifications = Array.isArray(notificationsRes?.data)
    ? notificationsRes.data
    : Array.isArray(notificationsRes?.data?.notifications)
      ? notificationsRes.data.notifications
      : Array.isArray(notificationsRes?.data?.data?.notifications)
        ? notificationsRes.data.data.notifications
        : Array.isArray(notificationsRes?.data?.data)
          ? notificationsRes.data.data
          : []

  return {
    personal: {
      leaveBalance,
      attendanceRate,
      pendingTasks: expensePage?.total ?? 0,
    },
    announcements,
    notifications: notifications.slice(0, 6),
    notificationsUnread: notifications.filter((n) => !(n?.isRead ?? n?.read ?? n?.is_read)).length,
    unreadMessages: Number(unreadMessages) || 0,
    recentConversations: (Array.isArray(conversations) ? conversations : []).slice(0, 6),
  }
}

export async function fetchAnnouncements() {
  const res = await safe(() => api.get('/admin/announcements'), null)
  return (res?.data?.data || [])
    .filter((a) => a.status === 'Published' && (!a.dispatch_channels || a.dispatch_channels === 'In App' || a.dispatch_channels === 'Both'))
    .slice(0, 4)
}
