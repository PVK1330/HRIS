import api from './api.js'

const BASE = '/messages'

export const listMessageContacts = async (params = {}) => {
  const { data } = await api.get(`${BASE}/contacts`, { params })
  return data?.data?.contacts ?? []
}

export const listConversations = async () => {
  const { data } = await api.get(`${BASE}/conversations`)
  return data?.data?.conversations ?? []
}

export const openConversation = async (otherEmployeeId) => {
  const { data } = await api.post(`${BASE}/conversations`, { otherEmployeeId })
  return data.data  // { conversation, other }
}

export const getMessages = async (conversationId, params = {}) => {
  const { data } = await api.get(`${BASE}/conversations/${conversationId}/messages`, { params })
  const msgs = data?.data?.messages
  return Array.isArray(msgs) ? msgs : []
}

export const sendMessageRest = async (conversationId, body) => {
  const { data } = await api.post(`${BASE}/conversations/${conversationId}/messages`, { body })
  return data.data.message
}

export const sendMessageAttachment = async (conversationId, file, body = '') => {
  const form = new FormData()
  form.append('file', file)
  if (body?.trim()) form.append('body', body.trim())
  const { data } = await api.post(`${BASE}/conversations/${conversationId}/messages/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.message
}

export const getUnreadCount = async () => {
  const { data } = await api.get(`${BASE}/unread`)
  return data.data.unread
}
