import { Patient } from "@/types/Patient/Patient";
import axiosInstance from "@/services/axiosConfig";

export const updatePatient = async (id: number, patient: Patient) => {
    const { data } = await axiosInstance.put<Patient>(`Patient/${id}`, patient);
    return data;
}
