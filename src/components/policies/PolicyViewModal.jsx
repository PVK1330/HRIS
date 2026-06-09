import { useLayoutEffect, useRef } from 'react';
import {
  HiDocumentText,
  HiPencilSquare,
  HiCheckCircle,
  HiClock,
  HiPaperClip,
} from 'react-icons/hi2';
import { Modal } from '../ui/Modal.jsx';
import { POLICY_SECTION_FIELDS } from '../../constants/policySections.js';

/**
 * Read-only textarea that auto-grows to fit its content, so it never shows its
 * own scrollbar — the modal's single body scroll handles overflow instead.
 */
function ReadOnlyTextarea({ value }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      readOnly
      value={value}
      className="w-full resize-none overflow-hidden rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium leading-relaxed text-slate-700 outline-none"
    />
  );
}

const STATUS_STYLES = {
  Published: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-amber-100 text-amber-700',
  Archived: 'bg-slate-200 text-slate-600',
};

const ACK_STYLES = {
  Acknowledged: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'Not Applicable': 'bg-slate-50 text-slate-500 ring-slate-200',
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

function StatusPill({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status || 'Draft'}
    </span>
  );
}

function AckPill({ status }) {
  const cls = ACK_STYLES[status] || 'bg-slate-50 text-slate-500 ring-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>
      {status}
    </span>
  );
}

function MetaCell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default function PolicyViewModal({ isOpen, onClose, policy, tracking = [], loading = false, onEdit }) {
  const records = Array.isArray(tracking) ? tracking : [];
  const applicable = records.filter((r) => r.status !== 'Not Applicable');
  const acked = records.filter((r) => r.status === 'Acknowledged');
  const pending = records.filter((r) => r.status === 'Pending');
  const pct = applicable.length ? Math.round((acked.length / applicable.length) * 100) : 0;
  const ackRequired = policy?.ackRequired !== false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showClose
      header={
        policy ? (
          <div className="flex flex-col gap-1.5 pr-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{policy.title}</h2>
              <StatusPill status={policy.status} />
              {policy.archivedAt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  Archived
                </span>
              )}
            </div>
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
          <div className="space-y-4 pt-1">
            {/* Metadata */}
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-3">
              <MetaCell label="Status" value={policy.status || 'Draft'} />
              <MetaCell label="Version" value={policy.version ? `v${policy.version}` : '—'} />
              <MetaCell label="Audience" value={policy.audience} />
              <MetaCell label="Effective" value={fmtDate(policy.effectiveDate)} />
              <MetaCell label="Review by" value={fmtDate(policy.reviewDate)} />
              <MetaCell label="Ack required" value={ackRequired ? 'Yes' : 'No'} />
            </div>

            {/* Acknowledgements — who accepted the policy */}
            {ackRequired && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Acknowledgements</h4>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                      <HiCheckCircle className="h-3.5 w-3.5" />
                      {acked.length} accepted
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                      <HiClock className="h-3.5 w-3.5" />
                      {pending.length} pending
                    </span>
                  </div>
                </div>

                <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>{acked.length} of {applicable.length} employees</span>
                  <span>{pct}%</span>
                </div>
                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>

                {records.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-xs text-slate-500">
                    No acknowledgement records yet.
                  </p>
                ) : (
                  <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-100">
                    {records.map((r) => (
                      <div key={r.employee_id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-600">
                            {(r.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{r.full_name || '—'}</p>
                            <p className="truncate text-[11px] text-slate-400">
                              {[r.emp_id, r.department].filter(Boolean).join(' · ') || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                          <AckPill status={r.status} />
                          {r.acknowledged_at && (
                            <span className="text-[10px] text-slate-400">Accepted {fmtDate(r.acknowledged_at)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content sections — read-only textareas, auto-sized to content (resizable). */}
            {POLICY_SECTION_FIELDS.map((field) => {
              const text = policy.sections?.[field.key];
              if (!text?.trim()) return null;
              return (
                <div key={field.key} className="rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#0F766E]">{field.label}</h4>
                  <ReadOnlyTextarea value={text} />
                </div>
              );
            })}

            {!POLICY_SECTION_FIELDS.some((f) => policy.sections?.[f.key]?.trim()) && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
                No content sections have been added yet.
              </p>
            )}

            {/* Attachments */}
            {policy.attachments?.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <HiPaperClip className="h-4 w-4" />
                  Attachments
                </h4>
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
