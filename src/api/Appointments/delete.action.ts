import { apiTurnos } from "@/services/axiosConfig";

export const deleteAppointment = async (id: number): Promise<void> => {
  await apiTurnos.delete(`appointments/${id}`);
};
