import { apiIncorHC } from "@/services/axiosConfig";

export const deleteProgram = async (id: string): Promise<void> => {
  await apiIncorHC.delete(`/programs/${id}`);
};
