// @vitest-environment happy-dom
import { authStorage } from './authStorage';

describe('authStorage.onTokenChange - Cross-tab sync', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should call callback when authToken changes in another tab', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);

    // Pre-set expiration in localStorage so the handler can read it
    localStorage.setItem('tokenExpiration', '1700000000000');

    // Simulate another tab changing the token via StorageEvent
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: 'new-token-from-other-tab',
        oldValue: 'old-token',
        storageArea: localStorage,
      }),
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      'new-token-from-other-tab',
      '1700000000000',
    );

    unsubscribe();
  });

  it('should call callback with null when rememberMe is cleared (logout from another tab)', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'rememberMe',
        newValue: null,
        oldValue: 'true',
        storageArea: localStorage,
      }),
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, null);

    unsubscribe();
  });

  it('should NOT call callback for unrelated storage keys', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'someOtherKey',
        newValue: 'value',
        oldValue: null,
        storageArea: localStorage,
      }),
    );

    expect(callback).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('should stop listening after unsubscribe', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);

    unsubscribe();

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: 'new-token',
        oldValue: null,
        storageArea: localStorage,
      }),
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle token being set to null (token removed)', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: null,
        oldValue: 'old-token',
        storageArea: localStorage,
      }),
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(null, null);

    unsubscribe();
  });

  it('should support multiple listeners simultaneously', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const unsubscribe1 = authStorage.onTokenChange(callback1);
    const unsubscribe2 = authStorage.onTokenChange(callback2);

    localStorage.setItem('tokenExpiration', '9999999999999');

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: 'new-token',
        oldValue: null,
        storageArea: localStorage,
      }),
    );

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    unsubscribe1();
    unsubscribe2();
  });
});
