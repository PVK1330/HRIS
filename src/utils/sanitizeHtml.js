import DOMPurify from 'dompurify';

// Explicit allowlist of every tag Quill's Snow theme can produce.
// Anything outside this list is stripped (its text content is kept unless it's
// in FORBID_CONTENTS — e.g. <script> content is dropped entirely by DOMPurify).
const ALLOWED_TAGS = [
  'p', 'br', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a',
  'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
  'hr',
];

// Explicit allowlist of safe attributes. Event-handler attributes (on*)
// and javascript:/data: URI schemes are blocked by DOMPurify regardless,
// but the allowlist means nothing else can slip through either.
const ALLOWED_ATTR = [
  'class', 'style',
  'href', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'colspan', 'rowspan',
  'data-list', // Quill uses this to mark bullet / ordered list items
];

// Runs once at module-load time (ES module singleton guarantee).
// Forces every surviving <a target> to be safe for cross-origin navigation.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.hasAttribute('target')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Sanitize a Quill-generated HTML string before passing it to
 * dangerouslySetInnerHTML. Strips anything outside the Quill tag/attribute
 * allowlist and blocks all script/iframe/event-handler/javascript: vectors.
 *
 * @param {string} dirty - Raw HTML from Quill or the DB.
 * @returns {string} Safe HTML ready for __html.
 */
export function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty ?? '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false, // block data-* wholesale; data-list is covered by ALLOWED_ATTR
  });
}
