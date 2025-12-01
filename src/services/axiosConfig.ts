import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { environment, currentConfig } from "@/config/environment";

const apiIncor = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: currentConfig.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

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

  if (isRefreshing) {
    // If already refreshing, queue this request
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
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

    // Call refresh endpoint
    const response = await axios.post(
      `${environment.API_INCOR_HC_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    const { token: newToken } = response.data;

    // Save new token
    localStorage.setItem("authToken", newToken);

    // Update authorization header
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    // Process queued requests
    processQueue(null, newToken);

    // Retry the original request
    return axios(originalRequest);
  } catch (refreshError) {
    // Refresh failed - clear token and redirect to login
    processQueue(refreshError, null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Redirect to login page
    window.location.href = "/login";

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

// Request interceptors
apiIncor.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiLaboral.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiIncorHC.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiTurnos.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Response interceptors for auto-refresh
apiIncor.interceptors.response.use((response) => response, handleAuthError);
apiLaboral.interceptors.response.use((response) => response, handleAuthError);
apiIncorHC.interceptors.response.use((response) => response, handleAuthError);
apiTurnos.interceptors.response.use((response) => response, handleAuthError);

export { apiIncor, apiLaboral, apiIncorHC, apiTurnos };