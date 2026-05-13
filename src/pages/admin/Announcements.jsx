import React, { useState, useMemo, useEffect } from 'react';
import { 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiCheckCircle, 
  HiClock, 
  HiMegaphone,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiEnvelope,
  HiUsers,
  HiExclamationCircle,
  HiBellAlert,
  HiGlobeAlt,
  HiDocumentText
} from 'react-icons/hi2';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Table } from '../../components/ui/Table.jsx';
import api from '../../services/api.js';
import Swal from 'sweetalert2';

export default function Announcements() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, scheduled: 0 });
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    visibility: 'All Employees',
    scheduleDate: '',
    priority: 'Medium'
  });

  const isHrAdmin = user?.role === 'hr_admin' || user?.role === 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, statRes, deptRes, empRes] = await Promise.all([
        api.get('/admin/announcements'),
        api.get('/admin/announcements/stats'),
        api.get('/departments'), // Assuming this route exists and returns departments
        api.get('/employees?limit=1000')
      ]);
      setAnnouncements(annRes.data.data || []);
      setStats(statRes.data.data || { total: 0, published: 0, drafts: 0, scheduled: 0 });
      const deptPayload = deptRes.data.data;
      setDepartments(deptPayload?.departments || (Array.isArray(deptPayload) ? deptPayload : []));
      setEmployees(empRes.data.data?.employees || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let data = announcements;
    if (activeStatus !== 'All') {
      data = data.filter(a => a.status === activeStatus);
    }
    const query = q.trim().toLowerCase();
    if (query) {
      data = data.filter((a) => `${a.title} ${a.category} ${a.posted_by_name}`.toLowerCase().includes(query));
    }
    return data;
  }, [q, activeStatus, announcements]);

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      let visibility = announcement.visibility || 'All Employees';
      let selectedEmps = [];
      if (visibility.startsWith('[') && visibility.endsWith(']')) {
        try {
          selectedEmps = JSON.parse(visibility);
          visibility = 'Selected Employees';
        } catch (e) {}
      }

      setFormData({
        title: announcement.title || '',
        category: announcement.category || 'General',
        content: announcement.content || '',
        visibility: visibility,
        scheduleDate: announcement.schedule_date ? new Date(announcement.schedule_date).toISOString().slice(0, 16) : '',
        priority: announcement.priority || 'Medium'
      });
      setSelectedEmployees(selectedEmps);
    } else {
      setEditingId(null);
      setFormData({ title: '', category: 'General', content: '', visibility: 'All Employees', scheduleDate: '', priority: 'Medium' });
      setSelectedEmployees([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setEmployeeSearch('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (status) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let finalVisibility = formData.visibility;
      if (formData.visibility === 'Selected Employees') {
        if (selectedEmployees.length === 0) {
          Swal.fire({ icon: 'warning', title: 'Selection required', text: 'Please select at least one employee.' });
          return;
        }
        finalVisibility = JSON.stringify(selectedEmployees);
      }
      
      const payload = { ...formData, status, visibility: finalVisibility };
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Announcement updated successfully.', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/admin/announcements', payload);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Announcement created successfully.', timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save announcement.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/announcements/${id}`);
        Swal.fire('Deleted!', 'The announcement has been deleted.', 'success');
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Failed to delete announcement.', 'error');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Announcement',
      render: (v, row) => (
         <div className="flex flex-col">
            <span className="font-bold text-slate-800 leading-tight">{row.title}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{row.category}</span>
         </div>
      )
    },
    { key: 'posted_by_name', label: 'Author', render: (v) => v || 'System' },
    { 
      key: 'created_at', 
      label: 'Posted On', 
      render: (v) => new Date(v).toLocaleDateString() 
    },
    {
      key: 'visibility',
      label: 'Audience',
      render: (v) => {
         let label = v === 'all' ? 'All Employees' : v;
         if (v?.startsWith('[')) {
           try {
             const ids = JSON.parse(v);
             label = `${ids.length} Selected`;
           } catch(e) {}
         }
         return (
           <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <HiUsers className="h-3.5 w-3.5 opacity-50" />
              <span>{label}</span>
           </div>
         );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => (
         <Badge 
            label={v} 
            color={v === 'High' ? 'red' : v === 'Medium' ? 'orange' : 'blue'} 
            variant="outline" 
         />
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
         <Badge 
            label={v} 
            color={v === 'Published' ? 'green' : v === 'Scheduled' ? 'blue' : 'orange'} 
         />
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
         <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-emerald-600" onClick={() => handleOpenModal(row)} />
            <Button variant="ghost" size="sm" icon={HiTrash} className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(row.id)} />
         </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase flex items-center gap-3">
               <HiMegaphone className="h-8 w-8" /> Announcements & Broadcasts
            </h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Keep your organization informed. Broadcast critical updates, policy changes, and events across departments.
            </p>
          </div>
          {isHrAdmin && (
            <button 
               onClick={() => handleOpenModal()}
               className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
               <HiPlus className="h-4 w-4" /> Create Announcement
            </button>
          )}
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      {/* Analytics Horizontal Toolbar Above Registry */}
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Analytics Overview</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Live Telemetry</span>
         </div>
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: 'All', label: 'All Announcements', count: stats.total, icon: HiGlobeAlt, color: 'emerald' },
              { id: 'Published', label: 'Published Now', count: stats.published, icon: HiCheckCircle, color: 'blue' },
              { id: 'Scheduled', label: 'Scheduled Posts', count: stats.scheduled, icon: HiClock, color: 'orange' },
              { id: 'Draft', label: 'Drafted Content', count: stats.drafts, icon: HiExclamationCircle, color: 'slate' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveStatus(item.id)}
                className={`group flex items-center justify-between rounded-2xl border p-4 transition-all ${
                  activeStatus === item.id 
                  ? 'border-[#0F766E] bg-emerald-50/50 shadow-md ring-1 ring-[#0F766E]' 
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-700">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-medium tracking-tight">Active Reach</div>
                  </div>
                </div>
                <div className={`text-lg font-black ${activeStatus === item.id ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {item.count}
                </div>
              </button>
            ))}
         </div>
      </div>

      {/* Pro Tip Toolbar & Full Width Registry Area */}
      <div className="space-y-6">
         <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by title, category, or author..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                </div>
                <Button label="FILTERS" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px] border border-slate-200" />
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 p-4 bg-slate-50/50 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1 text-slate-500">
                  <HiBellAlert className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pro Tip</span>
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  "High" priority posts are broadcasted instantly via Email and Push notifications.
               </p>
            </div>
         </div>

         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="bg-[#0F766E] px-6 py-3 text-white flex items-center justify-between">
               <h2 className="text-sm font-bold uppercase tracking-wider">Announcement Registry</h2>
               <HiDocumentText className="h-4 w-4 opacity-50" />
            </div>
            <Table columns={columns} data={filtered} pageSize={8} />
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Announcement" : "Create Announcement"} size="xl">
        <form className="animate-in fade-in duration-500 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
             <div className="col-span-2">
                <Input label="Announcement Title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g. New Office Health & Safety Policy" />
             </div>
             <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Area</label>
                <select 
                   name="category"
                   className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={formData.category} 
                   onChange={handleInputChange}
                >
                   <option>General</option>
                   <option>Corporate</option>
                   <option>Benefits</option>
                   <option>Training</option>
                </select>
             </div>
             <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                <select 
                   name="priority"
                   className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={formData.priority} 
                   onChange={handleInputChange}
                >
                   <option>High</option>
                   <option>Medium</option>
                   <option>Low</option>
                </select>
             </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
            <textarea 
              name="content"
              className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none min-h-[200px] leading-relaxed"
              placeholder="Write your announcement message here. You can use markdown-style formatting..."
              value={formData.content}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
             <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                <select 
                   name="visibility"
                   className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={formData.visibility} 
                   onChange={handleInputChange}
                >
                   <option value="All Employees">All Employees</option>
                   <option value="Selected Employees">Selected Employees</option>
                   {departments.map((d, i) => (
                      <option key={i} value={d.name || d.department}>{d.name || d.department}</option>
                   ))}
                </select>
                
                {formData.visibility === 'Selected Employees' && (
                  <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-500 font-medium">Select specific employees:</p>
                      {selectedEmployees.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedEmployees([])}
                          className="text-[10px] text-red-600 hover:underline font-bold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <input 
                      type="text"
                      placeholder="Search by name or email..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full text-xs p-1.5 mb-2 border border-slate-200 rounded focus:outline-none focus:border-[#0F766E] bg-slate-50/50"
                    />
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                      {employees
                        .filter(emp => {
                          const term = employeeSearch.toLowerCase();
                          return `${emp.first_name || emp.name || ''} ${emp.last_name || ''} ${emp.work_email || ''}`.toLowerCase().includes(term);
                        })
                        .map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded border-b border-slate-100 last:border-0">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                              checked={selectedEmployees.includes(emp.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, emp.id]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                                }
                              }}
                            />
                            <span className="font-medium text-slate-700 text-xs">
                              {emp.first_name || emp.name} {emp.last_name || ''} 
                              <span className="text-slate-400 block text-[10px] font-normal">{emp.work_email}</span>
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
             </div>
             <Input label="Schedule Publish (Optional)" name="scheduleDate" type="datetime-local" value={formData.scheduleDate} onChange={handleInputChange} />
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Button label="Cancel" variant="ghost" disabled={isSubmitting} onClick={handleCloseModal} />
            <Button label="Save as Draft" variant="outline" disabled={isSubmitting} onClick={() => handleSave('Draft')} />
            <Button 
              label={isSubmitting ? "Publishing..." : "Publish Now"} 
              variant="primary" 
              className="bg-[#0F766E] px-8 shadow-lg shadow-emerald-900/20" 
              icon={HiEnvelope} 
              loading={isSubmitting} 
              disabled={isSubmitting} 
              onClick={() => handleSave('Published')} 
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
