import api from './api.js';

export const sendReminder = async (employeeId) => {
  const { data } = await api.post(`/employees/${employeeId}/onboarding/remind-documents`);
  return data.data;
};

export const approveChecklistItem = async (employeeId, itemId, payload) => {
  const { data } = await api.patch(`/employees/${employeeId}/onboarding/checklist/${itemId}/review`, payload);
  return data.data;
};

export const completeOnboarding = async (employeeId) => {
  const { data } = await api.post(`/employees/${employeeId}/onboarding/complete`);
  return data.data;
};

export const getOnboardingChecklist = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/onboarding/checklist`);
  return data.data;
};

export const uploadSignedOfferByHr = async (employeeId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post(`/employees/${employeeId}/onboarding/signed-offer`, fd);
  return data.data;
};
