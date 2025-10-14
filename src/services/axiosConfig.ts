import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
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

const addAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiIncor.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiLaboral.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiIncorHC.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiTurnos.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
  
export { apiIncor, apiLaboral, apiIncorHC, apiTurnos };