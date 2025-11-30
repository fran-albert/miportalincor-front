/**
 * Configuración centralizada de entornos
 * Maneja las variables de entorno de forma tipada y validada
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  NODE_ENV: Environment;
  API_BASE_URL: string;
  API_INCOR_HC_URL: string;
  API_INCOR_LABORAL_URL: string;
  BASE_URL: string;
  DEBUG_MODE: boolean;
  SHOW_DEV_TOOLS: boolean;
  API_TURNOS_URL: string;
}

/**
 * Obtiene el entorno actual basado en las variables de entorno
 */
function getCurrentEnvironment(): Environment {
  const env = import.meta.env.VITE_NODE_ENV as Environment;
  
  if (!env) {
    console.warn('VITE_NODE_ENV no está definido, usando "development" por defecto');
    return 'development';
  }
  
  if (!['development', 'staging', 'production'].includes(env)) {
    console.warn(`Entorno "${env}" no válido, usando "development" por defecto`);
    return 'development';
  }
  
  return env;
}

/**
 * Valida que una variable de entorno esté definida
 */
function requireEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variable de entorno requerida no encontrada: ${name}`);
  }
  return value;
}

/**
 * Convierte string a boolean para variables de entorno
 */
function envToBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Configuración del entorno actual
 */
export const environment: EnvironmentConfig = {
  NODE_ENV: getCurrentEnvironment(),
  API_BASE_URL: requireEnvVar('VITE_BACKEND_API', import.meta.env.VITE_BACKEND_API),
  API_INCOR_HC_URL: requireEnvVar('VITE_BACKEND_API_INCOR_HC', import.meta.env.VITE_BACKEND_API_INCOR_HC),
  API_INCOR_LABORAL_URL: requireEnvVar('VITE_BACKEND_INCOR_LABORAL_API', import.meta.env.VITE_BACKEND_INCOR_LABORAL_API),
  BASE_URL: requireEnvVar('VITE_BASE_URL', import.meta.env.VITE_BASE_URL),
  DEBUG_MODE: envToBoolean(import.meta.env.VITE_DEBUG_MODE, false),
  SHOW_DEV_TOOLS: envToBoolean(import.meta.env.VITE_SHOW_DEV_TOOLS, false),
  API_TURNOS_URL: requireEnvVar('VITE_BACKEND_API_TURNOS', import.meta.env.VITE_BACKEND_API_TURNOS),
};

/**
 * Utilidades para verificar el entorno actual
 */
export const isDevelopment = () => environment.NODE_ENV === 'development';
export const isStaging = () => environment.NODE_ENV === 'staging';
export const isProduction = () => environment.NODE_ENV === 'production';

/**
 * Configuraciones específicas por entorno
 */
export const environmentConfigs = {
  development: {
    logLevel: 'debug',
    enablePerformanceDebugging: true,
    enableReduxDevTools: true,
    apiTimeout: 30000,
  },
  staging: {
    logLevel: 'info',
    enablePerformanceDebugging: true,
    enableReduxDevTools: true,
    apiTimeout: 15000,
  },
  production: {
    logLevel: 'error',
    enablePerformanceDebugging: false,
    enableReduxDevTools: false,
    apiTimeout: 10000,
  },
} as const;

/**
 * Configuración actual basada en el entorno
 */
export const currentConfig = environmentConfigs[environment.NODE_ENV];

/**
 * Log de información del entorno (solo en desarrollo)
 */
if (isDevelopment()) {
  console.group('🔧 Environment Configuration');
  console.log('Environment:', environment.NODE_ENV);
  console.log('API Base URL:', environment.API_BASE_URL);
  console.log('Base URL:', environment.BASE_URL);
  console.log('Debug Mode:', environment.DEBUG_MODE);
  console.groupEnd();
}