import { apiTurnos } from "@/services/axiosConfig";
import { CreateDoctorAbsenceDto, DoctorAbsenceResponseDto } from "@/types/Doctor-Absence/Doctor-Absence";

export const createDoctorAbsence = async (dto: CreateDoctorAbsenceDto): Promise<DoctorAbsenceResponseDto> => {
  const { data } = await apiTurnos.post<DoctorAbsenceResponseDto>('doctor-absence', dto);
  return data;
};
