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
  assignedProfessionalUserId?: string | null;
  assignedProfessional?: {
    firstName: string;
    lastName: string;
  };
  qrToken: string;
  isActive: boolean;
  tariffType?: ProgramTariffType;
  unitPriceCents?: string;
  /** El descuento del programa alcanza a esta actividad (decisión por rubro). */
  discountEligible: boolean;
  createdAt?: string;
}

export interface CreateActivityDto {
  name: string;
  description?: string;
  assignedProfessionalUserId?: string;
  tariffType: ProgramTariffType;
  unitPriceCents: string;
  discountEligible?: boolean;
}

export interface UpdateActivityDto {
  name?: string;
  description?: string;
  assignedProfessionalUserId?: string;
  tariffType?: ProgramTariffType;
  unitPriceCents?: string;
  discountEligible?: boolean;
}
