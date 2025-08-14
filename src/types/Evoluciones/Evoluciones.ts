import { DataType } from "../Data-Type/Data-Type";

export interface EvolucionData {
  id: string;
  value: string;
  observaciones: string | null;
  dataType: DataType;
  createdAt: string;
}

export interface EvolucionDoctor {
  userId: number;
  firstName: string;
  lastName: string;
}

export interface Evolucion {
  id: string;
  createdAt: string;
  doctor: EvolucionDoctor;
  data: EvolucionData[];
}

export interface EvolucionesResponse {
  evoluciones: Evolucion[];
}