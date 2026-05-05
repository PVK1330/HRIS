import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { 
  HiShieldCheck, 
  HiCreditCard, 
  HiChatBubbleLeftRight, 
  HiInformationCircle, 
  HiPlus, 
  HiUserGroup, 
  HiLockClosed,
  HiQuestionMarkCircle,
  HiGlobeAlt,
  HiDocumentText,
  HiCommandLine,
  HiSquares2X2,
  HiFingerPrint
} from 'react-icons/hi2'
import { Modal } from '../../components/ui/Modal.jsx'
import { Input } from '../../components/ui/Input.jsx'

export default function Permissions() {
  const [roles, setRoles] = useState([
    {
      id: 'superadmin',
      name: 'Super Admin',
      description: 'Total platform control with access to security, system settings, and all organization data.',
      icon: HiFingerPrint,
      color: 'rose',
      permissions: {
        organization_management: true,
        billing_revenue: true,
        user_management: true,
        system_config: true,
        audit_logs: true,
        support_tickets: true
      }
    },
    {
      id: 'support_admin',
      name: 'Support Admin',
      description: 'Focuses on organization support, issue resolution, and platform monitoring.',
      icon: HiChatBubbleLeftRight,
      color: 'blue',
      permissions: {
        organization_management: true,
        billing_revenue: false,
        user_management: false,
        system_config: false,
        audit_logs: true,
        support_tickets: true
      }
    },
    {
      id: 'billing_admin',
      name: 'Billing Admin',
      description: 'Handles subscriptions, revenue tracking, and platform financial reporting.',
      icon: HiCreditCard,
      color: 'emerald',
      permissions: {
        organization_management: true,
        billing_revenue: true,
        user_management: false,
        system_config: false,
        audit_logs: false,
        support_tickets: false
      }
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {
      organization_management: false,
      billing_revenue: false,
      user_management: false,
      system_config: false,
      audit_logs: false,
      support_tickets: false
    }
  })

  const handleCreateRole = () => {
    if (!newRole.name) return

    const roleId = newRole.name.toLowerCase().replace(/\s+/g, '_')
    const createdRole = {
      ...newRole,
      id: roleId,
      icon: HiUserGroup,
      color: 'blue'
    }

    setRoles([...roles, createdRole])
    setShowCreateModal(false)
    setNewRole({
      name: '',
      description: '',
      permissions: {
        organization_management: false,
        billing_revenue: false,
        user_management: false,
        system_config: false,
        audit_logs: false,
        support_tickets: false
      }
    })
  }

  const toggleNewRolePerm = (key) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [key]: !newRole.permissions[key]
      }
    })
  }

  const handleToggle = (roleId, permKey) => {
    // Prevent modifying Super Admin for safety in this mock
    if (roleId === 'superadmin') return

    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permKey]: !role.permissions[permKey]
          }
        }
      }
      return role
    }))
  }

  const permissionLabels = {
    organization_management: { label: 'Organization Management', icon: HiGlobeAlt },
    billing_revenue: { label: 'Billing & Revenue', icon: HiCreditCard },
    user_management: { label: 'Internal Staff Management', icon: HiUserGroup },
    system_config: { label: 'Settings', icon: HiSquares2X2 },
    audit_logs: { label: 'Audit Logs', icon: HiShieldCheck },
    support_tickets: { label: 'Support', icon: HiChatBubbleLeftRight }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <HiLockClosed className="h-4.5 w-4.5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Permissions</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-rose-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                   <p className="font-bold text-rose-400 mb-1 uppercase tracking-widest">Access Control</p>
                   Set what each admin role can access on the platform.
                   <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage user roles and permissions.</p>
        </div>
        <Button label="Add Role" variant="primary" size="sm" icon={HiPlus} onClick={() => setShowCreateModal(true)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md group">
            {/* Role Header */}
            <div className={`p-5 border-b border-slate-50 relative`}>
               <div className="absolute top-8 right-8">
                  <Badge label={role.id === 'superadmin' ? 'SYSTEM CORE' : 'CUSTOM'} color={role.color} variant="glass" />
               </div>
               <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-50 transition-transform group-hover:scale-110 ${
                  role.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                  role.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  'bg-emerald-50 text-emerald-600'
               }`}>
                  <role.icon className="h-7 w-7" />
               </div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{role.name}</h2>
               <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed">{role.description}</p>
            </div>

            {/* Permissions List */}
            <div className="flex-1 p-8 space-y-5 bg-slate-50/20">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Orchestration Rights</h3>
               {Object.keys(role.permissions).map((key) => (
                <div key={key} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${role.permissions[key] ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-300'}`}>
                      {permissionLabels[key] && (() => {
                        const Icon = permissionLabels[key].icon;
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors">
                      {permissionLabels[key] ? permissionLabels[key].label : key}
                    </span>
                  </div>
                  <Toggle
                    checked={role.permissions[key]}
                    onChange={() => handleToggle(role.id, key)}
                    disabled={role.id === 'superadmin'}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-slate-50 flex justify-end gap-3">
              <Button label="Cancel" variant="ghost" className="text-slate-400 font-bold" disabled={role.id === 'superadmin'} />
              <Button label="Save" variant="primary" className={role.id === 'superadmin' ? 'bg-slate-100 text-slate-400 border-none' : ''} disabled={role.id === 'superadmin'} />
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Info Section */}
      <div className="rounded-[2rem] border border-indigo-100 bg-indigo-50/30 p-8 flex gap-5 items-start">
        <div className="h-10 w-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
           <HiInformationCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-black text-indigo-900 uppercase tracking-widest">RBAC Management Policy</p>
          <p className="mt-1 text-sm font-medium text-indigo-600/80 leading-relaxed max-w-4xl">
            These governance policies apply exclusively to the HRIS platform's internal administrative kernel. 
            Individual organization roles (e.g., HR Manager, Department Head) are isolated and managed within their respective organization instances.
          </p>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Role"
        description="Create a new role with specific access permissions."
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-8 p-2">
          <div className="space-y-6">
            <Input
              label="Policy Identity *"
              placeholder="e.g. Platform Auditor"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            />
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Policy Scope</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all resize-none shadow-sm"
                placeholder="Define the specific administrative responsibilities for this role..."
                rows={3}
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Assign Node Permissions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.keys(permissionLabels).map((key) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                     {(() => {
                       const Icon = permissionLabels[key].icon;
                       return <Icon className="h-4 w-4 text-slate-400" />;
                     })()}
                     <span className="text-xs font-bold text-slate-700">{permissionLabels[key].label}</span>
                  </div>
                  <Toggle
                    checked={newRole.permissions[key]}
                    onChange={() => toggleNewRolePerm(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowCreateModal(false)} />
            <Button label="Save" variant="primary" className="flex-1" onClick={handleCreateRole} disabled={!newRole.name} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
