import { authStorage } from './authStorage';

const createStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
};

const installStorageMocks = () => {
  const localStorageMock = createStorageMock();
  const sessionStorageMock = createStorageMock();

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: sessionStorageMock,
    configurable: true,
  });
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    configurable: true,
  });
};

describe('authStorage.onTokenChange - Cross-tab sync', () => {
  beforeEach(() => {
    installStorageMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should prefer sessionStorage when rememberMe is disabled', () => {
    localStorage.setItem('authToken', 'stale-local-token');
    localStorage.setItem('tokenExpiration', '1000');
    sessionStorage.setItem('authToken', 'current-session-token');
    sessionStorage.setItem('tokenExpiration', '2000');

    expect(authStorage.getToken()).toBe('current-session-token');
    expect(authStorage.getTokenExpiration()).toBe('2000');
  });

  it('should prefer localStorage when rememberMe is enabled', () => {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('authToken', 'remembered-token');
    localStorage.setItem('tokenExpiration', '3000');
    sessionStorage.setItem('authToken', 'session-token');
    sessionStorage.setItem('tokenExpiration', '4000');

    expect(authStorage.getToken()).toBe('remembered-token');
    expect(authStorage.getTokenExpiration()).toBe('3000');
  });

  it('should clear stale localStorage session when saving a non-remembered session', () => {
    localStorage.setItem('authToken', 'stale-local-token');
    localStorage.setItem('tokenExpiration', '1000');

    authStorage.setSession('new-session-token', '2000');

    expect(sessionStorage.getItem('authToken')).toBe('new-session-token');
    expect(sessionStorage.getItem('tokenExpiration')).toBe('2000');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('tokenExpiration')).toBeNull();
  });

  it('should clear stale sessionStorage session when saving a remembered session', () => {
    localStorage.setItem('rememberMe', 'true');
    sessionStorage.setItem('authToken', 'stale-session-token');
    sessionStorage.setItem('tokenExpiration', '1000');

    authStorage.setSession('remembered-token', '2000');

    expect(localStorage.getItem('authToken')).toBe('remembered-token');
    expect(localStorage.getItem('tokenExpiration')).toBe('2000');
    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('tokenExpiration')).toBeNull();
  });

  it('should call callback when authToken changes in another tab', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);

    localStorage.setItem('rememberMe', 'true');
    // Pre-set expiration in localStorage so the handler can read it
    localStorage.setItem('tokenExpiration', '1700000000000');

    // Simulate another tab changing the token via StorageEvent
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: 'new-token-from-other-tab',
        oldValue: 'old-token',
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
      }),
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle token being set to null (token removed)', () => {
    const callback = vi.fn();
    const unsubscribe = authStorage.onTokenChange(callback);
    localStorage.setItem('rememberMe', 'true');

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: null,
        oldValue: 'old-token',
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

    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('tokenExpiration', '9999999999999');

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        newValue: 'new-token',
        oldValue: null,
      }),
    );

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    unsubscribe1();
    unsubscribe2();
  });
});
