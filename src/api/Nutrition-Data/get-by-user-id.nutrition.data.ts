import { apiIncor } from "@/services/axiosConfig";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const getNutritionDataByUserId = async (userId: number): Promise<NutritionData[]> => {
  const { data } = await apiIncor.get<NutritionData[]>(`NutritionData/userId`, {
    params: { userId }
  });
  return data;
}
