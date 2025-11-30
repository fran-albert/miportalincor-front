import { Patient } from "@/types/Patient/Patient";
import { UpdatePatientDto } from "@/types/Patient/UpdatePatient.dto";
import { apiIncorHC } from "@/services/axiosConfig";

export const updatePatient = async (id: string, patient: UpdatePatientDto) => {
    const { data } = await apiIncorHC.put<Patient>(`patient/${id}`, patient);
    return data;
}
