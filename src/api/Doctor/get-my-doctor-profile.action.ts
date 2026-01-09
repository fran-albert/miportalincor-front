import { apiTurnos } from "@/services/axiosConfig";

export interface MyDoctorProfile {
  userId: number;
  firstName: string;
  lastName: string;
  specialities?: Array<{ id: number; name: string }>;
}

/**
 * Obtiene el perfil del médico logueado desde el backend de turnos.
 * Este endpoint está protegido y solo accesible por usuarios con rol Doctor.
 */
export const getMyDoctorProfile = async (): Promise<MyDoctorProfile> => {
  const { data } = await apiTurnos.get<MyDoctorProfile>('/doctors/me');
  return data;
};
