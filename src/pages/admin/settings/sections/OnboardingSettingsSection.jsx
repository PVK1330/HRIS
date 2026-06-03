import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiPlus, HiTrash } from 'react-icons/hi2'
import { adminSettingsService } from '../../../../services/adminSettingsService.js'
import { listDepartments } from '../../../../services/departmentService.js'
import { Button } from '../../../../components/ui/Button.jsx'
import {
  SectionCard,
  SettingsLoading,
  SettingsSection,
} from '../components/ui'

export default function OnboardingSettingsSection() {
  const [rules, setRules] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [departmentId, setDepartmentId] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [rulesRes, deptRes] = await Promise.all([
        adminSettingsService.getOnboardingHandoverRules(),
        listDepartments({ page: 1, limit: 200, status: 'active' }),
      ])
      setRules(rulesRes.data?.data ?? rulesRes.data ?? [])
      const deptList = deptRes?.departments ?? deptRes?.records ?? []
      setDepartments(deptList)
    } catch (err) {
      toast.error(err.message || 'Failed to load onboarding handover settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    if (!departmentId) {
      toast.error('Select a department')
      return
    }
    try {
      setSaving(true)
      await adminSettingsService.createOnboardingHandoverRule({
        department_id: Number(departmentId),
        workflow_type: 'completion',
        is_active: true,
      })
      toast.success('Handover department added')
      setDepartmentId('')
      await load()
    } catch (err) {
      toast.error(err.message || 'Could not add handover rule')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (rule) => {
    try {
      await adminSettingsService.updateOnboardingHandoverRule(rule.id, {
        is_active: !rule.is_active,
      })
      await load()
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this handover department?')) return
    try {
      await adminSettingsService.deleteOnboardingHandoverRule(id)
      toast.success('Removed')
      await load()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const configuredIds = new Set(rules.map((r) => Number(r.department_id)))
  const availableDepartments = departments.filter(
    (d) => d.managerId && !configuredIds.has(Number(d.id)),
  )

  if (loading) {
    return (
      <SettingsSection>
        <SettingsLoading message="Loading onboarding handover settings…" />
      </SettingsSection>
    )
  }

  return (
    <SettingsSection>
      <SectionCard
        title="Handover departments"
        description="On completion, each department manager receives an in-app handover notification (departments.manager_id)."
        columns={['Department', 'Workflow', 'Status', '']}
      >
        <tr>
          <td colSpan={4} className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-slate-600 mb-1">Add department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select department with manager…</option>
                  {availableDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.departmentName || d.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                label="Add"
                icon={HiPlus}
                onClick={handleAdd}
                disabled={saving || !departmentId}
              />
            </div>
          </td>
        </tr>
        {rules.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
              No handover departments configured yet.
            </td>
          </tr>
        ) : (
          rules.map((rule) => (
            <tr key={rule.id}>
              <td className="px-4 py-3 text-sm font-medium text-slate-800 sm:px-6">
                {rule.department_name || `Department #${rule.department_id}`}
              </td>
              <td className="px-4 py-3 text-center text-sm text-slate-600 sm:px-6">
                {rule.workflow_type || 'completion'}
              </td>
              <td className="px-4 py-3 text-center sm:px-6">
                <button
                  type="button"
                  onClick={() => handleToggle(rule)}
                  className={`text-xs font-bold ${rule.is_active ? 'text-teal-700' : 'text-slate-400'}`}
                >
                  {rule.is_active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-4 py-3 text-center sm:px-6">
                <button
                  type="button"
                  onClick={() => handleDelete(rule.id)}
                  className="inline-flex text-red-600 hover:text-red-800"
                  aria-label="Remove"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))
        )}
      </SectionCard>
    </SettingsSection>
  )
}
