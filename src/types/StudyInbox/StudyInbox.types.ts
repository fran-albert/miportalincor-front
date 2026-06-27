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
  detectedPatientName: string | null;
  detectedDni: string | null;
  detectedLabFicha: string | null;
  detectedLabIngreso: string | null;
  detectedStudyDate: string | null;
  detectedInstitution: string | null;
  suggestedPatientUserId: string | null;
  matchConfidence: MatchConfidence | null;
  status: StudyInboxStatus;
  confirmedStudyId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
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

export interface ConfirmStudyInboxPayload {
  userId: string;
  date: string;
  note?: string;
}
