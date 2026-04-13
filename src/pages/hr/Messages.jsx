import { useState } from 'react'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'

export default function HRMessages() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')

  const conversations = [
    { id: 1, name: 'Sarah Ahmed', role: 'Super Admin', lastMessage: 'Please review the new policy document', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Rohit Shah', role: 'Sales Executive', lastMessage: 'Thanks for the approval', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'Priti Gupta', role: 'Sr. Sales Exec', lastMessage: 'Meeting rescheduled to 3 PM', time: 'Yesterday', unread: 0 },
    { id: 4, name: 'Vijay More', role: 'Sales Trainee', lastMessage: 'Can you help with the onboarding?', time: '2 days ago', unread: 1 },
  ]

  const messages = [
    { id: 1, sender: 'Sarah Ahmed', message: 'Hi Neha, could you please review the new policy document I sent?', time: '10:25 AM', isOwn: false },
    { id: 2, sender: 'Me', message: 'Sure, I\'ll review it and get back to you by end of day.', time: '10:28 AM', isOwn: true },
    { id: 3, sender: 'Sarah Ahmed', message: 'Great, thanks! Let me know if you have any questions.', time: '10:30 AM', isOwn: false },
  ]

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('')
      // Send message logic here
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="mt-1 text-sm text-text-secondary">Communicate with your team</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm">
          <div className="border-b border-border-tertiary p-4">
            <Input placeholder="Search conversations..." />
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`cursor-pointer border-b border-border-tertiary p-4 hover:bg-background-secondary ${
                  selectedConversation?.id === conv.id ? 'bg-background-secondary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={conv.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">{conv.name}</span>
                      <span className="text-xs text-text-secondary">{conv.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{conv.role}</p>
                    <p className="mt-1 truncate text-sm text-text-primary">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge variant="danger" className="ml-2">{conv.unread}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 rounded-xl border border-border-tertiary bg-background-primary shadow-sm">
          {selectedConversation ? (
            <>
              <div className="border-b border-border-tertiary p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedConversation.name} />
                  <div>
                    <h3 className="font-semibold text-text-primary">{selectedConversation.name}</h3>
                    <p className="text-xs text-text-secondary">{selectedConversation.role}</p>
                  </div>
                </div>
              </div>

              <div className="max-h-[450px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.isOwn
                          ? 'bg-primary text-white'
                          : 'bg-background-secondary text-text-primary'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`mt-1 text-xs ${msg.isOwn ? 'text-primary-light' : 'text-text-secondary'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-tertiary p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button label="Send" variant="primary" onClick={handleSendMessage} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[600px] items-center justify-center">
              <p className="text-text-secondary">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
