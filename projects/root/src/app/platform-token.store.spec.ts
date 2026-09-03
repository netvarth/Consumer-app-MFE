import { PlatformTokenStore } from '@consumer/cross-tenant';

describe('PlatformTokenStore', () => {
  let store: PlatformTokenStore;

  beforeEach(() => {
    store = new PlatformTokenStore();
    localStorage.clear();
    delete window.AndroidBridge;
    delete window.Android;
  });

  afterEach(() => {
    delete window.AndroidBridge;
    delete window.Android;
  });

  it('saves, reads, updates, and clears the browser fallback', () => {
    store.save('P1');
    expect(store.get()).toBe('P1');
    store.update('P2');
    expect(store.get()).toBe('P2');
    store.clear();
    expect(store.get()).toBeNull();
  });

  it('prefers AndroidBridge and reads its current value at point of use', () => {
    let nativeValue: string | null = null;
    window.AndroidBridge = {
      storePlatformToken: jasmine.createSpy('store').and.callFake((value) => nativeValue = value),
      updatePlatformToken: jasmine.createSpy('update').and.callFake((value) => nativeValue = value),
      getPlatformToken: jasmine.createSpy('get').and.callFake(() => nativeValue),
      clearPlatformToken: jasmine.createSpy('clear').and.callFake(() => nativeValue = null)
    };
    store.save('native-1');
    expect(store.get()).toBe('native-1');
    nativeValue = 'native-2';
    expect(store.get()).toBe('native-2');
    store.clear();
    expect(window.AndroidBridge.clearPlatformToken).toHaveBeenCalled();
    expect(store.get()).toBeNull();
    expect(localStorage.getItem('platform_token')).toBeNull();
  });

  it('uses the older Android object when it has the required methods', () => {
    window.Android = {
      storePlatformToken: jasmine.createSpy('store'),
      updatePlatformToken: jasmine.createSpy('update'),
      getPlatformToken: jasmine.createSpy('get').and.returnValue('old-shell'),
      clearPlatformToken: jasmine.createSpy('clear')
    };
    expect(store.get()).toBe('old-shell');
    store.save('P');
    expect(window.Android.storePlatformToken).toHaveBeenCalledWith('P');
  });

  it('falls back safely when an Android object has no platform-token methods', () => {
    window.AndroidBridge = {};
    store.save('browser');
    expect(store.get()).toBe('browser');
  });

  it('uses one browser backend when the native bridge is partial', () => {
    window.AndroidBridge = {
      getPlatformToken: jasmine.createSpy('get').and.returnValue('stale-native')
    };
    store.save('browser');
    expect(store.get()).toBe('browser');
    expect(window.AndroidBridge.getPlatformToken).not.toHaveBeenCalled();
  });
});
