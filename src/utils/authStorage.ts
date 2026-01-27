const AUTH_TOKEN_KEY = 'authToken';
const TOKEN_EXPIRATION_KEY = 'tokenExpiration';

// Using sessionStorage for independent sessions per tab
const storage = sessionStorage;

export const authStorage = {
  getToken: (): string | null => storage.getItem(AUTH_TOKEN_KEY),
  setToken: (token: string): void => storage.setItem(AUTH_TOKEN_KEY, token),
  removeToken: (): void => storage.removeItem(AUTH_TOKEN_KEY),

  getTokenExpiration: (): string | null => storage.getItem(TOKEN_EXPIRATION_KEY),
  setTokenExpiration: (exp: string): void => storage.setItem(TOKEN_EXPIRATION_KEY, exp),

  clearAll: (): void => {
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(TOKEN_EXPIRATION_KEY);
  },

  setSession: (token: string, expiration: string): void => {
    storage.setItem(AUTH_TOKEN_KEY, token);
    storage.setItem(TOKEN_EXPIRATION_KEY, expiration);
  },
};
