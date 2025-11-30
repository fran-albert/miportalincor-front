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
  ROLE_MANAGEMENT: [Role.ADMINISTRADOR],
  ASSIGN_ROLES: [Role.ADMINISTRADOR],
  AUDIT: [Role.ADMINISTRADOR],

  // Perfil y Estudios Personales
  MY_PROFILE: [Role.PACIENTE, Role.MEDICO, Role.SECRETARIA, Role.ADMINISTRADOR],
  MY_STUDIES: [Role.PACIENTE],
} as const;

/**
 * Verifica si un usuario con roles específicos tiene acceso a un recurso
 */
export const hasPermission = (userRoles: string[], allowedRoles: readonly string[]): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true; // Si no hay restricciones, permitir

  return userRoles.some(role => allowedRoles.includes(role));
};

/**
 * Filtra items de menú según los roles del usuario
 */
export const filterMenuItems = <T extends { allowedRoles?: readonly string[] }>(
  items: T[],
  userRoles: string[]
): T[] => {
  return items.filter(item => {
    // Si el item no tiene restricciones de roles, mostrarlo a todos
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;

    // Verificar si el usuario tiene al menos uno de los roles permitidos
    return hasPermission(userRoles, item.allowedRoles);
  });
};
