import { apiTurnos } from "@/services/axiosConfig";
import { DoctorAbsenceResponseDto } from "@/types/Doctor-Absence/Doctor-Absence";

export const getDoctorAbsences = async (
  doctorId: number
): Promise<DoctorAbsenceResponseDto[]> => {
  const { data } = await apiTurnos.get<DoctorAbsenceResponseDto[]>(
    `doctor-absence/doctor/${doctorId}`
  );
  return data;
};
