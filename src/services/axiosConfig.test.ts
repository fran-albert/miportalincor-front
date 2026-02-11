// @vitest-environment happy-dom
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Mock dependencies BEFORE importing the module under test
const mockDispatch = vi.fn();

let onTokenChangeCallback: ((token: string | null, expiration: string | null) => void) | null = null;

vi.mock('@/config/environment', () => ({
  environment: {
    API_INCOR_HC_URL: 'http://test-hc-api.com',
    API_INCOR_LABORAL_URL: 'http://test-laboral-api.com',
    API_TURNOS_URL: 'http://test-turnos-api.com',
  },
  currentConfig: {
    apiTimeout: 5000,
  },
}));

vi.mock('@/store/store', () => ({
  store: {
    dispatch: (...args: unknown[]) => mockDispatch(...args),
    getState: vi.fn(() => ({ auth: { token: null } })),
    subscribe: vi.fn(),
    replaceReducer: vi.fn(),
    [Symbol.observable]: vi.fn(),
  },
}));

vi.mock('@/store/authSlice', () => ({
  updateTokens: vi.fn((payload: unknown) => ({
    type: 'auth/updateTokens',
    payload,
  })),
  logout: vi.fn(() => ({ type: 'auth/logout' })),
}));

vi.mock('@/hooks/Toast/toast-context', () => ({
  TOAST_EVENT: 'toast-event',
  ToastEventDetail: {},
}));

// Mock authStorage to capture the onTokenChange callback
vi.mock('@/utils/authStorage', () => ({
  authStorage: {
    getToken: vi.fn(() => localStorage.getItem('authToken')),
    setToken: vi.fn(),
    removeToken: vi.fn(),
    getTokenExpiration: vi.fn(() => localStorage.getItem('tokenExpiration')),
    setTokenExpiration: vi.fn(),
    clearAll: vi.fn(),
    setSession: vi.fn(),
    setRememberMe: vi.fn(),
    getRememberMe: vi.fn(() => localStorage.getItem('rememberMe') === 'true'),
    onTokenChange: vi.fn((cb: (token: string | null, expiration: string | null) => void) => {
      onTokenChangeCallback = cb;
      return () => { onTokenChangeCallback = null; };
    }),
  },
}));

describe('axiosConfig - Cross-tab token sync', () => {
  beforeAll(async () => {
    // Import axiosConfig to trigger the module-level onTokenChange subscription
    await import('./axiosConfig');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should register onTokenChange listener on module load', () => {
    expect(onTokenChangeCallback).not.toBeNull();
  });

  it('should dispatch updateTokens when another tab updates the token', async () => {
    const { updateTokens } = await import('@/store/authSlice');

    // Simulate the callback firing (as if another tab changed the token)
    onTokenChangeCallback!('new-token-from-other-tab', '1700000000000');

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateTokens).toHaveBeenCalledWith({ token: 'new-token-from-other-tab' });
  });

  it('should dispatch logout when another tab clears the token', async () => {
    const { logout } = await import('@/store/authSlice');

    // Simulate the callback firing with null (logout from another tab)
    onTokenChangeCallback!(null, null);

    expect(mockDispatch).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });
});

describe('axiosConfig - Interceptor cross-tab refresh dedup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should skip refresh and use new token when another tab already refreshed', async () => {
    const { apiIncorHC } = await import('./axiosConfig');
    const { default: axios } = await import('axios');

    // Simulate: storage has a newer token than the failed request
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('authToken', 'new-token-from-other-tab');

    // Create a mock 401 error with the OLD token in headers
    const mockConfig: InternalAxiosRequestConfig = {
      headers: axios.defaults.headers.common as InternalAxiosRequestConfig['headers'],
      url: '/some-endpoint',
      baseURL: 'http://test-hc-api.com',
    };
    mockConfig.headers.Authorization = 'Bearer old-token';

    const mockError: Partial<AxiosError> = {
      config: mockConfig,
      response: {
        status: 401,
        data: { message: 'Access token expired' },
        statusText: 'Unauthorized',
        headers: {},
        config: mockConfig,
      },
      isAxiosError: true,
    };

    // Get the response interceptor error handler
    const interceptors = (apiIncorHC.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<unknown> }>;
    }).handlers;

    const errorHandler = interceptors[interceptors.length - 1]?.rejected;
    if (errorHandler) {
      try {
        await errorHandler(mockError as AxiosError);
      } catch {
        // Expected - the retry will fail since there's no real server
      }

      // The interceptor should detect the token mismatch and use the new one
      // without calling /auth/refresh
      expect(mockConfig.headers.Authorization).toBe(
        'Bearer new-token-from-other-tab',
      );
    }
  });
});
