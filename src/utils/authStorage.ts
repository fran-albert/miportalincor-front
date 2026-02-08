const AUTH_TOKEN_KEY = 'authToken';
const TOKEN_EXPIRATION_KEY = 'tokenExpiration';
const REMEMBER_ME_KEY = 'rememberMe';

const getStorage = (): Storage => {
  // Si ya hay token en localStorage, seguir usandolo (usuario eligio "Recordarme")
  if (localStorage.getItem(REMEMBER_ME_KEY) === 'true') {
    return localStorage;
  }
  return sessionStorage;
};

export const authStorage = {
  getToken: (): string | null => {
    // Buscar en localStorage primero (por si eligio recordarme), luego sessionStorage
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  setToken: (token: string): void => {
    getStorage().setItem(AUTH_TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getTokenExpiration: (): string | null => {
    return localStorage.getItem(TOKEN_EXPIRATION_KEY) || sessionStorage.getItem(TOKEN_EXPIRATION_KEY);
  },

  setTokenExpiration: (exp: string): void => {
    getStorage().setItem(TOKEN_EXPIRATION_KEY, exp);
  },

  clearAll: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRATION_KEY);
  },

  setSession: (token: string, expiration: string): void => {
    const storage = getStorage();
    storage.setItem(AUTH_TOKEN_KEY, token);
    storage.setItem(TOKEN_EXPIRATION_KEY, expiration);
  },

  setRememberMe: (remember: boolean): void => {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },

  getRememberMe: (): boolean => {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  },
};
