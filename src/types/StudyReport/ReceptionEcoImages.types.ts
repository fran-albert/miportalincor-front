export type ReceptionReportState =
  "SIN_EMPEZAR" | "BORRADOR" | "FIRMADO" | "PARCIAL";

export interface ReceptionEcoReport {
  id: string;
  splitLabel: string | null;
  status: "BORRADOR" | "FIRMADO";
}

export interface ReceptionEcoItem {
  sourceInboxItemId: string;
  patientName: string | null;
  patientDni: string | null;
  studyDate: string | null;
  studyType: string | null;
  doctorName: string | null;
  reportState: ReceptionReportState;
  reports: ReceptionEcoReport[];
  uploadedImageCount: number;
}

export interface ReceptionUploadedImage {
  id: string;
  originalName: string;
  studyReportId: string | null;
  splitLabel: string | null;
  attachedToHistory: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface UploadReceptionEcoImagesResult {
  uploaded: number;
  pendingSignature: number;
  attachedToHistory: number;
}
