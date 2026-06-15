import api from './api.js';

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

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Excel export (EXP-10)
export async function exportExpenses(params = {}) {
  const res = await api.get('/expenses/export', { params, responseType: 'blob' });
  triggerBlobDownload(res.data, 'expenses_export.xlsx');
}

// Excel bulk import (EXP-30)
export async function importExpenses(formData) {
  const { data } = await api.post('/expenses/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function downloadImportTemplate() {
  const res = await api.get('/expenses/import/template', { responseType: 'blob' });
  triggerBlobDownload(res.data, 'expense_import_template.xlsx');
}
