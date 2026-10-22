import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeToFragment } from './sanitize';

const render = (html) => {
  const host = document.createElement('div');
  host.replaceChildren(sanitizeToFragment(html));
  return host;
};

describe('sanitizeToFragment', () => {
  it('keeps the formatting the model is asked for', () => {
    const host = render('<p>Hello <strong>world</strong></p><ul><li>One</li><li>Two</li></ul>');
    expect(host.innerHTML).toBe('<p>Hello <strong>world</strong></p><ul><li>One</li><li>Two</li></ul>');
  });

  it('removes a script element with its content', () => {
    const host = render('<p>ok</p><script>alert(1)</script>');
    expect(host.innerHTML).not.toContain('script');
    expect(host.innerHTML).not.toContain('alert(1)');
    expect(host.textContent).toContain('ok');
  });

  it('removes event handler attributes', () => {
    const host = render('<p onclick="alert(1)">text</p>');
    expect(host.innerHTML).not.toContain('onclick');
    expect(host.textContent).toContain('text');
  });

  it('removes an image with an error handler', () => {
    const host = render('<img src=x onerror=alert(1)>');
    expect(host.innerHTML).not.toContain('onerror');
    expect(host.innerHTML).not.toContain('<img');
  });

  it('removes iframes and other embedded content', () => {
    const host = render('<iframe src="https://evil.example"></iframe><p>after</p>');
    expect(host.innerHTML).not.toContain('iframe');
    expect(host.textContent).toContain('after');
  });

  it('drops javascript: links but keeps the text', () => {
    const host = render('<a href="javascript:alert(1)">click</a>');
    expect(host.innerHTML).not.toContain('javascript:');
    expect(host.textContent).toContain('click');
  });

  it('keeps safe links and hardens them', () => {
    const host = render('<a href="https://example.com">link</a>');
    expect(host.innerHTML).toContain('href="https://example.com"');
    expect(host.innerHTML).toContain('rel="noopener noreferrer"');
  });

  it('unwraps unknown elements but keeps their text', () => {
    const host = render('<section>hello</section>');
    expect(host.innerHTML).not.toContain('<section');
    expect(host.textContent).toContain('hello');
  });

  it('returns an empty fragment for empty input', () => {
    expect(render('').innerHTML).toBe('');
    expect(render(null).innerHTML).toBe('');
    expect(render(undefined).innerHTML).toBe('');
  });
});

describe('escapeHtml', () => {
  it('escapes the characters that would start a tag', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
});
