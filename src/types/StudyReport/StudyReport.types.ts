export type StudyReportState = "SIN_EMPEZAR" | "BORRADOR";
export type StudyReportStatus = "BORRADOR" | "FIRMADO";
export type StudyReportFieldType = "text" | "number" | "select";

export interface StudyReportField { key: string; label: string; type: StudyReportFieldType; required: boolean; options?: string[]; default?: string; }
export interface StudyReportTemplate { key: string; label: string; subtypeAliases: string[]; fields: StudyReportField[]; }
export interface StudyReport { id: string; templateKey: string; content: Record<string, unknown>; status: StudyReportStatus; signedAt?: string | null; }
export interface StudyReportListItem { sourceInboxItemId: string; report: StudyReport | null; state: StudyReportState; patientName: string | null; patientDni: string | null; studyDate: string | null; studyType: string | null; splitLabel: string | null; }

export interface StudyReportSplitGroup { assignedInstanceIds: string[]; templateKey: string; label: string; }
export interface StudyReportViewerSession { viewerPath: string; expiresInSeconds: number; }

/**
 * "Mis plantillas": las plantillas de informe del profesional autenticado.
 *
 * Toda plantilla tiene dueño: no existe "la plantilla del sistema". El backend
 * resuelve el dueño desde el token, por eso ningún tipo de acá lleva `doctorId`.
 * La v1 es de SOLO LECTURA: no hay tipos de creación/edición a propósito.
 */
export interface MyStudyReportTemplateSummary {
  templateKey: string;
  label: string;
  /** `false` = el profesional no tiene textos propios para ese tipo de estudio. */
  hasTemplate: boolean;
}

export interface MyStudyReportTemplateField {
  key: string;
  label: string;
  type: StudyReportFieldType;
  /** `null` = ese campo arranca vacío. */
  text: string | null;
}

export interface MyStudyReportTemplateDetail {
  templateKey: string;
  label: string;
  hasTemplate: boolean;
  fields: MyStudyReportTemplateField[];
}
