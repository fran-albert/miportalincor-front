export enum Role {
  PACIENTE = 'Paciente',
  MEDICO = 'Medico',
  SECRETARIA = 'Secretaria',
  ADMINISTRADOR = 'Administrador',
}

export const ROLES = {
  PATIENT: Role.PACIENTE,
  DOCTOR: Role.MEDICO,
  SECRETARY: Role.SECRETARIA,
  ADMIN: Role.ADMINISTRADOR,
} as const;
  