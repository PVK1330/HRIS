import axios from 'axios'
import { candidateOnboardingHeaders } from '../utils/candidateOnboardingTenant.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const publicApi = axios.create({
  baseURL: `${API_URL}/api/v1/public/candidate-onboarding`,
})

publicApi.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...candidateOnboardingHeaders() }
  return config
})

export function getCandidateOnboardingState(token) {
  return publicApi.get(`/${encodeURIComponent(token)}`).then((r) => r.data?.data ?? r.data)
}

export function acceptOffer(token) {
  return publicApi.post(`/${encodeURIComponent(token)}/accept`).then((r) => r.data?.data ?? r.data)
}

export function rejectOffer(token, reason) {
  return publicApi
    .post(`/${encodeURIComponent(token)}/reject`, { reason })
    .then((r) => r.data?.data ?? r.data)
}

export function signOffer(token, payload) {
  return publicApi
    .post(`/${encodeURIComponent(token)}/sign`, payload)
    .then((r) => r.data?.data ?? r.data)
}

export function getChecklist(token) {
  return publicApi
    .get(`/${encodeURIComponent(token)}/checklist`)
    .then((r) => r.data?.data ?? r.data)
}

export function uploadChecklistDocument(token, documentKey, file) {
  const fd = new FormData()
  fd.append('file', file)
  return publicApi
    .post(`/${encodeURIComponent(token)}/checklist/${encodeURIComponent(documentKey)}/upload`, fd)
    .then((r) => r.data?.data ?? r.data)
}

