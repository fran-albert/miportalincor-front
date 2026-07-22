export type StudyReportState = "SIN_EMPEZAR" | "BORRADOR";
export type StudyReportStatus = "BORRADOR" | "FIRMADO";
export type StudyReportFieldType = "text" | "number" | "select";

export interface StudyReportField { key: string; label: string; type: StudyReportFieldType; required: boolean; options?: string[]; }
export interface StudyReportTemplate { key: string; label: string; subtypeAliases: string[]; fields: StudyReportField[]; }
export interface StudyReport { id: string; templateKey: string; content: Record<string, unknown>; status: StudyReportStatus; signedAt?: string | null; }
export interface StudyReportListItem { sourceInboxItemId: string; report: StudyReport | null; state: StudyReportState; patientName: string | null; patientDni: string | null; studyDate: string | null; studyType: string | null; splitLabel: string | null; }

export interface StudyReportSplitGroup { assignedInstanceIds: string[]; templateKey: string; label: string; }
export interface StudyReportViewerSession { viewerPath: string; expiresInSeconds: number; }
