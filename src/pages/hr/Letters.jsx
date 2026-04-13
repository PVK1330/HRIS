import { useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'

export default function Letters() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [letterType, setLetterType] = useState('')

  const recentLetters = [
    { employee: 'Priti Gupta', type: 'Confirmation Letter', generated: '01 Apr 2026', status: 'Issued' },
    { employee: 'Anita Nair', type: 'Experience Letter', generated: '28 Mar 2026', status: 'Issued' },
    { employee: 'Vijay More', type: 'Offer Letter', generated: '15 Jan 2026', status: 'Issued' },
    { employee: 'Rohit Shah', type: 'Salary Certificate', generated: '10 Mar 2026', status: 'Pending Sign' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Letters & Documents</h1>
        <p className="mt-1 text-sm text-text-secondary">Generate and manage HR letters</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Generate Letter */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Generate HR Letter</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              >
                <option>Rohit Shah</option>
                <option>Priti Gupta</option>
                <option>Anita Nair</option>
                <option>Vijay More</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Letter Type</label>
              <select
                value={letterType}
                onChange={(e) => setLetterType(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              >
                <option>Offer Letter</option>
                <option>Appointment Letter</option>
                <option>Confirmation Letter</option>
                <option>Experience Letter</option>
                <option>Salary Certificate</option>
                <option>Promotion Letter</option>
                <option>Warning Letter</option>
                <option>Relieving Letter</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Effective Date</label>
              <Input type="date" defaultValue="2026-04-15" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Additional Notes</label>
              <textarea
                rows={2}
                placeholder="Any specific clauses or remarks..."
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button label="Generate & Preview" variant="primary" />
              <Button label="Save Draft" variant="secondary" />
            </div>
          </div>
        </div>

        {/* Recent Letters */}
        <div className="rounded-xl border border-border-tertiary bg-background-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Recent Letters</h2>
          <Table
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'type', label: 'Letter Type' },
              { key: 'generated', label: 'Generated' },
              { key: 'status', label: 'Status' },
              { key: 'action', label: '' },
            ]}
            data={recentLetters.map(l => ({
              employee: l.employee,
              type: l.type,
              generated: l.generated,
              status: <Badge variant={l.status === 'Issued' ? 'success' : 'warning'}>{l.status}</Badge>,
              action: <Button label="Download" variant="secondary" size="sm" />,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
