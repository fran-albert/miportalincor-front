import { apiIncorHC } from "@/services/axiosConfig";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const getNutritionDataByUserId = async (userId: string): Promise<NutritionData[]> => {
  const { data } = await apiIncorHC.get<NutritionData[]>(`/nutrition-data/user/${userId}`);
  return data;
}
