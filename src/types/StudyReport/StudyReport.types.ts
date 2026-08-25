export type StudyReportState = "SIN_EMPEZAR" | "BORRADOR";
export type StudyReportStatus = "BORRADOR" | "FIRMADO";
export type StudyReportFieldType = "text" | "number" | "select";

export interface StudyReportField { key: string; label: string; type: StudyReportFieldType; required: boolean; options?: string[]; default?: string; }
export interface StudyReportTemplate { key: string; label: string; subtypeAliases: string[]; fields: StudyReportField[]; }
export interface StudyReport { id: string; templateKey: string; content: Record<string, unknown>; status: StudyReportStatus; signedAt?: string | null; }
export interface StudyReportListItem { sourceInboxItemId: string; report: StudyReport | null; state: StudyReportState; patientName: string | null; patientDni: string | null; studyDate: string | null; studyType: string | null; splitLabel: string | null; claimed: boolean; }

/**
 * Un estudio que llegó del ecógrafo sin poder atribuirse a nadie.
 *
 * Pasa cuando la atención se hizo sin turno registrado: sin turno no hay
 * entrada de worklist, sin worklist el estudio sale sin AccessionNumber, y sin
 * accession no hay forma de saber de quién es. El 24/08/2026 había 88 así.
 */
export interface OrphanStudy {
  sourceInboxItemId: string;
  /** Lo que quedó cargado en el equipo. A veces son iniciales ("MP"). */
  detectedPatientName: string | null;
  detectedDni: string | null;
  studyDate: string | null;
  /** Cuándo llegó el estudio desde el PACS. */
  receivedAt: string | null;
  studySubtype: string | null;
  imageCount: number;
  hasImages: boolean;
  /** El padrón no lo resolvió solo: hay que elegir el paciente al reclamar. */
  needsPatient: boolean;
}

/** Cómo quedó el estudio después de reclamarlo o soltarlo. */
export interface ClaimResult {
  sourceInboxItemId: string;
  claimedByDoctorId: string | null;
  claimedAt: string | null;
  claimedPatientUserId: string | null;
}

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
