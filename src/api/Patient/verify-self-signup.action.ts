import { apiIncorHC } from "@/services/axiosConfig";
import { Patient } from "@/types/Patient/Patient";

/** Recepción vio el DNI y la credencial: guarda quién y cuándo. */
export const verifySelfSignupPatient = async (userId: string | number) => {
  const { data } = await apiIncorHC.patch<Patient>(`patient/${userId}/verify`);
  return data;
};

/** "El DNI no es de esta persona": solo Admin, con motivo. */
export const deactivateSelfSignupPatient = async (
  userId: string | number,
  reason: string
) => {
  const { data } = await apiIncorHC.patch<{ message: string }>(
    `patient/${userId}/deactivate`,
    { reason }
  );
  return data;
};
