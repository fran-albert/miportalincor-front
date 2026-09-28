import { Patient } from "@/types/Patient/Patient";
import { UpdatePatientDto } from "@/types/Patient/UpdatePatient.dto";
import { apiIncorHC } from "@/services/axiosConfig";

/** Respuesta de PUT /patient/:id. */
export interface UpdatedPatient extends Patient {
  /** true si al cambiar el DNI la clave de fabrica paso a ser el DNI nuevo. */
  passwordResetToNewDni?: boolean;
}

export const updatePatient = async (id: string, patient: UpdatePatientDto) => {
    const { data } = await apiIncorHC.put<UpdatedPatient>(`patient/${id}`, patient);
    return data;
}
