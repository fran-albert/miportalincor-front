import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";
import { CurrentMedication } from "../Current-Medication/Current-Medication";

export interface AntecedenteDoctor {
  userId: string | number;
  firstName: string;
  lastName: string;
}

export interface AntecedenteHistoryItem extends Base {
  value: string;
  observaciones: string | null;
  correctionReason?: string | null;
  dataType: DataType;
  doctor?: AntecedenteDoctor;
}

export interface Antecedente extends Base {
  value: string;
  observaciones: string | null;
  correctionReason?: string | null;
  isCurrent?: boolean;
  dataType: DataType;
  doctor: AntecedenteDoctor;
  deletedByDoctor?: AntecedenteDoctor;
  history: AntecedenteHistoryItem[];
}

// Re-export CurrentMedication as MedicacionActual for backwards compatibility
export type MedicacionActual = CurrentMedication;

export interface MedicacionActualQueryParams {
  status?: 'ACTIVE' | 'SUSPENDED' | 'ALL';
  includeDoctor?: boolean;
  orderBy?: 'startDate' | 'createdAt' | 'medicationName' | 'status';
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface AntecedentesQueryParams {
  includeDeleted?: boolean;
}

export interface EvolucionData extends Base {
  value: string;
  observaciones: string | null;
  dataType: DataType;
}

export interface Evolucion extends Base {
  doctor: {
    userId: number;
    firstName: string;
    lastName: string;
    specialities: {
      id: number;
      name: string;
    }[];
  };
  data: EvolucionData[];
}

export interface AntecedentesResponse {
  antecedentes: Antecedente[];
}

export type MedicacionActualResponse = MedicacionActual[];

export interface EvolucionesResponse {
  evoluciones: Evolucion[];
}
