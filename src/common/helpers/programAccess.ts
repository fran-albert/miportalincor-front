interface ProgramAccessInput {
  isAdmin: boolean;
  isSecretary: boolean;
  isProgramMember: boolean;
  isCoordinator: boolean;
}

export interface ProgramAccessCapabilities {
  isProgramOperator: boolean;
  hasClinicalProgramAccess: boolean;
  canManageEnrollments: boolean;
  canRegisterAttendance: boolean;
  canCreateNotes: boolean;
  canManageActivities: boolean;
  canManageMonthlyPricing: boolean;
}

export const getProgramAccessCapabilities = ({
  isAdmin,
  isSecretary,
  isProgramMember,
  isCoordinator,
}: ProgramAccessInput): ProgramAccessCapabilities => {
  const isProgramOperator = isAdmin || isSecretary;

  return {
    isProgramOperator,
    hasClinicalProgramAccess: isProgramMember && !isProgramOperator,
    canManageEnrollments: isProgramOperator || isCoordinator,
    canRegisterAttendance: isProgramOperator || isProgramMember,
    canCreateNotes: isProgramMember && !isProgramOperator,
    canManageActivities: isAdmin || (isCoordinator && !isProgramOperator),
    // El arancel mensual es ECONÓMICO, no clínico: lo gestiona cualquier
    // miembro del programa, incluidos admin/secretaría (caso de la
    // coordinadora administrativa). Espeja la regla del backend, que sólo
    // exige ser miembro del programa. Antes colgaba de hasClinicalProgramAccess
    // y un admin no veía la pestaña aunque la API lo autorizara.
    canManageMonthlyPricing: isProgramMember,
  };
};
