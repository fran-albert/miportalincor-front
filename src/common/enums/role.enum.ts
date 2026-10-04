export enum Role {
  PACIENTE = 'Paciente',
  MEDICO = 'Medico',
  SECRETARIA = 'Secretaria',
  ADMINISTRADOR = 'Administrador',
  PROFESOR = 'Profesor',
  LABORATORIO = 'Laboratorio',
}

export const ROLES = {
  PATIENT: Role.PACIENTE,
  DOCTOR: Role.MEDICO,
  SECRETARY: Role.SECRETARIA,
  ADMIN: Role.ADMINISTRADOR,
  PROFESSOR: Role.PROFESOR,
  LABORATORY: Role.LABORATORIO,
} as const;
  