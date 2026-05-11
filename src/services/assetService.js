import api from './api';

export const assetService = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data.data;
  },

  getAsset: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },

  createAsset: async (data) => {
    const response = await api.post('/assets', data);
    return response.data.data;
  },

  updateAsset: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data.data;
  },

  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data.data;
  }
};

export default assetService;
