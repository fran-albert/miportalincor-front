import { ProgramTariffType } from "./ProgramActivity";

export enum ProgramMonthlyWhatsappStatus {
  DISABLED = "DISABLED",
  NOT_REQUESTED = "NOT_REQUESTED",
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
  [ProgramMonthlyWhatsappStatus.NOT_REQUESTED]: "Sin enviar",
  [ProgramMonthlyWhatsappStatus.PENDING]: "Pendiente",
  [ProgramMonthlyWhatsappStatus.SENT]: "Enviado",
  [ProgramMonthlyWhatsappStatus.FAILED]: "Falló",
  [ProgramMonthlyWhatsappStatus.SKIPPED_NO_PHONE]: "Sin teléfono",
};

export const canSendWhatsappNotice = (
  status: ProgramMonthlyWhatsappStatus
): boolean =>
  status === ProgramMonthlyWhatsappStatus.NOT_REQUESTED ||
  status === ProgramMonthlyWhatsappStatus.FAILED ||
  status === ProgramMonthlyWhatsappStatus.SKIPPED_NO_PHONE;

export enum ProgramPlanPeriodStatus {
  ACTIVE = "ACTIVE",
  NO_PLAN = "NO_PLAN",
  NOT_YET_VALID = "NOT_YET_VALID",
  EXPIRED = "EXPIRED",
}

export enum ProgramQuantitySource {
  PLAN = "PLAN",
  NONE = "NONE",
}

export const ProgramPlanPeriodStatusTitles: Record<
  ProgramPlanPeriodStatus,
  string
> = {
  [ProgramPlanPeriodStatus.ACTIVE]:
    "Cantidades sugeridas a partir del plan del paciente",
  [ProgramPlanPeriodStatus.NO_PLAN]: "El paciente no tiene un plan cargado",
  [ProgramPlanPeriodStatus.NOT_YET_VALID]:
    "El plan del paciente todavía no empezó",
  [ProgramPlanPeriodStatus.EXPIRED]: "El plan del paciente venció",
};

export interface ProgramMonthlyPlanItem {
  id?: string;
  activityId?: string;
  activityName: string;
  tariffType?: ProgramTariffType;
  unitPriceCents?: string;
  quantity: number;
  coveredQuantity: number;
  coveredUnitPriceCents?: string;
  coverageAvailable: boolean;
  coveredSessionsPerMonth?: number;
  coverageQuotaExceeded: boolean;
  listSubtotalCents: string;
  /** El descuento alcanza a esta línea. En un mes guardado es lo congelado. */
  discountEligible: boolean;
  discountBasisPoints: number;
  discountAmountCents: string;
  discountedSubtotalCents: string;
  pricingConfigured: boolean;
  /** De dónde salió la cantidad del mes todavía no guardado */
  quantitySource?: ProgramQuantitySource;
  /** Cantidad que daría hoy el plan del paciente para este período */
  planSuggestedQuantity?: number;
}

export interface ProgramMonthlyPlan {
  id?: string;
  persisted: boolean;
  enrollmentId: string;
  periodYear: number;
  periodMonth: number;
  programMonthNumber: number;
  programName: string;
  healthInsuranceId?: number;
  healthInsuranceName?: string;
  hasHealthInsurance: boolean;
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
  /** Situación del plan clínico para este período. Solo viene al pedir un mes puntual. */
  planStatus?: ProgramPlanPeriodStatus;
  planStatusMessage?: string;
  planVersion?: number;
  planValidFrom?: string;
  planValidTo?: string;
  /** Versión del plan con la que se guardó el mes. NULL en los meses viejos. */
  sourcePlanVersion?: number;
  /** El plan cambió después de guardar el mes: se avisa, no se sincroniza solo. */
  planQuantitiesOutdated?: boolean;
  activities: ProgramMonthlyPlanItem[];
}

export interface MonthlyPlanActivityQuantity {
  activityId: string;
  quantity: number;
  coveredQuantity?: number;
  /** Si no se informa, manda la configuración por rubro de la actividad. */
  discountEligible?: boolean;
}

export interface UpsertProgramMonthlyPlanDto {
  activities: MonthlyPlanActivityQuantity[];
}
