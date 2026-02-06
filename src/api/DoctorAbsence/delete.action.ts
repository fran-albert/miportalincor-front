import { apiTurnos } from "@/services/axiosConfig";

export const deleteDoctorAbsence = async (id: number): Promise<void> => {
  await apiTurnos.delete(`doctor-absence/${id}`);
};
