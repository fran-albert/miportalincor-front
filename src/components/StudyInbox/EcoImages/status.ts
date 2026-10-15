import { ReceptionReportState } from "@/types/StudyReport/ReceptionEcoImages.types";

export const REPORT_STATE_META: Record<
  ReceptionReportState,
  { label: string; variant: "outline" | "secondary" | "success" | "warning" }
> = {
  SIN_EMPEZAR: { label: "Sin informar", variant: "outline" },
  BORRADOR: { label: "En borrador", variant: "warning" },
  PARCIAL: { label: "Firmado en parte", variant: "warning" },
  FIRMADO: { label: "Firmado", variant: "success" },
};
