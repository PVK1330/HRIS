import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/v1/locations`;

const TOKEN_KEYS = ['hris_token', 'elitepic_auth_token', 'token', 'jwt'];

function readToken() {
  if (typeof window === 'undefined') return null;
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function unwrapError(err) {
  const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Request failed';
  const wrapped = new Error(msg);
  wrapped.status = err?.response?.status;
  return Promise.reject(wrapped);
}

const client = axios.create({ baseURL: BASE });

client.interceptors.request.use((config) => {
  const token = readToken();
  if (token) { config.headers = config.headers || {}; config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

client.interceptors.response.use((r) => r, unwrapError);

export async function listLocations(params = {}) {
  const { data } = await client.get('/', { params });
  return data?.data ?? data;
}

export async function getLocation(id) {
  const { data } = await client.get(`/${id}`);
  return data?.data ?? data;
}

export async function createLocation(payload) {
  const { data } = await client.post('/', payload);
  return data?.data ?? data;
}

export async function updateLocation(id, payload) {
  const { data } = await client.put(`/${id}`, payload);
  return data?.data ?? data;
}

export async function deleteLocation(id) {
  await client.delete(`/${id}`);
}
