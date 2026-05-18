import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import {
  HiMagnifyingGlass, HiChatBubbleLeftRight, HiPaperAirplane,
  HiPlus, HiCheckBadge, HiArrowPath, HiXMark,
} from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  listConversations, openConversation,
  getMessages, sendMessageRest,
} from '../../../services/messagesService.js'
import { listEmployees } from '../../../services/employeeService.js'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function Messages() {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  const [conversations, setConversations] = useState([])
  const [empList, setEmpList] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [search, setSearch] = useState('')
  const [newChatSearch, setNewChatSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  const [messages, setMessages] = useState([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const typingTimer = useRef(null)
  const chatEndRef = useRef(null)
  const activeConvIdRef = useRef(null)

  const activeConv = conversations.find(c => c.id === activeConvId)

  useEffect(() => {
    activeConvIdRef.current = activeConvId
  }, [activeConvId])

  // ── Socket (single connection; use activeConvIdRef so switching chats does not reconnect) ──
  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    const joinCurrentRoom = () => {
      const cid = activeConvIdRef.current
      if (cid) socket.emit('join_conversation', cid)
    }

    socket.on('connect', () => {
      setConnected(true)
      joinCurrentRoom()
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('new_message', (msg) => {
      const cid = msg.conversation_id
      const viewing = activeConvIdRef.current
      const same = String(cid ?? '') === String(viewing ?? '') && viewing != null
      if (same) {
        setMessages(prev => {
          const withoutOptimistic = prev.filter(m =>
            !(m.optimistic && m.body === msg.body && m.sender_id === msg.sender_id)
          )
          if (withoutOptimistic.some(m => m.id === msg.id)) return withoutOptimistic
          return [...withoutOptimistic, msg]
        })
        socket.emit('mark_read', { conversationId: cid })
      }
      setConversations(prev => prev.map(c =>
        String(c.id) === String(cid)
          ? {
            ...c, last_message: msg.body, last_message_at: msg.created_at,
            unread_count: String(c.id) === String(viewing) ? 0 : (c.unread_count || 0) + 1
          }
          : c
      ))
    })

    socket.on('user:online', ({ userId }) =>
      setConversations(prev => prev.map(c => c.other_id === userId ? { ...c, online: true } : c)))
    socket.on('user:offline', ({ userId }) =>
      setConversations(prev => prev.map(c => c.other_id === userId ? { ...c, online: false } : c)))
    socket.on('user_typing', ({ conversationId, isTyping }) => {
      if (String(conversationId ?? '') === String(activeConvIdRef.current ?? '')) setTyping(isTyping)
    })
    socket.on('messages_read', ({ conversationId }) => {
      if (String(conversationId ?? '') === String(activeConvIdRef.current ?? ''))
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
    })

    return () => { socket.disconnect(); socketRef.current = null }
  }, [])

  // Join / leave conversation rooms when selection changes (without tearing down the socket)
  useEffect(() => {
    if (!activeConvId) return
    const socket = socketRef.current
    if (!socket) return
    socket.emit('join_conversation', activeConvId)
    return () => {
      socket.emit('leave_conversation', activeConvId)
    }
  }, [activeConvId])

  // ── Load conversations ───────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      setApiError('Messaging requires a real login. Please log in via the login page with your tenant credentials.')
      setLoading(false)
      return
    }
    try {
      const data = await listConversations()
      setConversations(data || [])
      setApiError('')
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) {
        setApiError('Session expired. Please log in again.')
      } else {
        setApiError(err?.message || 'Failed to load conversations')
      }
      console.error('[Messages] loadConversations error:', err?.response?.data || err?.message)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Load employees for new chat ──────────────────────────────────────────────
  useEffect(() => {
    if (!showNewChat || empList.length > 0) return
    listEmployees({ limit: 100 }).then(d => setEmpList(d?.employees || [])).catch(() => { })
  }, [showNewChat, empList.length])

  // ── Load messages when conversation changes ──────────────────────────────────
  const [msgError, setMsgError] = useState('')

  useEffect(() => {
    if (!activeConvId) return
    let cancelled = false
    const convId = activeConvId
    const convKey = (id) => String(id ?? '')
    const isThisConv = () => convKey(activeConvIdRef.current) === convKey(convId)

    setMsgLoading(true); setMessages([]); setTyping(false); setMsgError('')

    getMessages(convId)
      .then(msgs => {
        if (cancelled || !isThisConv()) return
        setMessages(Array.isArray(msgs) ? msgs : [])
        socketRef.current?.emit('mark_read', { conversationId: convId })
        setConversations(prev => prev.map(c => convKey(c.id) === convKey(convId) ? { ...c, unread_count: 0 } : c))
      })
      .catch((err) => {
        if (cancelled || !isThisConv()) return
        const msg = err?.response?.data?.message || err?.message || 'Failed to load messages'
        console.error('[Messages] getMessages failed:', err?.response?.data || err?.message)
        setMsgError(msg)
      })
      .finally(() => {
        if (!cancelled && isThisConv()) setMsgLoading(false)
      })

    return () => { cancelled = true }
  }, [activeConvId])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvId || sending) return
    const body = newMessage.trim()
    setNewMessage(''); setSending(true)

    const optimistic = {
      id: `opt-${Date.now()}`, sender_id: user?.id,
      body, created_at: new Date().toISOString(), is_read: false, optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])
    socketRef.current?.emit('typing', { conversationId: activeConvId, isTyping: false })

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', { conversationId: activeConvId, body }, (ack) => {
          if (ack?.ok) {
            // Replace optimistic with real message (snake_case fields)
            setMessages(prev => prev.map(m => m.id === optimistic.id ? ack.message : m))
          }
        })
      } else {
        const msg = await sendMessageRest(activeConvId, body)
        setMessages(prev => prev.map(m => m.id === optimistic.id ? msg : m))
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setNewMessage(body)
    } finally { setSending(false) }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (!activeConvId || !socketRef.current?.connected) return
    socketRef.current.emit('typing', { conversationId: activeConvId, isTyping: true })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing', { conversationId: activeConvId, isTyping: false })
    }, 2000)
  }

  const handleStartChat = async (emp) => {
    try {
      const { conversation } = await openConversation(emp.id)
      await loadConversations()
      setActiveConvId(conversation.id)
      setShowNewChat(false); setNewChatSearch('')
    } catch { /* non-critical */ }
  }

  const filteredConvs = conversations.filter(c =>
    !search || c.other_name?.toLowerCase().includes(search.toLowerCase()))
  const filteredEmps = empList.filter(e =>
    !newChatSearch ||
    e.full_name?.toLowerCase().includes(newChatSearch.toLowerCase()) ||
    e.emp_id?.toLowerCase().includes(newChatSearch.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="flex w-80 flex-col border-r border-slate-100 bg-slate-50/30">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`} title={connected ? 'Connected' : 'Disconnected'} />
            </div>
            <button
              onClick={() => setShowNewChat(v => !v)}
              className="h-8 w-8 rounded-full bg-emerald-50 text-[#0F766E] flex items-center justify-center hover:bg-emerald-100 transition-colors"
              title="New conversation">
              {showNewChat ? <HiXMark className="h-4 w-4" /> : <HiPlus className="h-5 w-5" />}
            </button>
          </div>

          {/* New chat search */}
          {showNewChat && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Start new conversation</p>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="text" placeholder="Search employee…" value={newChatSearch}
                  onChange={e => setNewChatSearch(e.target.value)}
                  className="w-full rounded-lg border-none bg-white py-2 pl-8 pr-3 text-xs shadow-sm focus:ring-1 focus:ring-emerald-400 outline-none" />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredEmps.slice(0, 20).map(emp => (
                  <button key={emp.id} onClick={() => handleStartChat(emp)}
                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white transition-colors text-left">
                    <Avatar name={emp.full_name} size="xs" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{emp.full_name}</p>
                      <p className="text-[9px] text-slate-400">{emp.job_title}</p>
                    </div>
                  </button>
                ))}
                {filteredEmps.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No employees found</p>}
              </div>
            </div>
          )}

          {/* Conversation search */}
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search chats…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border-none bg-white py-2 pl-9 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-2 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            ))
          ) : apiError ? (
            <div className="mx-2 mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-center space-y-2">
              <p className="text-xs font-bold text-orange-700">⚠ Messaging unavailable</p>
              <p className="text-[10px] text-orange-600 leading-relaxed">{apiError}</p>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HiChatBubbleLeftRight className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">No conversations yet</p>
              <button onClick={() => setShowNewChat(true)} className="mt-2 text-xs font-bold text-[#0F766E] hover:underline">
                Start one
              </button>
            </div>
          ) : filteredConvs.map(conv => (
            <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
              className={`group flex w-full items-center gap-3 rounded-xl p-3 transition-all ${activeConvId === conv.id ? 'bg-white shadow-md ring-1 ring-slate-200/50' : 'hover:bg-white/60'}`}>
              <div className="relative shrink-0">
                <Avatar name={conv.other_name} size="md" />
                {conv.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-bold text-slate-900">{conv.other_name}</span>
                  <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-1">{formatTime(conv.last_message_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">{conv.last_message || 'No messages yet'}</p>
                  {conv.unread_count > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F766E] px-1 text-[9px] font-bold text-white shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat window ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-white">
        {activeConv ? (
          <>
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b border-slate-100 px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={activeConv.other_name} size="sm" />
                  {activeConv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="text-sm font-bold text-slate-900">{activeConv.other_name}</h2>
                    <HiCheckBadge className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    {typing ? <span className="text-emerald-600 animate-pulse">typing…</span>
                      : activeConv.online ? 'Online' : 'Away'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!connected && (
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-full">
                    Reconnecting…
                  </span>
                )}
              </div>
            </header>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/30 p-6">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <HiArrowPath className="h-6 w-6 text-slate-300 animate-spin" />
                </div>
              ) : msgError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-red-500">Failed to load messages</p>
                    <p className="text-xs text-slate-400">{msgError}</p>
                    <button onClick={() => setActiveConvId(v => v)}
                      className="text-xs font-bold text-[#0F766E] hover:underline">Retry</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="flex justify-center">
                      <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">
                        No messages yet — say hello!
                      </span>
                    </div>
                  )}
                  {messages.map((msg) => {
                    // Use == (loose) to handle int vs string mismatch between DB and JWT
                    // eslint-disable-next-line eqeqeq
                    const isMine = msg.sender_id == user?.id
                    const key = msg.optimistic ? msg.id : `msg-${msg.id}`
                    return (
                      <div key={key} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                        <div className="max-w-[70%] space-y-1">
                          <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMine
                              ? `bg-[#0F766E] text-white rounded-tr-none ${msg.optimistic ? 'opacity-70' : ''}`
                              : 'bg-white text-slate-700 rounded-tl-none ring-1 ring-slate-100'
                            }`}>
                            {msg.body}
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isMine && msg.is_read && <HiCheckBadge className="h-3 w-3 text-emerald-500" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <footer className="h-20 border-t border-slate-100 px-6 py-4 bg-white shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input type="text" placeholder="Type your message…"
                  className="flex-1 rounded-xl border-none bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                  value={newMessage} onChange={handleTyping} />
                <button type="submit" disabled={!newMessage.trim() || sending}
                  className="rounded-xl bg-[#0F766E] p-2.5 text-white shadow-md shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                  <HiPaperAirplane className="h-5 w-5 -rotate-45" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-[#0F766E]">
              <HiChatBubbleLeftRight className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Select a Conversation</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                Choose a contact from the left or start a new conversation.
              </p>
            </div>
            <button onClick={() => setShowNewChat(true)}
              className="flex items-center gap-2 rounded-xl bg-[#0F766E] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:scale-105 transition-all">
              <HiPlus className="h-4 w-4" /> New Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
