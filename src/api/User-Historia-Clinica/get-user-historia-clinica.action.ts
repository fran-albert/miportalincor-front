import { apiIncorHC } from "@/services/axiosConfig";
import {
  AntecedentesResponse,
  MedicacionActualResponse,
  EvolucionesResponse,
  MedicacionActualQueryParams
} from "@/types/Antecedentes/Antecedentes";

// Function overloads
export async function getUserHistoriaClinica(
  userId: number,
  section: 'antecedentes'
): Promise<AntecedentesResponse>;

export async function getUserHistoriaClinica(
  userId: number,
  section: 'medicacion-actual',
  queryParams?: MedicacionActualQueryParams
): Promise<MedicacionActualResponse>;

export async function getUserHistoriaClinica(
  userId: number,
  section: 'evoluciones'
): Promise<EvolucionesResponse>;

// Implementation
export async function getUserHistoriaClinica(
  userId: number,
  section: 'antecedentes' | 'medicacion-actual' | 'evoluciones',
  queryParams?: MedicacionActualQueryParams
): Promise<AntecedentesResponse | MedicacionActualResponse | EvolucionesResponse> {
  const url = `/historia-clinica/${userId}/${section}`;

  // Add query parameters only for medicacion-actual
  if (section === 'medicacion-actual' && queryParams) {
    const params: Record<string, string> = {};

    if (queryParams.status) params.status = queryParams.status;
    if (queryParams.includeDoctor !== undefined) params.includeDoctor = String(queryParams.includeDoctor);
    if (queryParams.orderBy) params.orderBy = queryParams.orderBy;
    if (queryParams.orderDirection) params.orderDirection = queryParams.orderDirection;
    if (queryParams.limit !== undefined) params.limit = String(queryParams.limit);
    if (queryParams.offset !== undefined) params.offset = String(queryParams.offset);


    const { data } = await apiIncorHC.get(url, { params });
    return data;
  }

  const { data } = await apiIncorHC.get(url);
  return data;
}