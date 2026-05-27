import { fetchAdminDashboard, fetchEmployeeDashboard, fetchAnnouncements } from './dashboardService.js'

/** @deprecated Prefer dashboardService.fetchAdminDashboard */
export const adminDashboardService = {
  getDashboardData: fetchAdminDashboard,
  fetchEmployeeDashboard,
  fetchAnnouncements,
}

export { fetchAdminDashboard, fetchEmployeeDashboard, fetchAnnouncements }
