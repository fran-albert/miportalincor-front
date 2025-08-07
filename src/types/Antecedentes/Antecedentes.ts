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
  name: string;
  value: string;
  createdAt: string;
}

export interface Evolucion extends Base {
  value: string;
  observaciones: string | null
  dataType: DataType,
  doctor: {
    userId: number,
    firstName: string;
    lastName: string;
  }
}

export interface AntecedentesResponse {
  antecedentes: Antecedente[];
}

export interface MedicacionActualResponse {
  medicacionActual: MedicacionActual[];
}

export interface EvolucionesResponse {
  evoluciones: Evolucion[];
}