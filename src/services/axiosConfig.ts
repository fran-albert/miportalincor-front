import axios from "axios";

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

const apiTurnos = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_INCOR_TURNOS_API,
  headers: {
    "Content-Type": "application/json",
  },
});

const addAuthToken = (config: any) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiIncor.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiLaboral.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
apiTurnos.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

export { apiIncor, apiLaboral, apiTurnos };
