/**
 * Feature Flags para controlar funcionalidades por ambiente
 *
 * Para habilitar/deshabilitar features, modificar las variables de entorno:
 * - VITE_FEATURE_APPOINTMENTS_ENABLED=true|false
 */
export const FEATURE_FLAGS = {
  APPOINTMENTS_ENABLED: import.meta.env.VITE_FEATURE_APPOINTMENTS_ENABLED === 'true',
} as const;

/**
 * Helper para verificar si un feature está habilitado
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};
