import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";
import { CurrentMedication } from "../Current-Medication/Current-Medication";

export interface Antecedente extends Base {
  value: string;
  observaciones: string | null
  dataType: DataType,
  doctor: {
    userId: number,
    firstName: string;
    lastName: string;
  }
}

// Re-export CurrentMedication as MedicacionActual for backwards compatibility
export type MedicacionActual = CurrentMedication & {
  doctor?: {
    userId: number;
    firstName: string;
    lastName: string;
  };
};

export interface MedicacionActualQueryParams {
  status?: 'ACTIVE' | 'SUSPENDED' | 'ALL';
  includeDoctor?: boolean;
  orderBy?: 'startDate' | 'createdAt' | 'medicationName' | 'status';
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
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