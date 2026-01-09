import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

export interface GetAllAppointmentsParams {
  page?: number;
  limit?: number;
  doctorId?: number;
  patientId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedAppointmentsResponse {
  data: AppointmentFullResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export const getAllAppointments = async (
  params?: GetAllAppointmentsParams
): Promise<PaginatedAppointmentsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.doctorId) queryParams.append('doctorId', String(params.doctorId));
  if (params?.patientId) queryParams.append('patientId', String(params.patientId));
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

  const { data } = await apiTurnos.get<PaginatedAppointmentsResponse>(
    `appointments?${queryParams.toString()}`
  );
  return data;
};
