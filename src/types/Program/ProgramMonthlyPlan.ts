import { ProgramTariffType } from "./ProgramActivity";

export enum ProgramMonthlyWhatsappStatus {
  DISABLED = "DISABLED",
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
  SKIPPED_NO_PHONE = "SKIPPED_NO_PHONE",
}

export const ProgramMonthlyWhatsappStatusLabels: Record<
  ProgramMonthlyWhatsappStatus,
  string
> = {
  [ProgramMonthlyWhatsappStatus.DISABLED]: "Desactivado",
  [ProgramMonthlyWhatsappStatus.PENDING]: "Pendiente",
  [ProgramMonthlyWhatsappStatus.SENT]: "Enviado",
  [ProgramMonthlyWhatsappStatus.FAILED]: "Falló",
  [ProgramMonthlyWhatsappStatus.SKIPPED_NO_PHONE]: "Sin teléfono",
};

export interface ProgramMonthlyPlanItem {
  id?: string;
  activityId?: string;
  activityName: string;
  tariffType?: ProgramTariffType;
  unitPriceCents?: string;
  quantity: number;
  listSubtotalCents: string;
  discountBasisPoints: number;
  discountAmountCents: string;
  discountedSubtotalCents: string;
  pricingConfigured: boolean;
}

export interface ProgramMonthlyPlan {
  id?: string;
  persisted: boolean;
  enrollmentId: string;
  periodYear: number;
  periodMonth: number;
  programMonthNumber: number;
  programName: string;
  discountBasisPoints: number;
  discountPercent: number;
  listTotalCents: string;
  discountAmountCents: string;
  discountedTotalCents: string;
  revision: number;
  whatsappStatus: ProgramMonthlyWhatsappStatus;
  whatsappMessageId?: number;
  whatsappLastError?: string;
  createdAt?: string;
  updatedAt?: string;
  activities: ProgramMonthlyPlanItem[];
}

export interface MonthlyPlanActivityQuantity {
  activityId: string;
  quantity: number;
}

export interface UpsertProgramMonthlyPlanDto {
  activities: MonthlyPlanActivityQuantity[];
}
