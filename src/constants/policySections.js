export const POLICY_SECTION_FIELDS = [
  { key: 'introduction', label: 'Policy Introduction', placeholder: 'Overview and context for this policy…' },
  { key: 'purpose', label: 'Purpose', placeholder: 'Why this policy exists…' },
  { key: 'scope', label: 'Scope', placeholder: 'Who and what this policy applies to…' },
  { key: 'definitions', label: 'Definitions', placeholder: 'Key terms and definitions…' },
  { key: 'rulesAndProcedures', label: 'Rules & Procedures', placeholder: 'Rules employees must follow…' },
  { key: 'examples', label: 'Examples', placeholder: 'Practical examples…' },
  { key: 'faqs', label: 'FAQs', placeholder: 'Frequently asked questions…' },
  { key: 'exceptions', label: 'Exceptions', placeholder: 'Exceptions to the policy…' },
  { key: 'contactPerson', label: 'Contact Person (HR representative)', placeholder: 'Name, email, or HR contact details…' },
];

export const EMPTY_POLICY_SECTIONS = Object.fromEntries(
  POLICY_SECTION_FIELDS.map((f) => [f.key, '']),
);

export const DEFAULT_AUDIENCE_CONFIG = {
  type: 'all',
  departmentIds: [],
  roleIds: [],
  newJoinersDays: 90,
};

export function audienceLabelFromConfig(config) {
  const c = config || DEFAULT_AUDIENCE_CONFIG;
  switch (c.type) {
    case 'departments':
      return 'Specific departments';
    case 'roles':
      return 'Specific roles';
    case 'new_joiners':
      return 'New joiners only';
    default:
      return 'All employees';
  }
}

export function normalizePolicyForm(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    title: row.title || '',
    category: row.category || '',
    version: row.version || '1.0',
    description: row.description || '',
    effectiveDate: row.effectiveDate || row.effective_date || '',
    reviewDate: row.reviewDate || row.review_date || '',
    ackRequired: row.ackRequired ?? row.ack_required ?? true,
    status: row.status || 'Draft',
    attachments: row.attachments || [],
    sections: { ...EMPTY_POLICY_SECTIONS, ...(row.sections || {}) },
    audienceConfig: {
      ...DEFAULT_AUDIENCE_CONFIG,
      ...(row.audienceConfig || {}),
    },
  };
}
