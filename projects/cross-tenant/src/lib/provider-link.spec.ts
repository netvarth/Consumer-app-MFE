import { validatedProviderLink } from './provider-link';

describe('validatedProviderLink', () => {
  it('resolves account-only links on the current origin and application base', () => {
    expect(validatedProviderLink('/sugarandspice', 'https://scale.jaldee.com', '/capp/'))
      .toBe('https://scale.jaldee.com/capp/sugarandspice');
    expect(validatedProviderLink('/chotaboss', 'http://localhost:4200', '/'))
      .toBe('http://localhost:4200/chotaboss');
    expect(validatedProviderLink('/sugarandspice', 'https://app.example', '/apps/consumer/'))
      .toBe('https://app.example/apps/consumer/sugarandspice');
  });

  it('accepts resolved account roots and rejects account deep links', () => {
    expect(validatedProviderLink('https://app.example/provider', 'https://app.example', '/'))
      .toBe('https://app.example/provider');
    for (const path of ['/provider/orders', '//evil.example/provider', '/provider#token', '/provider?token=secret']) {
      expect(validatedProviderLink(path, 'https://app.example', '/capp/')).toBeNull();
    }
  });

  it('accepts a provider URL on the current application origin', () => {
    const value = 'https://app.example.com/capp/provider?inst_id=34&app_id=76';
    expect(validatedProviderLink(value, 'https://app.example.com')).toBe(value);
  });

  it('accepts a secure Jaldee provider URL from local or another environment', () => {
    const value = 'https://scale.jaldee.com/capp/sugarandspice?inst_id=34&app_id=76';
    expect(validatedProviderLink(value, 'http://localhost:4200')).toBe(value);
  });

  it('accepts a canonical provider URL without legacy installation parameters', () => {
    const value = 'https://scale.jaldee.com/capp/sugarandspice';
    expect(validatedProviderLink(value, 'http://localhost:4200')).toBe(value);
  });

  it('honors localhost provider links across ports and from the Scale hub', () => {
    const value = 'http://localhost:4300/capp/sugarandspice?inst_id=34&app_id=76';
    expect(validatedProviderLink(value, 'http://localhost:4507')).toBe(value);
    expect(validatedProviderLink(value, 'https://scale.jaldee.com')).toBe(value);
  });

  it('allows explicit loopback addresses but rejects hosts impersonating localhost', () => {
    for (const host of ['127.0.0.1', '[::1]']) {
      const value = `http://${host}:4300/capp/provider`;
      expect(validatedProviderLink(value, 'https://scale.jaldee.com')).toBe(value);
    }
    expect(validatedProviderLink('http://localhost.evil.example/capp/provider', 'https://scale.jaldee.com')).toBeNull();
  });

  it('extracts the localhost destination from a Markdown link stored in JSON', () => {
    const url = 'http://localhost:4300/capp/sugarandspice';
    expect(validatedProviderLink(`[${url}](${url})`, 'https://scale.jaldee.com')).toBe(url);
    expect(validatedProviderLink(` [Open provider](${url}?inst_id=34&app_id=76) `, 'https://scale.jaldee.com'))
      .toBe(`${url}?inst_id=34&app_id=76`);
  });

  it('validates the Markdown destination rather than trusting its label', () => {
    const label = 'http://localhost:4300/capp/provider';
    for (const target of [
      'https://evil.example/capp/provider',
      'javascript:alert(1)',
      'http://user:pass@localhost:4300/capp/provider',
      'http://localhost:4300/capp/provider#token'
    ]) {
      expect(validatedProviderLink(`[${label}](${target})`, 'https://scale.jaldee.com')).toBeNull();
    }
  });

  it('rejects external, insecure, and malformed provider URLs', () => {
    expect(validatedProviderLink(
      'https://example.com/capp/provider?inst_id=34&app_id=76',
      'https://scale.jaldee.com'
    )).toBeNull();
    expect(validatedProviderLink(
      'http://scale.jaldee.com/capp/provider?inst_id=34&app_id=76',
      'https://scale.jaldee.com'
    )).toBeNull();
    expect(validatedProviderLink(
      'https://scale.jaldee.com/capp/provider/unsupported-path',
      'https://scale.jaldee.com'
    )).toBeNull();
  });

  it('rejects credentials and fragments in provider URLs', () => {
    expect(validatedProviderLink('https://user:pass@scale.jaldee.com/capp/provider')).toBeNull();
    expect(validatedProviderLink('https://scale.jaldee.com/capp/provider#token')).toBeNull();
  });
});
