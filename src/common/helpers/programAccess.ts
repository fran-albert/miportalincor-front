interface ProgramAccessInput {
  isAdmin: boolean;
  isSecretary: boolean;
  isProgramMember: boolean;
  isCoordinator: boolean;
  /** Rol de sistema Medico. Opcional para no romper llamadores existentes. */
  isDoctor?: boolean;
}

export interface ProgramAccessCapabilities {
  isProgramOperator: boolean;
  hasClinicalProgramAccess: boolean;
  canManageEnrollments: boolean;
  canRegisterAttendance: boolean;
  canCreateNotes: boolean;
  canManageActivities: boolean;
  canManageMonthlyPricing: boolean;
  /** Cargar la ficha de ingreso y el score de dolor. Sólo el médico. */
  canRegisterClinicalIntake: boolean;
}

export const getProgramAccessCapabilities = ({
  isAdmin,
  isSecretary,
  isProgramMember,
  isCoordinator,
  isDoctor = false,
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
    // La evaluación clínica la carga el MÉDICO. El profesor la lee (de ahí
    // salen las zonas a evitar) pero no la escribe, y la recepción no la ve.
    // Espeja el backend: @Roles(Medico) + ser miembro del programa.
    canRegisterClinicalIntake: isProgramMember && isDoctor,
  };
};
