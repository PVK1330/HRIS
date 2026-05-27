import { useEffect, useState } from 'react';
import {
  HiDocumentText,
  HiShieldCheck,
  HiPencilSquare,
  HiPlus,
} from 'react-icons/hi2';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { POLICY_SECTION_FIELDS } from '../../constants/policySections.js';

const LABEL_CLS = 'mb-1 block text-sm font-medium text-slate-800';
const INPUT_CLS = 'h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20';
const TEXTAREA_CLS =
  'w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20';

const CONTENT_TABS = [
  { id: 'overview', label: 'Overview', keys: ['introduction', 'purpose', 'scope'] },
  { id: 'rules', label: 'Rules', keys: ['definitions', 'rulesAndProcedures'] },
  { id: 'support', label: 'Examples & FAQs', keys: ['examples', 'faqs', 'exceptions', 'contactPerson'] },
];

export default function PolicyFormModal({
  isOpen,
  onClose,
  editMode,
  formData,
  setFormData,
  categories,
  updateSection,
  onSaveDraft,
  onPublish,
  onManageAttachments,
  saving = false,
}) {
  const [contentTab, setContentTab] = useState('overview');

  useEffect(() => {
    if (isOpen) setContentTab('overview');
  }, [isOpen, editMode]);

  const activeTab = CONTENT_TABS.find((t) => t.id === contentTab) || CONTENT_TABS[0];
  const activeFields = POLICY_SECTION_FIELDS.filter((f) => activeTab.keys.includes(f.key));

  const categoryOptions =
    categories.length > 0
      ? categories.map((c) => ({ label: c.name, value: c.name }))
      : [{ label: 'Uncategorized', value: '' }];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showClose
      header={
        <div className="flex flex-col gap-1 pr-8">
          <h2 className="text-lg font-bold text-slate-900">
            {editMode ? 'Edit Policy' : 'Add New Policy'}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Enter policy details first, then add content by section using the tabs below.
          </p>
        </div>
      }
    >
      <div className="max-h-[min(68vh,620px)] overflow-y-auto pr-1 -mr-1">
        <div className="flex flex-col gap-6">
          <section className="rounded-none border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] border-l-2 border-[#0F766E] pl-2">
              Policy details
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Policy title"
                placeholder="e.g. Work from home policy"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                inputClassName={INPUT_CLS}
                labelClassName={LABEL_CLS}
              />
              <Input
                label="Category"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Select category"
                options={categoryOptions}
                inputClassName={INPUT_CLS}
                labelClassName={LABEL_CLS}
              />
              <Input
                label="Version"
                placeholder="1.0"
                value={formData.version || '1.0'}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                inputClassName={INPUT_CLS}
                labelClassName={LABEL_CLS}
              />
              <div>
                <label className={LABEL_CLS}>Effective date</label>
                <input
                  type="date"
                  value={formData.effectiveDate || ''}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className={`w-full ${INPUT_CLS} px-3`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Review date</label>
                <input
                  type="date"
                  value={formData.reviewDate || ''}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  className={`w-full ${INPUT_CLS} px-3`}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={formData.ackRequired !== false}
                  onChange={(e) => setFormData({ ...formData, ackRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0F766E]"
                />
                <span className="text-sm font-medium text-slate-700">Acknowledgement required</span>
              </label>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <HiDocumentText className="h-5 w-5 shrink-0 text-[#0F766E]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">Attachments</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {formData.attachments?.length || 0} file(s) linked
                  </p>
                  <button
                    type="button"
                    onClick={onManageAttachments}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline"
                  >
                    <HiPlus className="h-3.5 w-3.5" />
                    Manage attachments
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] border-l-2 border-[#0F766E] pl-2">
              Policy content
            </p>

            <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-0">
              {CONTENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setContentTab(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                    contentTab === tab.id
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 rounded-none border border-slate-200 bg-white p-4 sm:p-5">
              {activeFields.map((field) => (
                <div key={field.key}>
                  <label className={LABEL_CLS}>{field.label}</label>
                  <textarea
                    className={TEXTAREA_CLS}
                    placeholder={field.placeholder}
                    value={formData.sections?.[field.key] || ''}
                    onChange={(e) => updateSection(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSaveDraft}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <HiPencilSquare className="h-4 w-4" />
          Save draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onPublish}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0d5c56] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <HiShieldCheck className="h-4 w-4" />
          {saving ? 'Saving…' : 'Publish'}
        </button>
      </div>
    </Modal>
  );
}
