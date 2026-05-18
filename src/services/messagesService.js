import api from './api.js'

const BASE = '/messages'

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

export const getUnreadCount = async () => {
  const { data } = await api.get(`${BASE}/unread`)
  return data.data.unread
}
