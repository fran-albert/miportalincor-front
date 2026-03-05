import { Role } from "@/common/enums/role.enum";

/**
 * Mapeo de permisos por sección de la aplicación
 */
export const PERMISSIONS = {
  // Navegación Principal
  DASHBOARD: [Role.PACIENTE, Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  PATIENTS: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  DOCTORS: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  SPECIALTIES: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  HEALTH_INSURANCE: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  APPOINTMENTS: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  LABORATORIES: [Role.PACIENTE], // Solo para pacientes ver sus propios estudios
  STUDIES: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],

  // Incor Laboral
  INCOR_LABORAL: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  COMPANIES: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  COLLABORATORS: [Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],

  // Reportes y Análisis
  REPORTS: [Role.MEDICO, Role.ADMINISTRADOR],
  STATISTICS: [Role.ADMINISTRADOR],
  ACTIVITY: [Role.ADMINISTRADOR],

  // Administración del Sistema
  SETTINGS: [Role.ADMINISTRADOR],
  SYSTEM_USERS: [Role.ADMINISTRADOR],
  SECRETARIES: [Role.ADMINISTRADOR],
  ROLE_MANAGEMENT: [Role.ADMINISTRADOR],
  ASSIGN_ROLES: [Role.ADMINISTRADOR],
  AUDIT: [Role.ADMINISTRADOR],
  DOCTOR_SERVICES: [Role.ADMINISTRADOR],
  HOLIDAYS: [Role.ADMINISTRADOR],

  // Perfil y Estudios Personales
  MY_PROFILE: [Role.PACIENTE, Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  MY_STUDIES: [Role.PACIENTE],
  MY_APPOINTMENTS: [Role.PACIENTE],

  // Sala de Espera del Médico
  DOCTOR_WAITING_ROOM: [Role.MEDICO],

  // Configuración del Médico
  MY_SETTINGS: [Role.MEDICO],

  // Solicitudes de Recetas
  MY_PRESCRIPTION_REQUESTS: [Role.PACIENTE],
  DOCTOR_PRESCRIPTION_REQUESTS: [Role.MEDICO],

  // Cartón Verde (Medicación)
  MY_GREEN_CARDS: [Role.PACIENTE],

  // Chequeos Periódicos
  MY_CHECKUPS: [Role.PACIENTE],
} as const;

/**
 * Permisos que son exclusivos del rol (sin override de admin)
 * Estos ítems solo aparecen para el rol específico
 */
export const STRICT_PERMISSIONS = [
  'DOCTOR_WAITING_ROOM',
  'MY_SETTINGS',
  'MY_STUDIES',
  'MY_APPOINTMENTS',
  'MY_PRESCRIPTION_REQUESTS',
  'DOCTOR_PRESCRIPTION_REQUESTS',
  'MY_GREEN_CARDS',
  'MY_CHECKUPS',
] as const;

/**
 * Verifica si un usuario con roles específicos tiene acceso a un recurso
 * @param skipAdminOverride - Si es true, el admin NO tiene acceso automático
 */
export const hasPermission = (
  userRoles: string[],
  allowedRoles: readonly string[],
  skipAdminOverride: boolean = false
): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;

  // El Administrador siempre tiene acceso, excepto en permisos estrictos
  if (!skipAdminOverride && userRoles.includes(Role.ADMINISTRADOR)) return true;

  return userRoles.some(role => allowedRoles.includes(role));
};

/**
 * Filtra items de menú según los roles del usuario
 */
export const filterMenuItems = <T extends { allowedRoles?: readonly string[]; strictRoles?: boolean }>(
  items: T[],
  userRoles: string[]
): T[] => {
  return items.filter(item => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;

    // Si tiene strictRoles, no aplicar override de admin
    const skipAdminOverride = item.strictRoles === true;
    return hasPermission(userRoles, item.allowedRoles, skipAdminOverride);
  });
};
