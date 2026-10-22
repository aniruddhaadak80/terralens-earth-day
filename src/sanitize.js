/**
 * TerraLens — HTML Sanitiser
 *
 * The Gemini responses are inserted into the page as HTML, so they have to be
 * filtered first: a model answer is not a trusted source of markup, and the
 * prompt is driven by what the user types.
 */

// Elements that may appear in a model answer.
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'HR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'MARK',
  'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'SPAN', 'DIV', 'A', 'CODE', 'PRE', 'BLOCKQUOTE', 'SMALL', 'SUB', 'SUP',
]);

// Elements that are removed together with everything inside them.
const DROP_WITH_CONTENT = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE',
  'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'SVG', 'MATH', 'TEMPLATE',
  'NOSCRIPT', 'FRAME', 'FRAMESET', 'APPLET', 'AUDIO', 'VIDEO', 'SOURCE', 'CANVAS',
]);

// Attributes that may survive on a given element.
const ALLOWED_ATTRIBUTES = {
  A: new Set(['href', 'title']),
  SPAN: new Set(['class']),
  DIV: new Set(['class']),
  P: new Set(['class']),
  LI: new Set(['class']),
  UL: new Set(['class']),
  OL: new Set(['class']),
  H1: new Set(['class']),
  H2: new Set(['class']),
  H3: new Set(['class']),
  H4: new Set(['class']),
  H5: new Set(['class']),
  H6: new Set(['class']),
  CODE: new Set(['class']),
  PRE: new Set(['class']),
  BLOCKQUOTE: new Set(['class']),
};

// Only these URL schemes may appear in an href.
const SAFE_URL = /^(https?:\/\/|mailto:|#|\/|\.\/|\.\.\/)/i;

function cleanElement(element) {
  const tag = element.tagName.toUpperCase();

  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();

    if (name.startsWith('on')) {
      element.removeAttribute(attribute.name);
      continue;
    }

    const allowed = ALLOWED_ATTRIBUTES[tag];
    if (!allowed || !allowed.has(name)) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (name === 'href' && !SAFE_URL.test(attribute.value.trim())) {
      element.removeAttribute(attribute.name);
    }
  }

  if (tag === 'A') {
    element.setAttribute('rel', 'noopener noreferrer');
    element.setAttribute('target', '_blank');
  }
}

/**
 * Return a version of `html` that is safe to insert with innerHTML.
 *
 * Unknown elements are unwrapped (their text is kept), dangerous elements
 * are removed with their content, event handler attributes are stripped and
 * links may only point at http(s), mailto or a relative path.
 */
export function sanitizeHtml(html) {
  const source = String(html ?? '');

  if (!source.trim()) {
    return '';
  }

  if (typeof DOMParser === 'undefined') {
    // No DOM available - fall back to escaping everything.
    return escapeHtml(source);
  }

  const document = new DOMParser().parseFromString(source, 'text/html');

  const clean = (node) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toUpperCase();

      if (DROP_WITH_CONTENT.has(tag)) {
        child.remove();
        continue;
      }

      if (!ALLOWED_TAGS.has(tag)) {
        // Unwrap: keep the text, drop the element.
        child.replaceWith(document.createTextNode(child.textContent ?? ''));
        continue;
      }

      cleanElement(child);
      clean(child);
    }
  };

  clean(document.body);

  return document.body.innerHTML;
}

/** Escape a string so it can be inserted as text. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
