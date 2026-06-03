import api from './api.js'

const BASE = '/holidays'

export const listHolidayCalendars = async (params = {}) => {
  const { data } = await api.get(BASE, { params })
  return data.data
}

export const getHolidayCalendar = async (calendarId) => {
  const { data } = await api.get(`${BASE}/${calendarId}`)
  return data.data
}

export const seedUkHolidays = async (payload) => {
  const { data } = await api.post(`${BASE}/seed`, payload)
  return data.data
}

export const addHolidayDate = async (calendarId, payload) => {
  const { data } = await api.post(`${BASE}/${calendarId}/dates`, payload)
  return data.data
}

export const updateHolidayDate = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/dates/${id}`, payload)
  return data.data
}

export const deleteHolidayDate = async (id) => {
  const { data } = await api.delete(`${BASE}/dates/${id}`)
  return data.data
}
