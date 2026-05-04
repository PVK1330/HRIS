import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { HiShieldCheck, HiCreditCard, HiChatBubbleLeftRight, HiInformationCircle } from 'react-icons/hi2'

export default function Permissions() {
  const [roles, setRoles] = useState([
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Total platform control with access to security, system settings, and all tenant data.',
      icon: HiShieldCheck,
      color: 'red',
      permissions: {
        tenant_management: true,
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
      description: 'Focuses on tenant support, issue resolution, and platform monitoring.',
      icon: HiChatBubbleLeftRight,
      color: 'blue',
      permissions: {
        tenant_management: true,
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
      color: 'green',
      permissions: {
        tenant_management: true,
        billing_revenue: true,
        user_management: false,
        system_config: false,
        audit_logs: false,
        support_tickets: false
      }
    }
  ])

  const handleToggle = (roleId, permKey) => {
    // Prevent modifying Super Admin for safety in this mock
    if (roleId === 'super_admin') return
    
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
    tenant_management: 'Manage Tenants',
    billing_revenue: 'Billing & Revenue',
    user_management: 'Manage SuperAdmins',
    system_config: 'System Configuration',
    audit_logs: 'View Audit Logs',
    support_tickets: 'Handle Support Tickets'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform RBAC</h1>
        <p className="mt-1 text-sm text-gray-500">
          Simplify access control for your internal platform administration team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Role Header */}
            <div className={`p-5 border-b border-gray-100`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  role.color === 'red' ? 'bg-red-50 text-red-600' : 
                  role.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                  'bg-green-50 text-green-600'
                }`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <Badge label={role.id === 'super_admin' ? 'SYSTEM' : 'CUSTOM'} color={role.color} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{role.name}</h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{role.description}</p>
            </div>

            {/* Permissions List */}
            <div className="flex-1 p-5 space-y-4">
               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Access Rights</h3>
               {Object.keys(role.permissions).map((key) => (
                 <div key={key} className="flex items-center justify-between group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {permissionLabels[key]}
                    </span>
                    <Toggle 
                      checked={role.permissions[key]} 
                      onChange={() => handleToggle(role.id, key)} 
                      disabled={role.id === 'super_admin'}
                    />
                 </div>
               ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
               <Button label="Reset Defaults" variant="ghost" size="sm" disabled={role.id === 'super_admin'} />
               <Button label="Save Changes" variant="primary" size="sm" disabled={role.id === 'super_admin'} />
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
         <HiInformationCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
         <div>
            <p className="text-xs text-blue-700 font-semibold">RBAC Management Policy</p>
            <p className="mt-0.5 text-xs text-blue-600 leading-relaxed">
              These roles apply only to the SuperAdmin panel. Tenant-specific roles (like Employee, Manager, and Tenant Admin) are configured within the individual tenant instances.
            </p>
         </div>
      </div>
    </div>
  )
}
