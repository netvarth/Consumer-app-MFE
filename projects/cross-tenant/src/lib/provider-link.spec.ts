import { validatedProviderLink } from './provider-link';

describe('validatedProviderLink', () => {
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
