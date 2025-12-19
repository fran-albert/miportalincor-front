export type ActiveHomeView = 'professional' | 'patient';

export interface RoleViewConfig {
  hasProfessionalRole: boolean;
  hasPatientRole: boolean;
  hasDualRole: boolean;
  professionalRoleLabel: string;
}
