import { useState, useMemo, useRef, useEffect } from 'react'
import { 
  HiMagnifyingGlass, 
  HiChatBubbleLeftRight, 
  HiPaperAirplane, 
  HiPlus, 
  HiEllipsisVertical,
  HiPhone,
  HiVideoCamera,
  HiCheckBadge,
  HiChevronLeft
} from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { listEmployees } from '../../../services/employeeService.js'

export default function Messages() {
  const [contacts, setContacts] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState({})
  const chatEndRef = useRef(null)

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await listEmployees({ limit: 1000 });
        const empList = data?.employees || [];
        const formatted = empList.map(e => ({
          id: e.id,
          name: e.full_name,
          role: e.job_title || 'Employee',
          lastMsg: 'No recent messages',
          time: '',
          unread: 0,
          online: Math.random() > 0.5, // Mock online status
          avatar: e.full_name.split(' ').map(n => n[0]).join('')
        }));
        setContacts(formatted);
        if (formatted.length > 0) {
          // Keep activeId null by default as per WhatsApp
        }
      } catch (err) {
        console.error('Failed to load employees for chat:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const activeContact = contacts.find(c => c.id === activeId)
  const activeMessages = messages[activeId] || []

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.role.toLowerCase().includes(search.toLowerCase())
    )
  }, [contacts, search])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeId, activeMessages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const msg = {
      id: Date.now(),
      text: newMessage,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), msg]
    }))
    setNewMessage('')
  }

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-r border-slate-100 bg-slate-50/30">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Messages</h1>
            <button className="h-8 w-8 rounded-full bg-emerald-50 text-[#0F766E] flex items-center justify-center hover:bg-emerald-100 transition-colors">
              <HiPlus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full rounded-xl border-none bg-white py-2 pl-9 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-1">
          {loading ? (
            // Skeleton Loaders
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-2 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            ))
          ) : filteredContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveId(contact.id)}
              className={`group flex w-full items-center gap-3 rounded-xl p-3 transition-all ${activeId === contact.id ? 'bg-white shadow-md ring-1 ring-slate-200/50' : 'hover:bg-white/60'}`}
            >
              <div className="relative shrink-0">
                <Avatar name={contact.name} size="md" />
                {contact.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-bold text-slate-900">{contact.name}</span>
                  <span className="text-[10px] font-medium text-slate-400">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">{contact.lastMsg}</p>
                  {contact.unread > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F766E] px-1 text-[9px] font-bold text-white">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-1 flex-col bg-white">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <header className="flex h-16 items-center justify-between border-b border-slate-100 px-6 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={activeContact.name} size="sm" />
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="text-sm font-bold text-slate-900">{activeContact.name}</h2>
                    <HiCheckBadge className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    {activeContact.online ? 'Online' : 'Away'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                  <HiPhone className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                  <HiVideoCamera className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                  <HiEllipsisVertical className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 custom-scrollbar">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-sm ring-1 ring-slate-100">
                    Today
                  </span>
                </div>

                {activeMessages.map((msg, i) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`max-w-[70%] space-y-1`}>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        msg.sent 
                          ? 'bg-[#0F766E] text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none ring-1 ring-slate-100'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`text-[10px] font-medium text-slate-400 ${msg.sent ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <footer className="h-20 border-t border-slate-100 px-6 py-4 bg-white shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button type="button" className="rounded-xl bg-slate-50 p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                  <HiPlus className="h-5 w-5" />
                </button>
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl border-none bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="rounded-xl bg-[#0F766E] p-2.5 text-white shadow-md shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
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
              <p className="text-sm text-slate-500 max-w-xs mx-auto">Choose a contact from the left to start communicating with your team.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
