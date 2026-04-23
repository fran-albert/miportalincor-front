import { Doctor } from "@/types/Doctor/Doctor";
import { apiIncorHC } from "@/services/axiosConfig";

export interface ConvertPatientToDoctorDto {
  matricula: string;
  firma?: string;
  sello?: string;
  specialities?: { id: number; name: string }[];
  healthInsurances?: { id: number; name: string }[];
}

export const convertPatientToDoctor = async (
  userName: string,
  data: ConvertPatientToDoctorDto
) => {
  const { data: result } = await apiIncorHC.post<Doctor>(
    `/doctor/convert-from-patient/${userName}`,
    data
  );
  return result;
};
