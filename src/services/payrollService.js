import api from './api';

const payrollService = {
  // Salary Registry
  getSalaries: async (filters = {}) => {
    const response = await api.get('/admin/payroll/salaries', { params: filters });
    return response.data.data;
  },
  
  saveSalary: async (data) => {
    const response = await api.post('/admin/payroll/salaries', data);
    return response.data.data;
  },

  // Payroll Items (Additions, OT, Deductions)
  getPayrollItems: async (type) => {
    const response = await api.get('/admin/payroll/items', { params: { type } });
    return response.data.data;
  },

  createPayrollItem: async (data) => {
    const response = await api.post('/admin/payroll/items', data);
    return response.data.data;
  }
};

export default payrollService;
