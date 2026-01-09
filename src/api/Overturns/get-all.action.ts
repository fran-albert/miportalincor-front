import { apiTurnos } from "@/services/axiosConfig";
import { OverturnDetailedDto } from "@/types/Overturn/Overturn";

export interface GetAllOverturnsParams {
  page?: number;
  limit?: number;
  doctorId?: number;
  patientId?: number;
  status?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedOverturnsResponse {
  data: OverturnDetailedDto[];
  total: number;
  page: number;
  limit: number;
}

export const getAllOverturns = async (
  params?: GetAllOverturnsParams
): Promise<PaginatedOverturnsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.doctorId) queryParams.append('doctorId', String(params.doctorId));
  if (params?.patientId) queryParams.append('patientId', String(params.patientId));
  if (params?.status) queryParams.append('status', params.status);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

  const { data } = await apiTurnos.get<PaginatedOverturnsResponse>(
    `overturns?${queryParams.toString()}`
  );
  return data;
};
