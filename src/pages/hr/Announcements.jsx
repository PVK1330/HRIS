import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'

export default function HRAnnouncements() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'all',
  })

  const announcements = [
    {
      id: 1,
      title: 'Performance Review Cycle Begins',
      content: 'The Q2 performance review cycle will begin on May 1st. Please complete your self-evaluations by April 30th.',
      priority: 'high',
      author: 'Sarah Ahmed',
      date: 'Apr 10, 2026',
      target: 'All Employees',
    },
    {
      id: 2,
      title: 'New HR Policy Update',
      content: 'Updated remote work policy is now effective. Please review the new guidelines in the documents section.',
      priority: 'normal',
      author: 'Neha Jain',
      date: 'Apr 8, 2026',
      target: 'All Employees',
    },
    {
      id: 3,
      title: 'Office Closure - Holiday',
      content: 'The office will be closed on May 1st for Labor Day. Regular operations resume on May 2nd.',
      priority: 'low',
      author: 'Admin Team',
      date: 'Apr 5, 2026',
      target: 'All Employees',
    },
  ]

  const handleCreate = () => {
    setShowCreateModal(false)
    // Create announcement logic here
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Announcements</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage company announcements</p>
        </div>
        <Button label="+ Create Announcement" variant="primary" onClick={() => setShowCreateModal(true)} />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-text-primary">{announcement.title}</h3>
                  <Badge
                    variant={
                      announcement.priority === 'high' ? 'danger' : announcement.priority === 'normal' ? 'info' : 'success'
                    }
                  >
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{announcement.content}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                  <span>By {announcement.author}</span>
                  <span>•</span>
                  <span>{announcement.date}</span>
                  <span>•</span>
                  <span>Target: {announcement.target}</span>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <Button label="Edit" variant="secondary" size="sm" />
                <Button label="Delete" variant="danger" size="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary">Create Announcement</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Content</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                  placeholder="Announcement content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-secondary">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-secondary">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                  >
                    <option value="all">All Employees</option>
                    <option value="hr">HR Team</option>
                    <option value="managers">Managers</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button label="Create" variant="primary" onClick={handleCreate} />
                <Button label="Cancel" variant="secondary" onClick={() => setShowCreateModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
