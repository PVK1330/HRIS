import api from './api.js';

/**
 * Tenant expense claims — /api/v1/expenses
 * Employees are scoped to their own claims by the API when role is employee.
 */
export async function listExpenses(params = {}) {
  const { data } = await api.get('/expenses', { params });
  return {
    rows: Array.isArray(data.data) ? data.data : [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
    totalPages: data.totalPages ?? 1,
  };
}

export async function getExpenseStats(params = {}) {
  const { data } = await api.get('/expenses/statistics', { params });
  return data.data ?? {};
}

export async function getExpense(id) {
  const { data } = await api.get(`/expenses/${id}`);
  return data.data;
}

/** multipart/form-data */
export async function createExpense(formData) {
  const { data } = await api.post('/expenses', formData);
  return data.data;
}

export async function updateExpense(id, body) {
  const { data } = await api.patch(`/expenses/${id}`, body);
  return data.data;
}

export async function updateExpenseStatus(id, body) {
  const { data } = await api.put(`/expenses/${id}/status`, body);
  return data.data;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}

// Approval level config (EXP-02)
export async function getApprovalLevels() {
  const { data } = await api.get('/expenses/approval-levels');
  return Array.isArray(data.data) ? data.data : [];
}

export async function setApprovalLevels(levels) {
  const { data } = await api.put('/expenses/approval-levels', levels);
  return Array.isArray(data.data) ? data.data : [];
}
