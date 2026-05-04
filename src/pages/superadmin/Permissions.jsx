import { useMemo, useState } from 'react'
import { Toggle } from '../../components/ui/Toggle.jsx'
import { permissionMatrix, permissionRoleDefaults } from '../../data/mockData.js'

const roles = ['Admin', 'Caseworker', 'Viewer']

function cloneDefaults() {
  const next = {}
  roles.forEach((r) => {
    next[r] = { ...permissionRoleDefaults[r] }
  })
  return next
}

export default function Permissions() {
  const [matrix, setMatrix] = useState(cloneDefaults)

  const flatIds = useMemo(() => {
    const ids = []
    permissionMatrix.forEach((sec) => sec.rows.forEach((row) => ids.push(row.id)))
    return ids
  }, [])

  const setCell = (role, permId, checked) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [permId]: checked },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Permissions &amp; RBAC</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure what each role can access across the HRIS platform.
        </p>
      </div>

      <div className="space-y-8">
        {permissionMatrix.map((section) => (
          <div key={section.section} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-gray-900">{section.section}</h2>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px] grid-cols-[minmax(240px,1fr)_repeat(3,minmax(140px,1fr))] gap-0">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-600">
                  Permission
                </div>
                {roles.map((r) => (
                  <div
                    key={r}
                    className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600"
                  >
                    {r}
                  </div>
                ))}
                {section.rows.map((row) => (
                  <div key={row.id} className="contents">
                    <div className="border-b border-gray-100 px-4 py-4 text-sm font-medium text-gray-800">
                      {row.label}
                    </div>
                    {roles.map((role) => (
                      <div
                        key={`${row.id}-${role}`}
                        className="flex items-center justify-center border-b border-gray-100 px-2 py-3"
                      >
                        <Toggle
                          checked={Boolean(matrix[role]?.[row.id])}
                          onChange={(checked) => setCell(role, row.id, checked)}
                          label=""
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        {flatIds.length} permissions tracked across {roles.length} roles (mock UI — changes are local only).
      </p>
    </div>
  )
}
