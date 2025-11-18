import { Patient } from "@/types/Patient/Patient";
import { apiIncorHC } from "@/services/axiosConfig";

export const createPatient = async (patient: Patient) => {
  try {
    const { data } = await apiIncorHC.post<Patient>(`/patient`, patient);
    return data;
  } catch (error: unknown) {
    // Lanzar el error de Axios correctamente para que sea capturado
    throw error || "Error desconocido";
  }
};
