import { useEffect, useState } from 'react';
import {
  HiDocumentText,
  HiShieldCheck,
  HiPencilSquare,
  HiPlus,
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiDownload,
} from 'react-icons/hi2';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { POLICY_SECTION_FIELDS } from '../../constants/policySections.js';

const LABEL_CLS = 'mb-1 block text-sm font-medium text-slate-800';
const INPUT_CLS = 'h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20';
const TEXTAREA_CLS =
  'w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20';

const STEPS = [
  { id: 'basic', label: 'Basic Info', description: 'Policy title & details' },
  { id: 'audience', label: 'Audience', description: 'Who should see this' },
  { id: 'content', label: 'Content', description: 'Policy sections' },
  { id: 'review', label: 'Review', description: 'Final check & publish' },
];

const CONTENT_TABS = [
  { id: 'overview', label: 'Overview', keys: ['introduction', 'purpose', 'scope'] },
  { id: 'rules', label: 'Rules', keys: ['definitions', 'rulesAndProcedures'] },
  { id: 'support', label: 'Examples & FAQs', keys: ['examples', 'faqs', 'exceptions', 'contactPerson'] },
];

export default function PolicyFormModalStepper({
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
  const [currentStep, setCurrentStep] = useState(0);
  const [contentTab, setContentTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setContentTab('overview');
    }
  }, [isOpen, editMode]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeTab = CONTENT_TABS.find((t) => t.id === contentTab) || CONTENT_TABS[0];
  const activeFields = POLICY_SECTION_FIELDS.filter((f) => activeTab.keys.includes(f.key));

  const categoryOptions =
    categories.length > 0
      ? categories.map((c) => ({ label: c.name, value: c.name }))
      : [{ label: 'Uncategorized', value: '' }];

  const canProceedToNext = () => {
    switch (STEPS[currentStep].id) {
      case 'basic':
        return formData.title && formData.category && formData.effectiveDate;
      case 'audience':
        return true;
      case 'content':
        return true;
      default:
        return true;
    }
  };

  const exportDraft = async () => {
    try {
      const dataStr = JSON.stringify(formData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `policy-draft-${formData.title || 'untitled'}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showClose
      header={
        <div className="flex flex-col gap-2 pr-8">
          <h2 className="text-lg font-bold text-slate-900">
            {editMode ? 'Edit Policy' : 'Create New Policy'}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].description}
          </p>
        </div>
      }
    >
      {/* Stepper Progress */}
      <div className="mb-6 px-6 pt-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                    idx === currentStep
                      ? 'bg-[#0F766E] text-white shadow-lg ring-2 ring-[#0F766E] ring-offset-2'
                      : idx < currentStep
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {idx < currentStep ? (
                    <HiCheckCircle className="h-5 w-5" />
                  ) : (
                    idx + 1
                  )}
                </button>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  {step.label}
                </p>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`mb-8 h-0.5 flex-1 transition-colors ${
                    idx < currentStep ? 'bg-emerald-200' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-h-[min(52vh,500px)] overflow-y-auto px-6 pb-4">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] border-l-2 border-[#0F766E] pl-2">
                Basic Information
              </p>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Policy Title *"
                  placeholder="e.g. Remote Work Policy"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  inputClassName={INPUT_CLS}
                  labelClassName={LABEL_CLS}
                />
                <Input
                  label="Category *"
                  type="select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Select category"
                  options={categoryOptions}
                  inputClassName={INPUT_CLS}
                  labelClassName={LABEL_CLS}
                />
                <Input
                  label="Short Description"
                  placeholder="Brief description of this policy..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  inputClassName={INPUT_CLS}
                  labelClassName={LABEL_CLS}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Effective Date *</label>
                    <input
                      type="date"
                      value={formData.effectiveDate || ''}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      className={`w-full ${INPUT_CLS} px-3`}
                      required
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Review Date</label>
                    <input
                      type="date"
                      value={formData.reviewDate || ''}
                      onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                      className={`w-full ${INPUT_CLS} px-3`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Version"
                    placeholder="1.0"
                    value={formData.version || '1.0'}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    inputClassName={INPUT_CLS}
                    labelClassName={LABEL_CLS}
                  />
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 mt-auto">
                    <input
                      type="checkbox"
                      checked={formData.ackRequired !== false}
                      onChange={(e) => setFormData({ ...formData, ackRequired: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 accent-[#0F766E]"
                    />
                    <span className="text-sm font-medium text-slate-700">Acknowledgement Required</span>
                  </label>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Step 2: Audience & Settings */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] border-l-2 border-[#0F766E] pl-2">
                Audience & Distribution
              </p>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-3">Who should see this policy?</p>
                  <p className="text-xs text-slate-500 mb-3">Configure audience settings after publishing this policy.</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-slate-600">Audience targeting will be available on publish</span>
                  </div>
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
              </div>
            </section>
          </div>
        )}

        {/* Step 3: Content */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <section className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] border-l-2 border-[#0F766E] pl-2">
                Policy Content
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

              <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
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
        )}

        {/* Step 4: Review & Publish */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] border-l-2 border-[#0F766E] pl-2">
                Review & Publish
              </p>

              <div className="space-y-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <HiCheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-900">Ready to publish</p>
                      <p className="text-sm text-emerald-700 mt-1">
                        Your policy is complete and ready to be published to your audience.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-700">Title</p>
                    <p className="text-slate-600 mt-1 truncate">{formData.title || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-700">Category</p>
                    <p className="text-slate-600 mt-1">{formData.category || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-700">Effective Date</p>
                    <p className="text-slate-600 mt-1">{formData.effectiveDate || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-700">Ack Required</p>
                    <p className="text-slate-600 mt-1">{formData.ackRequired ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-700 mb-3">Description</p>
                  <p className="text-sm text-slate-600">{formData.description || '(No description provided)'}</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer - Navigation & Actions */}
      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 px-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{STEPS[currentStep].label}</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedToNext() || currentStep === STEPS.length - 1}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <HiArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={exportDraft}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              title="Export draft as JSON file"
            >
              <HiDownload className="h-4 w-4" />
              Export
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onSaveDraft}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <HiPencilSquare className="h-4 w-4" />
              Save Draft
            </button>

            <button
              type="button"
              disabled={saving || currentStep !== 3}
              onClick={onPublish}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0d5c56] disabled:cursor-not-allowed disabled:opacity-60"
              title={currentStep !== 3 ? 'Complete all steps first' : 'Publish to audience'}
            >
              <HiShieldCheck className="h-4 w-4" />
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
