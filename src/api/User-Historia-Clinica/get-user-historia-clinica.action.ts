import { apiIncorHC } from "@/services/axiosConfig";
import {
  AntecedentesResponse,
  MedicacionActualResponse,
  EvolucionesResponse
} from "@/types/Antecedentes/Antecedentes";

// Function overloads
export async function getUserHistoriaClinica(
  userId: number,
  section: 'antecedentes'
): Promise<AntecedentesResponse>;

export async function getUserHistoriaClinica(
  userId: number,
  section: 'medicacion-actual'
): Promise<MedicacionActualResponse>;

export async function getUserHistoriaClinica(
  userId: number,
  section: 'evoluciones'
): Promise<EvolucionesResponse>;

// Implementation
export async function getUserHistoriaClinica(
  userId: number,
  section: 'antecedentes' | 'medicacion-actual' | 'evoluciones'
): Promise<AntecedentesResponse | MedicacionActualResponse | EvolucionesResponse> {
  const { data } = await apiIncorHC.get(
    `/historia-clinica/${userId}/${section.toUpperCase()}`
  );
  return data;
}