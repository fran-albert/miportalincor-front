import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { environment, currentConfig } from "@/config/environment";
import { store } from "@/store/store";
import { updateTokens, logout } from "@/store/authSlice";
import { jwtDecode } from "jwt-decode";
import { TOAST_EVENT, ToastEventDetail } from "@/hooks/Toast/toast-context";

// Helper para disparar toasts desde fuera de React
const showGlobalToast = (type: "success" | "error", title: string, description?: string) => {
  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>(TOAST_EVENT, {
      detail: { type, title, description },
    })
  );
};

const apiLaboral = axios.create({
  baseURL: environment.API_INCOR_LABORAL_URL,
  timeout: currentConfig.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiTurnos = axios.create({
  baseURL: environment.API_TURNOS_URL,
  timeout: currentConfig.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiIncorHC = axios.create({
  baseURL: environment.API_INCOR_HC_URL,
  timeout: currentConfig.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Flag para evitar mostrar toast de "sesión cerrada" al cargar la app
let isInitialLoad = true;
setTimeout(() => {
  isInitialLoad = false;
}, 3000); // Después de 3 segundos, consideramos que ya no es carga inicial

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Helper to determine the correct axios instance for a request
const getAxiosInstance = (config: InternalAxiosRequestConfig) => {
  const url = config.baseURL || config.url || '';
  if (url.includes(environment.API_INCOR_LABORAL_URL)) return apiLaboral;
  if (url.includes(environment.API_TURNOS_URL)) return apiTurnos;
  return apiIncorHC;
};

const addAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const handleAuthError = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  // Only handle 401 errors and avoid infinite loops
  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  // Don't try to refresh if we're already on the login or refresh endpoint
  if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  // Check if session was invalidated (logged in from another device)
  const errorMessage = (error.response?.data as { message?: string })?.message || "";
  const isSessionInvalidated = errorMessage.includes("sesion ha sido invalidada") ||
                                errorMessage.includes("session has been invalidated");

  if (isSessionInvalidated) {
    // Clear local state
    store.dispatch(logout());

    // Solo mostrar toast si NO es carga inicial (evita el flash al reabrir el navegador)
    if (!isInitialLoad) {
      showGlobalToast(
        "error",
        "Sesion cerrada",
        "Se inicio sesion desde otro dispositivo"
      );

      // Small delay to show the toast before redirect
      setTimeout(() => {
        window.location.href = "/iniciar-sesion";
      }, 1500);
    } else {
      // En carga inicial, redirigir inmediatamente sin toast
      window.location.href = "/iniciar-sesion";
    }

    return Promise.reject(error);
  }

  if (isRefreshing) {
    // If already refreshing, queue this request
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return getAxiosInstance(originalRequest)(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      throw new Error("No token available");
    }

    // Call refresh endpoint (remove trailing slash if present)
    const baseUrl = environment.API_INCOR_HC_URL.replace(/\/$/, '');
    const response = await axios.post(
      `${baseUrl}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    const { token: newToken } = response.data;

    // Decode token to get expiration
    const decodedToken = jwtDecode<{ exp: number }>(newToken);
    const expirationTime = decodedToken.exp * 1000;

    // Save new token in localStorage AND Redux
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("tokenExpiration", expirationTime.toString());
    store.dispatch(updateTokens({ token: newToken }));

    // Update authorization header
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    // Process queued requests
    processQueue(null, newToken);

    // Retry the original request with the correct axios instance
    return getAxiosInstance(originalRequest)(originalRequest);
  } catch (refreshError) {
    // Refresh failed - clear token and redirect to login
    processQueue(refreshError, null);
    store.dispatch(logout());

    // Redirect to login page
    window.location.href = "/iniciar-sesion";

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

// Request interceptors
apiLaboral.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiIncorHC.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiTurnos.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Response interceptors for auto-refresh
apiLaboral.interceptors.response.use((response) => response, handleAuthError);
apiIncorHC.interceptors.response.use((response) => response, handleAuthError);
apiTurnos.interceptors.response.use((response) => response, handleAuthError);

export { apiLaboral, apiIncorHC, apiTurnos };