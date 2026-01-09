import { apiTurnos } from "@/services/axiosConfig";

export const deleteOverturn = async (id: number): Promise<void> => {
  await apiTurnos.delete(`overturns/${id}`);
};
