import { useState } from 'react'
import { 
  HiUser, 
  HiShieldCheck, 
  HiClock, 
  HiEnvelope, 
  HiKey, 
  HiDevicePhoneMobile,
  HiChevronRight,
  HiCheckBadge,
  HiArrowPath
} from 'react-icons/hi2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const TABS = [
  { id: 'overview', label: 'My Profile', icon: HiUser, desc: 'Personal details and credentials' },
  { id: 'security', label: 'Security', icon: HiShieldCheck, desc: '2FA and password management' },
  { id: 'activity', label: 'Activity Logs', icon: HiClock, desc: 'Login history and sessions' }
]

export default function SuperAdminProfile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-indigo-100/50" />
               <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                     <div className="h-24 w-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
                        {user?.name?.charAt(0) || 'S'}
                     </div>
                     <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-md">
                        <HiCheckBadge className="h-5 w-5 text-indigo-600" />
                     </div>
                  </div>
                  <div className="text-center md:text-left">
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name || 'Super Administrator'}</h2>
                     <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-widest">Master Platform Authority</p>
                     <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                        <Badge label="Active Session" color="green" variant="glass" />
                        <Badge label="Enterprise Tier" color="indigo" variant="glass" />
                     </div>
                  </div>
                  <div className="md:ml-auto flex gap-2">
                     <Button 
                        label={isEditing ? 'Discard Changes' : 'Update Profile'} 
                        variant="ghost" 
                        size="sm" 
                        className="font-bold text-slate-400"
                        onClick={() => setIsEditing(!isEditing)} 
                     />
                     {isEditing && <Button label="Commit Changes" variant="primary" size="sm" className="bg-slate-900 border-none px-6" />}
                  </div>
               </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Identity Details</h3>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <HiEnvelope className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                           {isEditing ? <input className="text-sm font-bold text-slate-900 bg-slate-50 rounded-lg px-2 py-1 mt-1 outline-none border border-slate-100" defaultValue={user?.email || 'admin@hris.com'} /> : <p className="text-sm font-bold text-slate-900">{user?.email || 'admin@hris.com'}</p>}
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <HiUser className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Role</p>
                           <p className="text-sm font-bold text-slate-900 capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Account Status</h3>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                           <HiShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auth Status</p>
                           <p className="text-sm font-bold text-emerald-600">Verified & Secure</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                           <HiClock className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Auth</p>
                           <p className="text-sm font-bold text-slate-900">Today, 09:24 AM</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
               <div className="relative max-w-xl">
                  <h2 className="text-3xl font-black tracking-tight mb-4">Security Center</h2>
                  <p className="text-indigo-200/60 text-sm leading-relaxed mb-8">
                     Your account is the master key to the HRIS platform. Maintain the highest security standards by keeping your password rotated and 2FA active.
                  </p>
                  <div className="flex flex-wrap gap-4">
                     <Button label="Rotate Password" icon={HiKey} className="bg-white text-slate-900 hover:bg-slate-100 border-none px-6 font-black text-xs uppercase tracking-widest rounded-xl" />
                     <Button label="Configure 2FA" icon={HiDevicePhoneMobile} variant="ghost" className="text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest rounded-xl px-6" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:border-indigo-600 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <HiDevicePhoneMobile className="h-6 w-6" />
                     </div>
                     <HiChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Two-Factor Auth</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                     Adds an extra layer of protection by requiring a code from your phone to login.
                  </p>
               </div>
               <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:border-slate-900 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <HiKey className="h-6 w-6" />
                     </div>
                     <HiChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Active Sessions</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                     Monitor and manage all devices currently logged into your administrator account.
                  </p>
               </div>
            </div>
          </div>
        )
      case 'activity':
        return (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
               <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Authentication Logs</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Review your recent platform access history.</p>
               </div>
               <Button variant="ghost" icon={HiArrowPath} size="sm" className="text-slate-400" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-50">
                     <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location / IP</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[
                        { event: 'Login Successful', ip: '192.168.1.1 (Dubai, UAE)', device: 'Chrome on macOS', time: 'Today, 09:24 AM', status: 'success' },
                        { event: 'Password Updated', ip: '192.168.1.1 (Dubai, UAE)', device: 'Chrome on macOS', time: 'Yesterday, 04:12 PM', status: 'warning' },
                        { event: '2FA Setup Initialized', ip: '192.168.1.1 (Dubai, UAE)', device: 'Chrome on macOS', time: 'Yesterday, 03:50 PM', status: 'success' },
                        { event: 'Login Successful', ip: '82.12.91.4 (London, UK)', device: 'Safari on iPhone', time: '02 May, 11:30 PM', status: 'success' },
                     ].map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                 <div className={`h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                 <span className="text-sm font-bold text-slate-900">{log.event}</span>
                              </div>
                           </td>
                           <td className="px-8 py-4 text-xs font-medium text-slate-500">{log.ip}</td>
                           <td className="px-8 py-4 text-xs font-medium text-slate-500">{log.device}</td>
                           <td className="px-8 py-4 text-xs font-bold text-slate-900">{log.time}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Dynamic Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Center</h1>
            <p className="text-sm font-medium text-slate-400">Orchestrate your master administrator profile.</p>
         </div>
         <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            {TABS.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                     activeTab === tab.id 
                     ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                     : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`}
               >
                  {tab.label}
               </button>
            ))}
         </div>
      </div>

      <div className="min-h-[600px]">
         {renderContent()}
      </div>
    </div>
  )
}
