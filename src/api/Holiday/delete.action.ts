import { apiTurnos } from "@/services/axiosConfig";

export const deleteHoliday = async (id: number): Promise<void> => {
  await apiTurnos.delete(`holidays/${id}`);
};
