export enum ProgramTariffType {
  PER_SESSION = "PER_SESSION",
  MONTHLY_FIXED = "MONTHLY_FIXED",
}

export const ProgramTariffTypeLabels: Record<ProgramTariffType, string> = {
  [ProgramTariffType.PER_SESSION]: "Por sesión",
  [ProgramTariffType.MONTHLY_FIXED]: "Mensual fijo",
};

export interface ProgramActivity {
  id: string;
  programId: string;
  name: string;
  description?: string;
  assignedProfessionalUserId?: string;
  assignedProfessional?: {
    firstName: string;
    lastName: string;
  };
  qrToken: string;
  isActive: boolean;
  tariffType?: ProgramTariffType;
  unitPriceCents?: string;
  createdAt?: string;
}

export interface CreateActivityDto {
  name: string;
  description?: string;
  assignedProfessionalUserId?: string;
  tariffType: ProgramTariffType;
  unitPriceCents: string;
}

export interface UpdateActivityDto {
  name?: string;
  description?: string;
  assignedProfessionalUserId?: string;
  tariffType?: ProgramTariffType;
  unitPriceCents?: string;
}
