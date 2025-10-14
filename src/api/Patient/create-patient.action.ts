import { Patient } from "@/types/Patient/Patient";
import { apiIncor } from "@/services/axiosConfig";

export const createPatient = async (patient: Patient) => {
  try {
    const { data } = await apiIncor.post<Patient>(`/Patient/create`, patient);
    return data;
  } catch (error: unknown) {
    // Lanzar el error de Axios correctamente para que sea capturado
    throw error || "Error desconocido";
  }
};
