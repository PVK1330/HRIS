import SettingsCard from '../../../../components/settings/SettingsCard.jsx'
import { Table } from '../../../../components/ui/Table.jsx'

const COLUMNS = [
  { key: 'sentAt', label: 'Sent At' },
  { key: 'to', label: 'Recipient' },
  { key: 'subject', label: 'Subject' },
  { key: 'status', label: 'Status' },
]

export default function EmailLog() {
  return (
    <SettingsCard title="Email Log">
      <p className="mb-4 text-sm text-gray-500">
        Email logs will appear here once log persistence is enabled on the backend.
      </p>
      <Table
        columns={COLUMNS}
        data={[]}
        emptyMessage="Email logs will appear here"
      />
    </SettingsCard>
  )
}
