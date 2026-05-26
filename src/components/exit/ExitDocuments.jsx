import { useState } from 'react'
import { HiDocumentText, HiArrowDownTray } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Badge } from '../ui/Badge.jsx'
import { Button } from '../ui/Button.jsx'
import { generateExitDocument } from '../../services/exitManagementService.js'

const BASE_DOCUMENTS = [
  { type: 'Relieving Letter', title: 'Relieving Letter' },
  { type: 'Experience Letter', title: 'Experience Letter' },
  { type: 'Final Payslip', title: 'Final Payslip' },
]

const TERMINATION_DOCUMENTS = [
  ...BASE_DOCUMENTS,
  { type: 'Termination Letter', title: 'Termination Letter' },
]

export default function ExitDocuments({ exitRequestId, exitType, documents, onGenerated, canGenerate }) {
  const [generatingType, setGeneratingType] = useState(null)

  const docTypes = exitType === 'termination' ? TERMINATION_DOCUMENTS : BASE_DOCUMENTS

  const getExistingDoc = (type) => {
    return (documents || []).find((d) => d.document_type === type)
  }

  const handleGenerate = async (docType, docTitle) => {
    setGeneratingType(docType)
    try {
      await generateExitDocument(exitRequestId, {
        document_type: docType,
        document_title: docTitle,
      })
      toast.success(`${docTitle} generated successfully`)
      onGenerated?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to generate ${docTitle}`)
    } finally {
      setGeneratingType(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Exit Documents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docTypes.map(({ type, title }) => {
          const existing = getExistingDoc(type)
          const isGenerating = generatingType === type

          return (
            <div
              key={type}
              className="rounded-none border border-gray-200 bg-white p-4 flex flex-col items-center text-center gap-3"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                existing ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <HiDocumentText className="h-6 w-6" />
              </div>

              <h4 className="text-sm font-semibold text-gray-800">{title}</h4>

              {existing ? (
                <div className="flex flex-col items-center gap-2">
                  <Badge label="Generated" color="green" />
                  {existing.file_url && (
                    <a
                      href={existing.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#004CA5] hover:underline"
                    >
                      <HiArrowDownTray className="h-3.5 w-3.5" />
                      Download
                    </a>
                  )}
                </div>
              ) : (
                <Button
                  label="Generate"
                  variant="secondary"
                  size="sm"
                  icon={isGenerating ? undefined : HiDocumentText}
                  loading={isGenerating}
                  disabled={!canGenerate || isGenerating}
                  onClick={() => handleGenerate(type, title)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
