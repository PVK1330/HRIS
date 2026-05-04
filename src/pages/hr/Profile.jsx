import { useState } from 'react'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'

export default function HRProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Neha Jain',
    email: 'hr@hris.com',
    phone: '+91 98765 43210',
    department: 'Sales & Marketing',
    employeeId: 'HR001',
    joinDate: '15 Jan 2023',
    location: 'Mumbai',
    manager: 'Sarah Ahmed',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <Avatar name={formData.name} size="xl" />
            <h2 className="mt-4 text-lg font-bold text-text-primary">{formData.name}</h2>
            <p className="text-sm text-text-secondary">{formData.email}</p>
            <Badge variant="purple" className="mt-2">HR Manager</Badge>
          </div>

          <div className="mt-6 space-y-3 border-t border-border-tertiary pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Employee ID</span>
              <span className="text-text-primary font-medium">{formData.employeeId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Department</span>
              <span className="text-text-primary font-medium">{formData.department}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Join Date</span>
              <span className="text-text-primary font-medium">{formData.joinDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Location</span>
              <span className="text-text-primary font-medium">{formData.location}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Profile Information</h2>
            {!isEditing && (
              <Button label="Edit Profile" variant="secondary" onClick={() => setIsEditing(true)} />
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Department</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Reporting Manager</label>
                <Input
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button label="Save Changes" variant="primary" onClick={handleSave} />
                <Button label="Cancel" variant="secondary" onClick={() => setIsEditing(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary">Change Password</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Current Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Confirm Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
        <div className="mt-4">
          <Button label="Update Password" variant="primary" />
        </div>
      </div>
    </div>
  )
}
