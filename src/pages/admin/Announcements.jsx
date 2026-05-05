import React, { useState } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiEye, HiCheckCircle, HiClock, HiMegaphone } from 'react-icons/hi2';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Annual General Meeting 2026', category: 'Corporate', postedBy: 'Sarah Ahmed', date: '2026-04-25', visibility: 'All', status: 'Published' },
  { id: 2, title: 'New Health Insurance Policy', category: 'Benefits', postedBy: 'Neha Jain', date: '2026-04-20', visibility: 'All', status: 'Published' },
  { id: 3, title: 'Ramadan Working Hours', category: 'General', postedBy: 'Sarah Ahmed', date: '2026-03-01', visibility: 'All', status: 'Published' },
  { id: 4, title: 'Upcoming Tech Workshop', category: 'Training', postedBy: 'Michael Chen', date: '2026-05-15', visibility: 'Engineering', status: 'Draft' },
];

export default function Announcements() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    visibility: 'All',
    scheduleDate: ''
  });

  const isHrAdmin = user?.role === 'hr_admin';

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', category: 'General', content: '', visibility: 'All', scheduleDate: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (status) => {
    console.log(`Announcement (${status}):`, formData);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Announcements</h1>
          <p className="text-sm text-text-secondary">Broadcast news and updates to the organization</p>
        </div>
        {isHrAdmin && (
          <Button label="New Announcement" icon={HiPlus} variant="primary" onClick={handleOpenModal} />
        )}
      </div>

      <div className="rounded-xl border border-border-tertiary bg-background-primary shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-tertiary bg-background-secondary/30">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="Search announcements..."
                className="w-full rounded-lg border border-border-tertiary bg-background-primary px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-background-secondary border-b border-border-tertiary">
            <tr>
              <th className="px-6 py-4 font-semibold text-text-primary">Title</th>
              <th className="px-6 py-4 font-semibold text-text-primary">Category</th>
              <th className="px-6 py-4 font-semibold text-text-primary">Posted By</th>
              <th className="px-6 py-4 font-semibold text-text-primary">Date</th>
              <th className="px-6 py-4 font-semibold text-text-primary">Visibility</th>
              <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
              {isHrAdmin && <th className="px-6 py-4 font-semibold text-text-primary text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tertiary">
            {MOCK_ANNOUNCEMENTS.map((item) => (
              <tr key={item.id} className="hover:bg-background-tertiary/50 group">
                <td className="px-6 py-4 font-medium text-text-primary max-w-xs truncate">{item.title}</td>
                <td className="px-6 py-4 text-text-secondary">{item.category}</td>
                <td className="px-6 py-4 text-text-secondary">{item.postedBy}</td>
                <td className="px-6 py-4 text-text-secondary">{item.date}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-background-tertiary px-2 py-1 text-[10px] font-bold text-text-secondary uppercase">
                    {item.visibility}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-xs font-bold ${
                    item.status === 'Published' ? 'text-success-DEFAULT' : 'text-warning-DEFAULT'
                  }`}>
                    {item.status === 'Published' ? <HiCheckCircle className="h-4 w-4" /> : <HiClock className="h-4 w-4" />}
                    {item.status}
                  </span>
                </td>
                {isHrAdmin && (
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg p-1 text-text-secondary hover:bg-background-tertiary hover:text-primary"><HiPencilSquare className="h-5 w-5" /></button>
                      <button className="rounded-lg p-1 text-text-secondary hover:bg-danger-DEFAULT/10 hover:text-danger-DEFAULT"><HiTrash className="h-5 w-5" /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create Announcement" size="lg">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Announcement Title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g. New Office Policy" />
          <Input 
            label="Category" 
            name="category" 
            type="select"
            options={[
              { value: 'General', label: 'General' },
              { value: 'Corporate', label: 'Corporate' },
              { value: 'Benefits', label: 'Benefits' },
              { value: 'Training', label: 'Training' },
            ]}
            value={formData.category} 
            onChange={handleInputChange} 
            required 
          />
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Content</label>
            <textarea 
              name="content"
              className="w-full rounded-lg border border-border-tertiary bg-background-primary px-4 py-2 text-sm outline-none focus:border-primary"
              rows={5}
              placeholder="Write your announcement message here..."
              value={formData.content}
              onChange={handleInputChange}
              required
            />
          </div>
          <Input 
            label="Visibility" 
            name="visibility" 
            type="select"
            options={[
              { value: 'All', label: 'All Employees' },
              { value: 'Engineering', label: 'Engineering Only' },
              { value: 'HR', label: 'HR Only' },
              { value: 'Sales', label: 'Sales Only' },
            ]}
            value={formData.visibility} 
            onChange={handleInputChange} 
          />
          <Input label="Schedule Publish (Optional)" name="scheduleDate" type="datetime-local" value={formData.scheduleDate} onChange={handleInputChange} />
          
          <div className="flex justify-end gap-3 pt-6">
            <Button label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button label="Save as Draft" variant="outline" onClick={() => handleSubmit('Draft')} />
            <Button label="Publish Now" variant="primary" onClick={() => handleSubmit('Published')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
