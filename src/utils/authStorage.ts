const AUTH_TOKEN_KEY = 'authToken';
const TOKEN_EXPIRATION_KEY = 'tokenExpiration';
const REMEMBER_ME_KEY = 'rememberMe';

const getRememberMe = (): boolean => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

const getStorage = (): Storage => {
  // Si ya hay token en localStorage, seguir usandolo (usuario eligio "Recordarme")
  if (getRememberMe()) {
    return localStorage;
  }
  return sessionStorage;
};

const getOppositeStorage = (): Storage => {
  return getStorage() === localStorage ? sessionStorage : localStorage;
};

const clearOppositeSession = (): void => {
  const oppositeStorage = getOppositeStorage();
  oppositeStorage.removeItem(AUTH_TOKEN_KEY);
  oppositeStorage.removeItem(TOKEN_EXPIRATION_KEY);
};

export const authStorage = {
  getToken: (): string | null => {
    return getStorage().getItem(AUTH_TOKEN_KEY);
  },

  setToken: (token: string): void => {
    getStorage().setItem(AUTH_TOKEN_KEY, token);
    clearOppositeSession();
  },

  removeToken: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getTokenExpiration: (): string | null => {
    return getStorage().getItem(TOKEN_EXPIRATION_KEY);
  },

  setTokenExpiration: (exp: string): void => {
    getStorage().setItem(TOKEN_EXPIRATION_KEY, exp);
    clearOppositeSession();
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
    clearOppositeSession();
  },

  setRememberMe: (remember: boolean): void => {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },

  getRememberMe: (): boolean => {
    return getRememberMe();
  },

  /**
   * Inicia la sincronizacion cross-tab via evento 'storage' de localStorage.
   * Cuando otra pestana refresca el token, esta pestana lo detecta y
   * llama al callback con el nuevo token y expiracion.
   * Solo funciona con localStorage (usuarios que marcaron "Recordarme").
   */
  onTokenChange: (callback: (token: string | null, expiration: string | null) => void): (() => void) => {
    const handler = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY) {
        if (!getRememberMe()) return;
        const newToken = event.newValue;
        const newExpiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
        callback(newToken, newExpiration);
      } else if (event.key === REMEMBER_ME_KEY && !event.newValue) {
        // Otra tab hizo logout (limpio rememberMe)
        callback(null, null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};
