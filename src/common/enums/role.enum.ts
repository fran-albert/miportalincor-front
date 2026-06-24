export enum Role {
  PACIENTE = 'Paciente',
  MEDICO = 'Medico',
  SECRETARIA = 'Secretaria',
  ADMINISTRADOR = 'Administrador',
  PROFESOR = 'Profesor',
}

export const ROLES = {
  PATIENT: Role.PACIENTE,
  DOCTOR: Role.MEDICO,
  SECRETARY: Role.SECRETARIA,
  ADMIN: Role.ADMINISTRADOR,
  PROFESSOR: Role.PROFESOR,
} as const;
  