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
