import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HiDocumentText,
  HiCheckCircle,
  HiClock,
  HiMagnifyingGlass,
  HiChevronRight,
  HiArrowDownTray,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { policyService } from '../../../services/policyService.js';
import { POLICY_SECTION_FIELDS } from '../../../constants/policySections.js';

function statusBadge(status) {
  if (status === 'Acknowledged') return <Badge label="Acknowledged" color="green" />;
  if (status === 'Pending') return <Badge label="Pending" color="orange" />;
  return <Badge label="Not Applicable" color="gray" />;
}

export default function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ackLoading, setAckLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await policyService.listMine();
      setPolicies(data);
    } catch {
      toast.error('Failed to load your policies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = policies;
    if (filter === 'pending') list = list.filter((p) => p.ackStatus === 'Pending');
    if (filter === 'done') list = list.filter((p) => p.ackStatus === 'Acknowledged');
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((p) => `${p.title} ${p.category}`.toLowerCase().includes(query));
    }
    return list;
  }, [policies, q, filter]);

  const pendingCount = policies.filter((p) => p.ackStatus === 'Pending').length;

  const openDetail = async (policy) => {
    try {
      const full = await policyService.getMine(policy.id);
      setSelected(full);
      setDetailOpen(true);
    } catch {
      toast.error('Could not load policy details');
    }
  };

  const handleAcknowledge = async () => {
    if (!selected?.id) return;
    setAckLoading(true);
    try {
      await policyService.acknowledge(selected.id);
      toast.success('Policy acknowledged');
      setDetailOpen(false);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Acknowledgement failed');
    } finally {
      setAckLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            My Policies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review company policies assigned to you and record your acknowledgement.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
            {pendingCount} acknowledgement{pendingCount === 1 ? '' : 's'} pending
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total assigned', value: policies.length, icon: HiDocumentText, bg: 'bg-[#0F172A]' },
          { label: 'Pending', value: pendingCount, icon: HiClock, bg: 'bg-[#F59E0B]' },
          {
            label: 'Acknowledged',
            value: policies.filter((p) => p.ackStatus === 'Acknowledged').length,
            icon: HiCheckCircle,
            bg: 'bg-[#10B981]',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-none border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center text-white ${card.bg}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {card.label}
              </div>
              <div className="text-xl font-black text-slate-900">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-none border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Search
            </label>
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or category…"
                className="w-full border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm focus:border-[#0F766E] focus:outline-none"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm focus:border-[#0F766E] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending only</option>
              <option value="done">Acknowledged</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No policies to show"
          description={
            filter === 'pending'
              ? 'You have no pending acknowledgements. Great work!'
              : 'There are no published policies assigned to you at this time.'
          }
          icon={HiDocumentText}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((policy) => (
            <button
              key={policy.id}
              type="button"
              onClick={() => openDetail(policy)}
              className="flex w-full items-center gap-4 rounded-none border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#0F766E]/40 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#0F766E]/10 text-[#0F766E]">
                <HiDocumentText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{policy.title}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {policy.category}
                  {policy.version ? ` · v${policy.version}` : ''}
                </div>
                {policy.effectiveDate && (
                  <div className="mt-1 text-[10px] text-slate-400">
                    Effective {new Date(policy.effectiveDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {statusBadge(policy.ackStatus)}
                <HiChevronRight className="h-5 w-5 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelected(null);
        }}
        title={selected?.title || 'Policy'}
        size="xl"
      >
        {selected && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-3">
              {statusBadge(selected.ackStatus)}
              <span className="text-xs text-slate-500">{selected.category}</span>
              {selected.audience && (
                <span className="text-xs text-slate-400">· {selected.audience}</span>
              )}
            </div>

            {POLICY_SECTION_FIELDS.map((field) => {
              const text = selected.sections?.[field.key];
              if (!text?.trim()) return null;
              return (
                <div key={field.key} className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#0F766E]">
                    {field.label}
                  </h4>
                  <div className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 leading-relaxed">
                    {text}
                  </div>
                </div>
              );
            })}

            {selected.attachments?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Attachments
                </h4>
                <div className="space-y-2">
                  {selected.attachments.map((a, i) => (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#0F766E] hover:bg-slate-50"
                    >
                      <HiArrowDownTray className="h-4 w-4" />
                      {a.name || 'Download'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selected.ackStatus === 'Pending' && selected.ackRequired && (
              <div className="sticky bottom-0 border-t border-slate-100 bg-white pt-4">
                <p className="mb-3 text-xs text-slate-500">
                  By clicking below, you confirm that you have read and understood this policy.
                </p>
                <Button
                  label={ackLoading ? 'Submitting…' : 'I acknowledge this policy'}
                  variant="primary"
                  icon={HiCheckCircle}
                  onClick={handleAcknowledge}
                  disabled={ackLoading}
                  className="w-full sm:w-auto"
                />
              </div>
            )}

            {selected.ackStatus === 'Acknowledged' && selected.acknowledgedAt && (
              <p className="text-sm text-emerald-700 font-medium">
                Acknowledged on {new Date(selected.acknowledgedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
