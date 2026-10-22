/**
 * TerraLens — HTML Sanitiser
 *
 * The Gemini responses are inserted into the page, so they have to be filtered
 * first: a model answer is not a trusted source of markup, and the prompt is
 * driven by what the user types.
 *
 * The sanitiser walks the answer itself and builds the result out of real DOM
 * nodes. Nothing is ever handed to innerHTML, so there is no HTML sink that
 * untrusted text could reach.
 *
 * Rules:
 *   - only the formatting elements below may become elements,
 *   - an allowed element may not carry any attribute, so no event handler and
 *     no javascript: URL can ever be introduced,
 *   - everything else - including the text of a rejected tag - is kept as
 *     plain text, so no sentence is lost.
 */

// Elements the model is allowed to use.
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'mark',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'div', 'code', 'pre', 'blockquote', 'small', 'sub', 'sup',
]);

// Elements without a closing tag.
const VOID_TAGS = new Set(['br', 'hr']);

// A tag: "<name>", "</name>" or "<name something>".
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s[^>]*)?)>/g;

/**
 * Turn an untrusted HTML string into a DocumentFragment that is safe to add
 * to the page.
 */
export function sanitizeToFragment(html) {
  const source = String(html ?? '');
  const fragment = document.createDocumentFragment();

  if (!source.trim()) {
    return fragment;
  }

  const root = document.createElement('div');
  const stack = [root];

  const appendText = (text) => {
    if (text) {
      stack[stack.length - 1].appendChild(document.createTextNode(text));
    }
  };

  TAG_RE.lastIndex = 0;
  let index = 0;
  let match;

  while ((match = TAG_RE.exec(source)) !== null) {
    appendText(source.slice(index, match.index));
    index = match.index + match[0].length;

    const isClosing = match[1] === '/';
    const name = match[2].toLowerCase();
    const attributes = (match[3] || '').trim();

    if (!ALLOWED_TAGS.has(name) || attributes !== '') {
      // Not allowed: the markup is kept as literal text.
      appendText(match[0]);
      continue;
    }

    if (isClosing) {
      // Close the nearest matching open element.
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tagName.toLowerCase() === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const element = document.createElement(name);
    stack[stack.length - 1].appendChild(element);

    if (!VOID_TAGS.has(name)) {
      stack.push(element);
    }
  }

  appendText(source.slice(index));

  while (root.firstChild) {
    fragment.appendChild(root.firstChild);
  }

  return fragment;
}
