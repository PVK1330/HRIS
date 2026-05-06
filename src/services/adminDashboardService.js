import api from './api'

export const adminDashboardService = {
  getDashboardData() {
    return api.get('/admin/dashboard')
  }
}
