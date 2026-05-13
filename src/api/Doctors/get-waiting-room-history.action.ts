import { apiTurnos } from "@/services/axiosConfig";
import type { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";
import type { OverturnDetailedDto } from "@/types/Overturn/Overturn";

export type DoctorWaitingRoomHistoryPreset =
  | "today"
  | "yesterday"
  | "last7"
  | "date"
  | "range";

export interface DoctorWaitingRoomHistoryParams {
  preset?: DoctorWaitingRoomHistoryPreset;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DoctorWaitingRoomHistoryResponse {
  preset: DoctorWaitingRoomHistoryPreset;
  timezone: "America/Argentina/Buenos_Aires";
  dateFrom: string;
  dateTo: string;
  requestedDates: string[];
  workedDates: string[];
  nonWorkingDates: string[];
  appointments: AppointmentFullResponseDto[];
  overturns: OverturnDetailedDto[];
}

export const getDoctorWaitingRoomHistory = async (
  params: DoctorWaitingRoomHistoryParams,
): Promise<DoctorWaitingRoomHistoryResponse> => {
  const { data } = await apiTurnos.get<DoctorWaitingRoomHistoryResponse>(
    "doctors/me/waiting-room-history",
    { params },
  );
  return data;
};
