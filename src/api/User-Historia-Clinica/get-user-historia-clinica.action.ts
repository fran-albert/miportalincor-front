import { apiIncorHC } from "@/services/axiosConfig";
import {
  AntecedentesResponse,
  MedicacionActualResponse,
  EvolucionesResponse,
  MedicacionActualQueryParams,
  AntecedentesQueryParams,
} from "@/types/Antecedentes/Antecedentes";

// Function overloads
export async function getUserHistoriaClinica(
  userId: number,
  section: 'antecedentes',
  queryParams?: AntecedentesQueryParams
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
  queryParams?: AntecedentesQueryParams | MedicacionActualQueryParams
): Promise<AntecedentesResponse | MedicacionActualResponse | EvolucionesResponse> {
  const url = `/historia-clinica/${userId}/${section}`;

  // Add query parameters only for medicacion-actual
  if (section === 'medicacion-actual' && queryParams) {
    const params: Record<string, string> = {};
    const medicacionQuery = queryParams as MedicacionActualQueryParams;

    if (medicacionQuery.status) params.status = medicacionQuery.status;
    if (medicacionQuery.includeDoctor !== undefined) params.includeDoctor = String(medicacionQuery.includeDoctor);
    if (medicacionQuery.orderBy) params.orderBy = medicacionQuery.orderBy;
    if (medicacionQuery.orderDirection) params.orderDirection = medicacionQuery.orderDirection;
    if (medicacionQuery.limit !== undefined) params.limit = String(medicacionQuery.limit);
    if (medicacionQuery.offset !== undefined) params.offset = String(medicacionQuery.offset);


    const { data } = await apiIncorHC.get(url, { params });
    return data;
  }

  if (section === 'antecedentes' && queryParams) {
    const params: Record<string, string> = {};
    const antecedentesQuery = queryParams as AntecedentesQueryParams;

    if (antecedentesQuery.includeDeleted !== undefined) {
      params.includeDeleted = String(antecedentesQuery.includeDeleted);
    }

    const { data } = await apiIncorHC.get(url, { params });
    return data;
  }

  const { data } = await apiIncorHC.get(url);
  return data;
}
