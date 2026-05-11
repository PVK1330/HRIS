import api from './api.js'

export const policyService = {
  list: async (filters = {}) => {
    const { data } = await api.get('/policies', { params: filters });
    return data.data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/policies/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/policies', payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/policies/${id}`, payload);
    return data.data;
  },

  remove: async (id) => {
    await api.delete(`/policies/${id}`);
  },

  getTracking: async (id) => {
    const { data } = await api.get(`/policies/${id}/tracking`);
    return data.data;
  },

  acknowledge: async (id) => {
    const { data } = await api.post(`/policies/${id}/acknowledge`);
    return data.data;
  },

  listCategories: async () => {
    const { data } = await api.get('/policies/categories');
    return data.data || [];
  },

  createCategory: async (payload) => {
    const { data } = await api.post('/policies/categories', payload);
    return data.data;
  },

  updateCategory: async (id, payload) => {
    const { data } = await api.patch(`/policies/categories/${id}`, payload);
    return data.data;
  },

  deleteCategory: async (id) => {
    await api.delete(`/policies/categories/${id}`);
  },

  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/policies/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
  }
};
