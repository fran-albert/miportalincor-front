import axiosInstance from "@/services/axiosConfig";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const getNutritionDataByUserId = async (userId: number): Promise<NutritionData[]> => {
  const { data } = await axiosInstance.get<NutritionData[]>(`NutritionData/userId`, {
    params: { userId }
  });
  return data;
}
