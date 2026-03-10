import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";
import { OverturnDetailedDto } from "@/types/Overturn/Overturn";
import { DoctorAvailabilityResponseDto } from "@/types/DoctorAvailability/DoctorAvailability";
import { DoctorAbsenceResponseDto } from "@/types/Doctor-Absence/Doctor-Absence";
import { Holiday } from "@/types/Holiday/Holiday";
import { DoctorBookingSettingsResponseDto } from "@/types/DoctorBookingSettings/DoctorBookingSettings";
import { BlockedSlotResponseDto } from "@/types/BlockedSlot/BlockedSlot";
import { MyDoctorProfile } from "./get-my-doctor-profile.action";

export interface DoctorDashboardParams {
  dateFrom: string;
  dateTo: string;
  selectedWeekStart?: string;
  selectedWeekEnd?: string;
}

export interface DoctorDashboardResponse {
  doctor: MyDoctorProfile;
  bookingSettings: DoctorBookingSettingsResponseDto | null;
  holidays: Holiday[];
  availability: DoctorAvailabilityResponseDto[];
  absences: DoctorAbsenceResponseDto[];
  todayAppointments: AppointmentFullResponseDto[];
  todayOverturns: OverturnDetailedDto[];
  calendarAppointments: AppointmentFullResponseDto[];
  calendarOverturns: OverturnDetailedDto[];
  slotsRange: Record<string, string[]>;
  blockedSlots: BlockedSlotResponseDto[];
}

export const getDoctorDashboardById = async (
  doctorId: number,
  params: DoctorDashboardParams
): Promise<DoctorDashboardResponse> => {
  const { data } = await apiTurnos.get<DoctorDashboardResponse>(
    `/doctors/${doctorId}/dashboard`,
    { params }
  );
  return data;
};

export const getMyDashboard = async (
  params: DoctorDashboardParams
): Promise<DoctorDashboardResponse> => {
  const { data } = await apiTurnos.get<DoctorDashboardResponse>(
    "/doctors/me/dashboard",
    { params }
  );
  return data;
};
