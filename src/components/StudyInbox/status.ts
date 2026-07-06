import { StudyInboxStatus } from "@/types/StudyInbox/StudyInbox.types";

type BadgeVariant = "success" | "warning" | "secondary" | "destructive";

interface StatusMeta {
  label: string;
  variant: BadgeVariant;
}

export const STATUS_META: Record<StudyInboxStatus, StatusMeta> = {
  LISTO_PARA_CONFIRMAR: { label: "Listo para confirmar", variant: "success" },
  REQUIERE_REVISION: { label: "Requiere revisión", variant: "warning" },
  RECIBIDO: { label: "Recibido", variant: "secondary" },
  PROCESANDO: { label: "Procesando", variant: "secondary" },
  CARGADO: { label: "Cargado", variant: "secondary" },
  DUPLICADO: { label: "Duplicado", variant: "warning" },
  DESCARTADO: { label: "Descartado", variant: "destructive" },
  ERROR: { label: "Error", variant: "destructive" },
};

// La bandeja recibe mas de un tipo de estudio (por ahora laboratorio y
// ecografia); la secretaria tiene que ver que esta confirmando.
const STUDY_TYPE_LABELS: Record<number, string> = {
  1: "Laboratorio",
  2: "Ecografía",
};

export const studyTypeLabel = (
  suggestedStudyTypeId: number | null | undefined,
): string =>
  (suggestedStudyTypeId != null &&
    STUDY_TYPE_LABELS[suggestedStudyTypeId]) ||
  "Estudio";
