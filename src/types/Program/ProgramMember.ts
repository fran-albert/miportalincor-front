export enum MemberRole {
  PROFESSIONAL = "PROFESSIONAL",
  COORDINATOR = "COORDINATOR",
  OTHER = "OTHER",
}

export const MemberRoleLabels: Record<MemberRole, string> = {
  [MemberRole.PROFESSIONAL]: "Profesional",
  [MemberRole.COORDINATOR]: "Coordinador",
  [MemberRole.OTHER]: "Otro",
};

export interface ProgramMember {
  id: string;
  programId: string;
  userId: string;
  role: MemberRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
}

export interface AddMemberDto {
  userId: string;
  role: MemberRole;
}
