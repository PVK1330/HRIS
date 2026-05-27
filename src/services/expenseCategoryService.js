import api from './api.js';

export async function listExpenseCategories(params = {}) {
  const { data } = await api.get('/expense-categories', { params });
  return Array.isArray(data.data) ? data.data : [];
}

export async function getExpenseCategory(id) {
  const { data } = await api.get(`/expense-categories/${id}`);
  return data.data;
}

export async function createExpenseCategory(body) {
  const { data } = await api.post('/expense-categories', body);
  return data.data;
}

export async function updateExpenseCategory(id, body) {
  const { data } = await api.put(`/expense-categories/${id}`, body);
  return data.data;
}

export async function deleteExpenseCategory(id) {
  await api.delete(`/expense-categories/${id}`);
}
