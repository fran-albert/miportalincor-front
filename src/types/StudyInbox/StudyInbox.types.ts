export type StudyInboxStatus =
  | "RECIBIDO"
  | "PROCESANDO"
  | "REQUIERE_REVISION"
  | "LISTO_PARA_CONFIRMAR"
  | "CARGADO"
  | "DUPLICADO"
  | "DESCARTADO"
  | "ERROR";

export type MatchConfidence =
  | "DNI_EXACT"
  | "NAME_UNIQUE"
  | "NAME_MULTIPLE"
  | "NONE";

export interface StudyInboxItem {
  id: string;
  attachmentId: string | null;
  /** Nombre del archivo del PDF adjunto (para identificar el informe). */
  attachmentFileName: string | null;
  pacsStudyInstanceUID: string | null;
  pacsAccessionNumber: string | null;
  pacsSeriesCount: number | null;
  pacsInstanceCount: number | null;
  detectedPatientName: string | null;
  detectedDni: string | null;
  detectedLabFicha: string | null;
  detectedLabIngreso: string | null;
  detectedStudyDate: string | null;
  detectedInstitution: string | null;
  detectedStudySubtype: string | null;
  suggestedStudyTypeId: number | null;
  suggestedPatientUserId: string | null;
  matchConfidence: MatchConfidence | null;
  status: StudyInboxStatus;
  confirmedStudyId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  emailSubject: string | null;
  onHold: boolean;
  holdReason: string | null;
  heldAutomatically: boolean;
  releasedBy: string | null;
  releasedAt: string | null;
  createdAt: string;
}

export type StudyInboxCounts = Record<StudyInboxStatus, number>;

export interface StudyInboxCountsResponse {
  counts: StudyInboxCounts;
}

export interface PaginatedStudyInboxResponse {
  data: StudyInboxItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StudyInboxDetail {
  item: StudyInboxItem;
  signedUrl: string | null;
  nameMismatch: boolean;
}

/** Un grupo del split manual: las imágenes que van a UN estudio, con su nota. */
export interface ConfirmStudyInboxGroup {
  instanceIds: string[];
  note: string;
  /** Este grupo se lleva el informe PDF propio del item (solo uno puede). */
  includeReport?: boolean;
  /** Este grupo se lleva el informe PDF de otro item de "Para revisar". */
  reportAttachmentItemId?: string;
}

export interface ConfirmStudyInboxPayload {
  userId: string;
  date: string;
  note?: string;
  /** Split manual: reparte las imágenes del estudio DICOM en N estudios. */
  groups?: ConfirmStudyInboxGroup[];
}
