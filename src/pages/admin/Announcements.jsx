import React, { useState, useMemo } from 'react';
import { 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiEye, 
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

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Annual General Meeting 2026', category: 'Corporate', postedBy: 'Sarah Ahmed', date: '2026-04-25', visibility: 'All Employees', status: 'Published', priority: 'High' },
  { id: 2, title: 'New Health Insurance Policy Update', category: 'Benefits', postedBy: 'Neha Jain', date: '2026-04-20', visibility: 'All Employees', status: 'Published', priority: 'Medium' },
  { id: 3, title: 'Ramadan Working Hours Adjustment', category: 'General', postedBy: 'Sarah Ahmed', date: '2026-03-01', visibility: 'All Employees', status: 'Published', priority: 'Medium' },
  { id: 4, title: 'Upcoming Tech Workshop - AI & Cloud', category: 'Training', postedBy: 'Michael Chen', date: '2026-05-15', visibility: 'Engineering', status: 'Draft', priority: 'Low' },
];

export default function Announcements() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    visibility: 'All Employees',
    scheduleDate: '',
    priority: 'Medium'
  });

  const isHrAdmin = user?.role === 'hr_admin' || user?.role === 'admin';

  const stats = {
     published: MOCK_ANNOUNCEMENTS.filter(a => a.status === 'Published').length,
     drafts: MOCK_ANNOUNCEMENTS.filter(a => a.status === 'Draft').length,
     scheduled: 0
  }

  const filtered = useMemo(() => {
    let data = MOCK_ANNOUNCEMENTS;
    if (activeStatus !== 'All') {
      data = data.filter(a => a.status === activeStatus);
    }
    const query = q.trim().toLowerCase();
    if (query) {
      data = data.filter((a) => `${a.title} ${a.category} ${a.postedBy}`.toLowerCase().includes(query));
    }
    return data;
  }, [q, activeStatus]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', category: 'General', content: '', visibility: 'All Employees', scheduleDate: '', priority: 'Medium' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    {
      key: 'title',
      label: 'Announcement',
      render: (v, row) => (
         <div className="flex flex-col">
            <span className="font-bold text-slate-800 leading-tight">{v}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{row.category}</span>
         </div>
      )
    },
    { key: 'postedBy', label: 'Author' },
    { key: 'date', label: 'Posted On' },
    {
      key: 'visibility',
      label: 'Audience',
      render: (v) => (
         <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <HiUsers className="h-3.5 w-3.5 opacity-50" />
            <span>{v}</span>
         </div>
      )
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
            color={v === 'Published' ? 'green' : 'orange'} 
         />
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: () => (
         <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-emerald-600" />
            <Button variant="ghost" size="sm" icon={HiTrash} className="text-slate-400 hover:text-red-600" />
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
               onClick={handleOpenModal}
               className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
               <HiPlus className="h-4 w-4" /> Create Announcement
            </button>
          )}
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Quick Stats & Navigation */}
        <div className="space-y-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Analytics</p>
           {[
             { id: 'All', label: 'All Announcements', count: MOCK_ANNOUNCEMENTS.length, icon: HiGlobeAlt, color: 'emerald' },
             { id: 'Published', label: 'Published Now', count: stats.published, icon: HiCheckCircle, color: 'blue' },
             { id: 'Scheduled', label: 'Scheduled Posts', count: stats.scheduled, icon: HiClock, color: 'orange' },
             { id: 'Draft', label: 'Drafted Content', count: stats.drafts, icon: HiExclamationCircle, color: 'slate' }
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveStatus(item.id)}
               className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all ${
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

           <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-6 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-2 text-slate-500">
                 <HiBellAlert className="h-5 w-5" />
                 <span className="text-xs font-bold uppercase tracking-wider">Pro Tip</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                 Announcements with "High" priority are instantly broadcasted via Email and Mobile Push notifications to the entire selected audience.
              </p>
           </div>
        </div>

        {/* Registry Area */}
        <div className="lg:col-span-3 space-y-6">
           <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

           <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="bg-[#0F766E] px-6 py-3 text-white flex items-center justify-between">
                 <h2 className="text-sm font-bold uppercase tracking-wider">Announcement Registry</h2>
                 <HiDocumentText className="h-4 w-4 opacity-50" />
              </div>
              <Table columns={columns} data={filtered} pageSize={8} />
           </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create Announcement" size="xl">
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
                   <option>All Employees</option>
                   <option>Engineering Only</option>
                   <option>HR Only</option>
                   <option>Sales Only</option>
                </select>
             </div>
             <Input label="Schedule Publish (Optional)" name="scheduleDate" type="datetime-local" value={formData.scheduleDate} onChange={handleInputChange} />
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Button label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button label="Save as Draft" variant="outline" />
            <Button label="Publish Now" variant="primary" className="bg-[#0F766E] px-8 shadow-lg shadow-emerald-900/20" icon={HiEnvelope} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
