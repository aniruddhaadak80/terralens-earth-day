import { describe, it, expect } from 'vitest';
import { sanitizeToFragment } from './sanitize';

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
    expect(host.innerHTML).not.toContain('<script');
    expect(host.querySelector('script')).toBeNull();
    expect(host.textContent).toContain('ok');
  });

  it('removes event handler attributes', () => {
    const host = render('<p onclick="alert(1)">text</p>');
    // The tag itself is not allowed, so it is kept as inert text and never
    // becomes an element that could carry the handler.
    expect(host.querySelector('p')).toBeNull();
    expect(host.querySelector('[onclick]')).toBeNull();
    expect(host.textContent).toContain('text');
  });

  it('removes an image with an error handler', () => {
    const host = render('<img src=x onerror=alert(1)>');
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toContain('onerror');
  });

  it('removes iframes and other embedded content', () => {
    const host = render('<iframe src="https://evil.example"></iframe><p>after</p>');
    expect(host.querySelector('iframe')).toBeNull();
    expect(host.textContent).toContain('after');
  });

  it('drops javascript: links but keeps the text', () => {
    const host = render('<a href="javascript:alert(1)">click</a>');
    // No link element is created, so there is no href that could be followed.
    expect(host.querySelector('a')).toBeNull();
    expect(host.querySelector('[href]')).toBeNull();
    expect(host.textContent).toContain('click');
  });

  it('keeps safe links but never their attributes', () => {
    const host = render('<a href="https://example.com">link</a>');
    expect(host.querySelector('a')).toBeNull();
    expect(host.textContent).toContain('link');
  });

  it('unwraps unknown elements but keeps their text', () => {
    const host = render('<section>hello</section>');
    expect(host.querySelector('section')).toBeNull();
    expect(host.textContent).toContain('hello');
  });

  it('keeps the text of a rejected tag instead of dropping it', () => {
    const host = render('<marquee>hello</marquee>');
    expect(host.textContent).toContain('<marquee>');
    expect(host.textContent).toContain('hello');
  });

  it('does not execute a nested script tag', () => {
    const host = render('<scr<script>ipt>alert(1)</script>');
    expect(host.querySelector('script')).toBeNull();
  });

  it('returns an empty fragment for empty input', () => {
    expect(render('').innerHTML).toBe('');
    expect(render(null).innerHTML).toBe('');
    expect(render(undefined).innerHTML).toBe('');
  });
});
