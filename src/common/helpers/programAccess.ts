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
    canManageActivities: isCoordinator && !isProgramOperator,
  };
};
