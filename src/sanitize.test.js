import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('keeps the formatting the model is asked for', () => {
    const html = '<p>Hello <strong>world</strong></p><ul><li>One</li><li>Two</li></ul>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('removes a script element with its content', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert(1)');
    expect(out).toContain('ok');
  });

  it('removes event handler attributes', () => {
    const out = sanitizeHtml('<p onclick="alert(1)">text</p>');
    expect(out).not.toContain('onclick');
    expect(out).toContain('text');
  });

  it('removes an image with an error handler', () => {
    const out = sanitizeHtml('<img src=x onerror=alert(1)>');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('<img');
  });

  it('removes iframes and other embedded content', () => {
    const out = sanitizeHtml('<iframe src="https://evil.example"></iframe><p>after</p>');
    expect(out).not.toContain('iframe');
    expect(out).toContain('after');
  });

  it('drops javascript: links but keeps the text', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('click');
  });

  it('keeps safe links and hardens them', () => {
    const out = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('unwraps unknown elements but keeps their text', () => {
    const out = sanitizeHtml('<section>hello</section>');
    expect(out).not.toContain('<section');
    expect(out).toContain('hello');
  });

  it('returns an empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});

describe('escapeHtml', () => {
  it('escapes the characters that would start a tag', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
});
