import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";

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

export interface MedicacionActual {
  id: string;
  idUserHistoriaClinica: string;
  idDoctor: string;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  startDate: string;
  status: 'ACTIVE' | 'SUSPENDED';
  observations?: string;
  suspensionDate?: string;
  suspensionReason?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  doctor?: {
    userId: number;
    firstName: string;
    lastName: string;
  };
}

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

export interface MedicacionActualResponse extends Array<MedicacionActual> {}

export interface EvolucionesResponse {
  evoluciones: Evolucion[];
}