import api from './api.js'

/** @returns {Promise<{ total, valid, expiringSoon, expired }>} */
export async function getVisaRecordStats() {
  const { data } = await api.get('/visa-records/stats')
  return data.data
}

/** @returns {Promise<{ departments, locations, visaTypes, expiryWindows }>} */
export async function getVisaFilterOptions() {
  const { data } = await api.get('/visa-records/filter-options')
  return data.data
}

/** @returns {Promise<{ records, pagination }>} */
export async function listVisaRecords(params = {}) {
  const { data } = await api.get('/visa-records', { params })
  return data.data
}

export async function getVisaRecord(id) {
  const { data } = await api.get(`/visa-records/${id}`)
  return data.data
}

function appendIf(fd, key, val) {
  if (val === undefined || val === null || val === '') return
  fd.append(key, String(val))
}

/**
 * @param {Record<string, string|number>} body snake_case fields
 * @param {{ passport_scan?: File, visa_copy?: File, emirates_id_front?: File, emirates_id_back?: File }} files
 */
export async function createVisaRecord(body, files = {}) {
  const fd = new FormData()
  appendIf(fd, 'employee_id', body.employee_id)
  appendIf(fd, 'nationality', body.nationality)
  appendIf(fd, 'passport_number', body.passport_number)
  appendIf(fd, 'passport_issue_date', body.passport_issue_date)
  appendIf(fd, 'passport_expiry_date', body.passport_expiry_date)
  appendIf(fd, 'country_of_issue', body.country_of_issue)
  appendIf(fd, 'visa_type_id', body.visa_type_id)
  appendIf(fd, 'visa_number', body.visa_number)
  appendIf(fd, 'visa_issue_date', body.visa_issue_date)
  appendIf(fd, 'visa_expiry_date', body.visa_expiry_date)
  appendIf(fd, 'issued_by', body.issued_by)
  appendIf(fd, 'sponsoring_entity', body.sponsoring_entity)
  appendIf(fd, 'emirates_id_number', body.emirates_id_number)
  appendIf(fd, 'emirates_id_expiry', body.emirates_id_expiry)
  if (files.passport_scan) fd.append('passport_scan', files.passport_scan)
  if (files.visa_copy) fd.append('visa_copy', files.visa_copy)
  if (files.emirates_id_front) fd.append('emirates_id_front', files.emirates_id_front)
  if (files.emirates_id_back) fd.append('emirates_id_back', files.emirates_id_back)
  const { data } = await api.post('/visa-records', fd)
  return data.data
}

export async function updateVisaRecord(id, body, files = {}) {
  const fd = new FormData()
  appendIf(fd, 'nationality', body.nationality)
  appendIf(fd, 'passport_number', body.passport_number)
  appendIf(fd, 'passport_issue_date', body.passport_issue_date)
  appendIf(fd, 'passport_expiry_date', body.passport_expiry_date)
  appendIf(fd, 'country_of_issue', body.country_of_issue)
  appendIf(fd, 'visa_type_id', body.visa_type_id)
  appendIf(fd, 'visa_number', body.visa_number)
  appendIf(fd, 'visa_issue_date', body.visa_issue_date)
  appendIf(fd, 'visa_expiry_date', body.visa_expiry_date)
  appendIf(fd, 'issued_by', body.issued_by)
  appendIf(fd, 'sponsoring_entity', body.sponsoring_entity)
  appendIf(fd, 'emirates_id_number', body.emirates_id_number)
  appendIf(fd, 'emirates_id_expiry', body.emirates_id_expiry)
  if (files.passport_scan) fd.append('passport_scan', files.passport_scan)
  if (files.visa_copy) fd.append('visa_copy', files.visa_copy)
  if (files.emirates_id_front) fd.append('emirates_id_front', files.emirates_id_front)
  if (files.emirates_id_back) fd.append('emirates_id_back', files.emirates_id_back)
  const { data } = await api.put(`/visa-records/${id}`, fd)
  return data.data
}

export async function deleteVisaRecord(id) {
  const { data } = await api.delete(`/visa-records/${id}`)
  return data.data
}
