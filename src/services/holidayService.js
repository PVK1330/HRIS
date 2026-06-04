import api from './api.js';

export async function listHolidayCalendars(params) {
  const { data } = await api.get('/holidays', { params });
  return data?.data || [];
}

export async function getHolidayCalendar(id) {
  const { data } = await api.get(`/holidays/${id}`);
  return data?.data || null;
}

export async function createHolidayCalendar(payload) {
  const { data } = await api.post('/holidays', payload);
  return data?.data || null;
}

export async function seedHolidays(payload) {
  const { data } = await api.post('/holidays/seed', payload);
  return data?.data || null;
}

export async function addHolidayDate(calendarId, payload) {
  const { data } = await api.post(`/holidays/${calendarId}/dates`, payload);
  return data?.data || null;
}

export async function updateHolidayDate(id, payload) {
  const { data } = await api.patch(`/holidays/dates/${id}`, payload);
  return data?.data || null;
}

export async function removeHolidayDate(id) {
  const { data } = await api.delete(`/holidays/dates/${id}`);
  return data?.data || null;
}
