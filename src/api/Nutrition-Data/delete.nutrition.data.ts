import { apiIncorHC } from "@/services/axiosConfig";

export const deleteNutritionData = async (ids: string[]) => {
  const { data } = await apiIncorHC.delete<{ deletedCount: number }>("/nutrition-data", {
    data: { ids },
  });
  return data;
};
