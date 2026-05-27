import { HiDocumentText, HiPencilSquare } from 'react-icons/hi2';
import { Modal } from '../ui/Modal.jsx';
import { POLICY_SECTION_FIELDS } from '../../constants/policySections.js';

export default function PolicyViewModal({
  isOpen,
  onClose,
  policy,
  loading = false,
  onEdit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showClose
      header={
        policy ? (
          <div className="flex flex-col gap-1 pr-8">
            <h2 className="text-lg font-bold text-slate-900">{policy.title}</h2>
            <p className="text-xs font-medium text-slate-500">
              {policy.category || 'Uncategorized'}
              {policy.version ? ` · v${policy.version}` : ''}
              {policy.audience ? ` · ${policy.audience}` : ''}
            </p>
          </div>
        ) : (
          <h2 className="text-lg font-bold text-slate-900 pr-8">Policy details</h2>
        )
      }
    >
      {loading || !policy ? (
        <div className="flex items-center justify-center py-16 text-sm font-medium text-slate-500">
          Loading policy…
        </div>
      ) : (
        <>
          <div className="space-y-4 pt-1 max-h-[min(65vh,560px)] overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-3 rounded-none border border-slate-200 bg-slate-50/80 p-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                <p className="mt-1 font-semibold text-slate-800">{policy.status || 'Draft'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Effective</p>
                <p className="mt-1 font-medium text-slate-700">
                  {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ack required</p>
                <p className="mt-1 font-medium text-slate-700">{policy.ackRequired !== false ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {POLICY_SECTION_FIELDS.map((field) => {
              const text = policy.sections?.[field.key];
              if (!text?.trim()) return null;
              return (
                <div key={field.key} className="rounded-none border border-slate-200 bg-white p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                    {field.label}
                  </h4>
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                    {text}
                  </p>
                </div>
              );
            })}

            {!POLICY_SECTION_FIELDS.some((f) => policy.sections?.[f.key]?.trim()) && (
              <p className="rounded-none border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
                No content sections have been added yet.
              </p>
            )}

            {policy.attachments?.length > 0 && (
              <div className="rounded-none border border-slate-200 bg-white p-4">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Attachments</h4>
                <ul className="space-y-2">
                  {policy.attachments.map((a, i) => (
                    <li key={i}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline"
                      >
                        <HiDocumentText className="h-4 w-4" />
                        {a.name || 'Download'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56]"
              >
                <HiPencilSquare className="h-4 w-4" />
                Edit policy
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
