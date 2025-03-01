import { Patient } from "@/types/Patient/Patient";
import { apiIncor } from "@/services/axiosConfig";

export const updatePatient = async (id: number, patient: Patient) => {
    const { data } = await apiIncor.put<Patient>(`Patient/${id}`, patient);
    return data;
}
