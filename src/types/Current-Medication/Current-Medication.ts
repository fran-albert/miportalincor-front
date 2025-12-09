import { Base } from "../Base/Base";

export interface CurrentMedication extends Base {
  idUserHistoriaClinica: string;
  idDoctor: string;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  startDate: string;
  status: MedicationStatus;
  observations?: string;
  suspensionDate?: string;
  suspensionReason?: string;
}

export enum MedicationStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}

export interface CurrentMedicationResponse {
  currentMedications: CurrentMedication[];
  total: number;
}

export interface CreateCurrentMedicationDto {
  idUser: string;
  idDoctor: string;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  startDate: string;
  observations?: string;
}

export interface UpdateCurrentMedicationDto {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  observations?: string;
  startDate?: string;
}

export interface SuspendCurrentMedicationDto {
  suspensionReason: string;
}

export type ReactivateCurrentMedicationDto = Record<string, never>;

export interface CurrentMedicationFilters {
  status?: MedicationStatus;
  medicationName?: string;
  idDoctor?: string;
  startDateFrom?: string;
  startDateTo?: string;
}