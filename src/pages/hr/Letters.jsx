import { useState } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { HiArrowDown, HiEye, HiSparkles } from 'react-icons/hi2'

export default function Letters() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [letterType, setLetterType] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [notes, setNotes] = useState('')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState(null)
  
  const [recentLetters, setRecentLetters] = useState([
    { id: 1, employee: 'Priti Gupta', type: 'Confirmation Letter', generated: '01 Apr 2026', status: 'Issued' },
    { id: 2, employee: 'Anita Nair', type: 'Experience Letter', generated: '28 Mar 2026', status: 'Issued' },
    { id: 3, employee: 'Vijay More', type: 'Offer Letter', generated: '15 Jan 2026', status: 'Issued' },
    { id: 4, employee: 'Rohit Shah', type: 'Salary Certificate', generated: '10 Mar 2026', status: 'Pending Sign' },
  ])

  const handleGenerate = () => {
    if (!selectedEmployee || !letterType) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select an employee and letter type.',
        timer: 2000,
        showConfirmButton: false
      })
      return
    }
    
    setSelectedLetter({
      employee: selectedEmployee,
      type: letterType,
      effectiveDate,
      notes
    })
    setPreviewModalOpen(true)
  }
  
  const handleSaveDraft = () => {
    Swal.fire({
      icon: 'info',
      title: 'Draft Saved',
      text: 'Letter draft has been saved.',
      timer: 2000,
      showConfirmButton: false
    })
  }
  
  const handleDownload = (letter) => {
    Swal.fire({
      icon: 'success',
      title: 'Downloading...',
      text: `${letter.type} is being downloaded.`,
      timer: 2000,
      showConfirmButton: false
    })
  }
  
  const handleView = (letter) => {
    setSelectedLetter(letter)
    setPreviewModalOpen(true)
  }
  
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false)
    setSelectedLetter(null)
  }
  
  const handleConfirmGenerate = () => {
    setRecentLetters((prev) => [{
      id: recentLetters.length + 1,
      employee: selectedLetter.employee,
      type: selectedLetter.type,
      generated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending Sign'
    }, ...prev])
    
    handleClosePreviewModal()
    setSelectedEmployee('')
    setLetterType('')
    setEffectiveDate('')
    setNotes('')
    
    Swal.fire({
      icon: 'success',
      title: 'Letter Generated!',
      text: 'Letter has been generated successfully.',
      timer: 2000,
      showConfirmButton: false
    })
  }

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
              <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Additional Notes</label>
              <textarea
                rows={2}
                placeholder="Any specific clauses or remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button label="Generate & Preview" variant="primary" icon={HiSparkles} onClick={handleGenerate} />
              <Button label="Save Draft" variant="secondary" icon={HiArrowDown} onClick={handleSaveDraft} />
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
              status: <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.status === 'Issued' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{l.status}</span>,
              action: (
                <div className="flex gap-2">
                  <Button label="View" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(l)} />
                  <Button label="Download" variant="secondary" size="sm" icon={HiArrowDown} onClick={() => handleDownload(l)} />
                </div>
              ),
            }))}
          />
        </div>
      </div>

      <Modal isOpen={previewModalOpen} onClose={handleClosePreviewModal} title="Letter Preview" size="lg">
        {selectedLetter && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedLetter.type}</h3>
              <p className="text-sm text-gray-500">To: {selectedLetter.employee}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>This is to certify that <strong>{selectedLetter.employee}</strong> has been working with our organization.</p>
              <p>Letter Type: <strong>{selectedLetter.type}</strong></p>
              {selectedLetter.effectiveDate && <p>Effective Date: <strong>{selectedLetter.effectiveDate}</strong></p>}
              {selectedLetter.notes && <p>Notes: <strong>{selectedLetter.notes}</strong></p>}
              <p className="mt-4">This letter is generated for official purposes and is valid as per company records.</p>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button label="Confirm & Generate" variant="primary" onClick={handleConfirmGenerate} />
              <Button label="Cancel" variant="ghost" onClick={handleClosePreviewModal} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
