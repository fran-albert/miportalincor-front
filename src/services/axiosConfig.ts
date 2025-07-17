import axios from "axios";
import { AuthUtils } from "@/utils/auth";

const apiIncor = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API, 
  headers: {
    "Content-Type": "application/json",
  },
});

const apiLaboral = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_INCOR_LABORAL_API, 
  headers: {
    "Content-Type": "application/json",
  },
});

const addAuthToken = (config: any) => {
  const token = AuthUtils.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor to handle token expiration
const handleTokenExpiration = (error: any) => {
  if (error.response && error.response.status === 401) {
    // Token expired or invalid
    AuthUtils.removeAuthToken();
    window.location.href = '/iniciar-sesion';
  }
  return Promise.reject(error);
};

apiIncor.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiLaboral.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

apiIncor.interceptors.response.use(
  (response) => response,
  handleTokenExpiration
);
apiLaboral.interceptors.response.use(
  (response) => response,
  handleTokenExpiration
);

export { apiIncor, apiLaboral };
