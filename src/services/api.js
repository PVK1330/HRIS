import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hris_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
